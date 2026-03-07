"use server";

import { prisma } from "@/lib/db";

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;

export type PublicSupporter = {
  id: string;
  fullName: string;
  country: string;
  affiliation: string | null;
};

export async function getSupportersCount(): Promise<number> {
  return prisma.supporter.count({
    where: { isApproved: true },
  });
}

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

  const where = {
    isApproved: true,
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { country: { contains: search, mode: "insensitive" as const } },
            { affiliation: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [supporters, total] = await Promise.all([
    prisma.supporter.findMany({
      where,
      select: { id: true, fullName: true, country: true, affiliation: true },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.supporter.count({ where }),
  ]);

  return { supporters, total };
}
