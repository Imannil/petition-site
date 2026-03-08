import { PrismaClient } from "@prisma/client";
import { initialSignatories } from "../content/initial-signatories";

const prisma = new PrismaClient();

/**
 * Emails for initial supporters (same order as initialSignatories).
 * Stored only in the database; never exposed in the UI or API.
 */
const INITIAL_SUPPORTER_EMAILS: string[] = [
  "hd14@columbia.edu",
  "mohsen.kadivar@duke.edu",
  "smousavian@luc.edu",
  "heydar.davoudi@northwestern.edu",
  "omid.safi@duke.edu",
  "afarhang1349@ias.edu",
  "doostdar@uchicago.edu",
  "samouei@tamu.edu",
  "sadri@lakeforest.edu",
  "Seyed_Emadi@kenan-flagler.unc.edu",
  "arman.rahmim@ubc.ca",
  "mohammadsaleh.zarepour@manchester.ac.uk",
  "jrcole@umich.edu",
  "msadri@twu.edu",
];

function firstName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || fullName;
}

async function main() {
  // Re-sync initial supporters from content/initial-signatories (replaces any existing ones)
  const toInsert = initialSignatories.map((s, i) => ({
    fullName: s.fullName,
    firstName: firstName(s.fullName),
    email: INITIAL_SUPPORTER_EMAILS[i] ?? `initial-${i + 1}@stopiranwar.org`,
    country: s.country,
    affiliation: s.affiliation ?? null,
    consentGiven: true,
    isApproved: true,
    isInitialSupporter: true,
  }));

  // Remove old initial supporters so we can re-seed with the current list
  await prisma.supporter.deleteMany({
    where: { isInitialSupporter: true },
  });

  for (const row of toInsert) {
    await prisma.supporter.upsert({
      where: { email: row.email },
      create: row,
      update: {
        fullName: row.fullName,
        firstName: row.firstName,
        country: row.country,
        affiliation: row.affiliation,
      },
    });
  }
  console.log(`Seeded ${toInsert.length} initial supporters.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
