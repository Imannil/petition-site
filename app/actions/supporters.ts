"use server";

import { prisma } from "@/lib/db";

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
  return prisma.supporter.count({
    where: { isApproved: true },
  });
}

/**
 * Returns supporters for public display: initial supporters first (pinned),
 * then all other approved supporters in alphabetical order by full name.
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
  const search = typeof options.search === "string" ? options.search.trim() : "";

  const searchWhere = search
    ? {
        isApproved: true as const,
        OR: [
          { fullName: { contains: search, mode: "insensitive" as const } },
          { country: { contains: search, mode: "insensitive" as const } },
          { affiliation: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : { isApproved: true as const };

  // Pinned initial supporters: always first, ordered alphabetically by full name
  const initialSupporters = await prisma.supporter.findMany({
    where: { ...searchWhere, isInitialSupporter: true },
    select: { id: true, fullName: true, country: true, affiliation: true },
    orderBy: { fullName: "asc" },
  });

  const totalInitial = initialSupporters.length;
  const totalOthers = await prisma.supporter.count({
    where: { ...searchWhere, isInitialSupporter: false },
  });
  const total = totalInitial + totalOthers;

  // Page 1: initial supporters + first (pageSize - totalInitial) others
  // Page 2+: only others, with skip/take adjusted
  const othersSkip =
    page === 1 ? 0 : Math.max(0, (page - 1) * pageSize - totalInitial);
  const othersTake =
    page === 1
      ? Math.max(0, pageSize - totalInitial)
      : Math.min(pageSize, totalOthers - othersSkip);

  const includeInitialOnPage = page === 1 && totalInitial > 0;
  const initialPortion = includeInitialOnPage ? initialSupporters : [];

  const others = await prisma.supporter.findMany({
    where: { ...searchWhere, isInitialSupporter: false },
    select: { id: true, fullName: true, country: true, affiliation: true },
    orderBy: { fullName: "asc" },
    skip: othersSkip,
    take: othersTake,
  });

  const supporters: PublicSupporter[] = [
    ...initialPortion.map((s: { id: string; fullName: string; country: string; affiliation: string | null }) => ({
      ...s,
      isInitialSupporter: true as const,
    })),
    ...others.map((s: { id: string; fullName: string; country: string; affiliation: string | null }) => ({
      ...s,
      isInitialSupporter: false as const,
    })),
  ];

  return { supporters, total };
}
