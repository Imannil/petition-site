"use server";

import { initialSignatories } from "@/content/initial-signatories";
import { prisma } from "@/lib/db";

export type InitialSupporterDisplay = {
  fullName: string;
  country: string;
  affiliation: string | null;
};

/**
 * Prefer DB-backed initial supporters (after seed) so names stay in sync with public list.
 * When the static list has entries, use it as fallback so the section is never empty.
 */
export async function getInitialSupporters(): Promise<InitialSupporterDisplay[]> {
  const staticList = initialSignatories.map((s) => ({
    fullName: s.fullName,
    country: s.country,
    affiliation: s.affiliation ?? null,
  }));

  if (!process.env.DATABASE_URL) {
    return staticList;
  }
  try {
    const fromDb = await prisma.supporter.findMany({
      where: { isInitialSupporter: true, isApproved: true },
      select: { fullName: true, country: true, affiliation: true },
      orderBy: { createdAt: "asc" },
      take: 80,
    });

    if (fromDb.length > 0) {
      return fromDb.map((s: InitialSupporterDisplay) => ({
        fullName: s.fullName,
        country: s.country,
        affiliation: s.affiliation,
      }));
    }
  } catch {
    // Fall through to static list
  }

  return staticList;
}
