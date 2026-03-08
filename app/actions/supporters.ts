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
 * Base where clause for non-initial supporters (optionally with search).
 */
function othersSearchWhere(search: string) {
  const base = {
    isApproved: true as const,
    isInitialSupporter: false as const,
  };
  if (!search) return base;
  return {
    ...base,
    OR: [
      { fullName: { contains: search, mode: "insensitive" as const } },
      { country: { contains: search, mode: "insensitive" as const } },
      { affiliation: { contains: search, mode: "insensitive" as const } },
    ],
  };
}

/**
 * Returns supporters for public display in this order:
 * 1. Pinned initial supporters (from content file), sorted by last name
 * 2. Regular supporters who have an affiliation, sorted by last name
 * 3. Regular supporters without affiliation, sorted by last name
 * Affiliation is "present" when non-null and non-empty (trim not applied in DB).
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
  const searchWhere = othersSearchWhere(search);

  // --- 1. Pinned initial supporters: from content file, sorted by last name ---
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
  const includeInitialOnPage = page === 1 && totalInitial > 0;
  const initialPortion = includeInitialOnPage ? initialList : [];

  // --- 2 & 3. Regular supporters: with affiliation first, then without; each group sorted by last name ---
  const withAffiliationWhere = {
    ...searchWhere,
    AND: [
      { affiliation: { not: null } },
      { affiliation: { not: "" } },
    ],
  };
  const withoutAffiliationWhere = {
    ...searchWhere,
    OR: [
      { affiliation: null },
      { affiliation: "" },
    ],
  };

  const [totalWithAffiliation, totalWithoutAffiliation] = await Promise.all([
    prisma.supporter.count({ where: withAffiliationWhere }),
    prisma.supporter.count({ where: withoutAffiliationWhere }),
  ]);

  const totalOthers = totalWithAffiliation + totalWithoutAffiliation;
  const total = totalInitial + totalOthers;

  // Pagination: "others" start index and how many we need this page
  const othersStart = page === 1 ? 0 : Math.max(0, (page - 1) * pageSize - totalInitial);
  const othersTake = page === 1
    ? Math.max(0, pageSize - totalInitial)
    : Math.min(pageSize, totalOthers - othersStart);

  type OtherRow = { id: string; fullName: string; firstName: string | null; lastName: string | null; country: string; affiliation: string | null };

  const orderByLastName = { lastName: "asc" as const };
  const orderByFullName = { fullName: "asc" as const };
  const select = { id: true, fullName: true, firstName: true, lastName: true, country: true, affiliation: true };

  async function fetchOthers(where: object, skip: number, take: number): Promise<OtherRow[]> {
    if (take <= 0) return [];
    try {
      return await prisma.supporter.findMany({
        where,
        select,
        orderBy: orderByLastName,
        skip,
        take,
      });
    } catch {
      return await prisma.supporter.findMany({
        where,
        select,
        orderBy: orderByFullName,
        skip,
        take,
      });
    }
  }

  let withRows: OtherRow[] = [];
  let withoutRows: OtherRow[] = [];

  if (othersTake > 0) {
    const withSkip = Math.min(othersStart, totalWithAffiliation);
    const withTake = Math.min(othersTake, totalWithAffiliation - withSkip);
    const withoutSkip = Math.max(0, othersStart - totalWithAffiliation);
    const withoutTake = othersTake - withTake;

    const [withFetched, withoutFetched] = await Promise.all([
      fetchOthers(withAffiliationWhere, withSkip, withTake),
      fetchOthers(withoutAffiliationWhere, withoutSkip, withoutTake),
    ]);
    withRows = withFetched;
    withoutRows = withoutFetched;
  }

  const others: PublicSupporter[] = [
    ...withRows.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      firstName: s.firstName,
      lastName: s.lastName,
      country: s.country,
      affiliation: s.affiliation,
      isInitialSupporter: false as const,
    })),
    ...withoutRows.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      firstName: s.firstName,
      lastName: s.lastName,
      country: s.country,
      affiliation: s.affiliation,
      isInitialSupporter: false as const,
    })),
  ];

  const supporters: PublicSupporter[] = [...initialPortion, ...others];

  return { supporters, total };
}
