"use server";

import { prisma } from "@/lib/db";
import { initialSignatories } from "@/content/initial-signatories";
import { getLastNameForSort } from "@/lib/formatName";

const DEFAULT_PAGE_SIZE = 100;
const MAX_PAGE_SIZE = 100;

export type PublicSupporter = {
  id: string;
  fullName: string;
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

  // Use fullName for ordering so this works even when last_name column doesn't exist yet.
  // After running `npx prisma db push`, you can switch to orderBy: { lastName: "asc" } for last-name sort.
  const others = await prisma.supporter.findMany({
    where: searchWhere,
    select: { id: true, fullName: true, country: true, affiliation: true },
    orderBy: { fullName: "asc" },
    skip: othersSkip,
    take: othersTake,
  });

  const supporters: PublicSupporter[] = [
    ...initialPortion,
    ...others.map((s: { id: string; fullName: string; country: string; affiliation: string | null }) => ({
      id: s.id,
      fullName: s.fullName,
      country: s.country,
      affiliation: s.affiliation,
      isInitialSupporter: false as const,
    })),
  ];

  return { supporters, total };
}
