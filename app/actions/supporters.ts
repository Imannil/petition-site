"use server";

import { prisma } from "@/lib/db";
import { initialSignatories } from "@/content/initial-signatories";
import { getLastNameForSort, getFirstNamesFromFullName, getLastWordFromFullName } from "@/lib/formatName";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

export type PublicSupporter = {
  id: string;
  fullName: string;
  firstName?: string | null;
  lastName?: string | null;
  country: string;
  affiliation: string | null;
  isInitialSupporter: boolean;
};

export async function getSupportersCount(): Promise<number> {
  const totalOthers = await prisma.supporter.count({
    where: { isApproved: true, isInitialSupporter: false },
  });
  return initialSignatories.length + totalOthers;
}

/**
 * Returns supporters for public display: initial supporters first (pinned, from content file),
 * then all other approved supporters from the DB. Both groups sorted alphabetically by last name.
 * Pagination accounts for initial supporters on page 1.
 */
export async function getPublicSupporters(options: {
  page?: number;
  pageSize?: number;
  search?: string;
}): Promise<{ supporters: PublicSupporter[]; total: number }> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, options.pageSize ?? DEFAULT_PAGE_SIZE)
  );
  const search = typeof options.search === "string" ? options.search.trim().toLowerCase() : "";

  // --- Pinned initial supporters: from content file (so deploys always show current list) ---
  let initialList: PublicSupporter[] = initialSignatories.map((s, i) => ({
    id: `initial-${i}`,
    fullName: s.fullName,
    firstName: getFirstNamesFromFullName(s.fullName) || null,
    lastName: getLastWordFromFullName(s.fullName) || null,
    country: s.country,
    affiliation: s.affiliation ?? null,
    isInitialSupporter: true as const,
  }));

  if (search) {
    initialList = initialList.filter(
      (s) =>
        s.fullName.toLowerCase().includes(search) ||
        s.country.toLowerCase().includes(search) ||
        (s.affiliation?.toLowerCase().includes(search) ?? false)
    );
  }

  initialList.sort((a, b) =>
    getLastNameForSort(a.fullName).localeCompare(getLastNameForSort(b.fullName))
  );

  const totalInitial = initialList.length;

  // --- Other supporters: from DB, sorted by last name ---
  const searchWhere = search
    ? {
        isApproved: true as const,
        isInitialSupporter: false as const,
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { country: { contains: search, mode: "insensitive" as const } },
          { affiliation: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { isApproved: true as const, isInitialSupporter: false as const };

  const totalOthers = await prisma.supporter.count({
    where: searchWhere,
  });
  const total = totalInitial + totalOthers;

  const othersSkip =
    page === 1 ? 0 : Math.max(0, (page - 1) * pageSize - totalInitial);
  const othersTake =
    page === 1
      ? Math.max(0, pageSize - totalInitial)
      : Math.min(pageSize, totalOthers - othersSkip);

  const includeInitialOnPage = page === 1 && totalInitial > 0;
  const initialPortion = includeInitialOnPage ? initialList : [];

  type OtherRow = { id: string; fullName: string; firstName: string | null; lastName: string | null; country: string; affiliation: string | null };
  let others: OtherRow[];
  try {
    others = await prisma.supporter.findMany({
      where: searchWhere,
      select: { id: true, fullName: true, firstName: true, lastName: true, country: true, affiliation: true },
      orderBy: { lastName: "asc" },
      skip: othersSkip,
      take: othersTake,
    });
  } catch {
    // DB may not have last_name column yet — use fullName order until you run: npx prisma db push && npm run db:seed
    others = await prisma.supporter.findMany({
      where: searchWhere,
      select: { id: true, fullName: true, firstName: true, lastName: true, country: true, affiliation: true },
      orderBy: { fullName: "asc" },
      skip: othersSkip,
      take: othersTake,
    });
  }

  const supporters: PublicSupporter[] = [
    ...initialPortion,
    ...others.map((s: OtherRow) => ({
      id: s.id,
      fullName: s.fullName,
      firstName: s.firstName,
      lastName: s.lastName,
      country: s.country,
      affiliation: s.affiliation,
      isInitialSupporter: false as const,
    })),
  ];

  return { supporters, total };
}
