import { prisma } from "../lib/db";
import { initialSignatories } from "../content/initial-signatories";
import { getLastNameForSort, getFirstNamesFromFullName, getLastWordFromFullName } from "../lib/formatName";

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
  "ervand_abrahamian@baruch.cuny.edu",
  "zvessal@gmail.com",
  "hkamaly@hartfordinternational.edu",
  "ghoddoussi.farhad@gmail.com",
  "abdulkarimsoroush@gmail.com",
  "abbas.amanat@yale.edu",
];

async function main() {
  // Re-sync initial supporters from content/initial-signatories (replaces any existing ones)
  // Use full given name (all but last word) for firstName so list shows "Lastname, Firstname Middlename"
  const toInsert = initialSignatories.map((s, i) => ({
    fullName: s.fullName,
    firstName: getFirstNamesFromFullName(s.fullName) || s.fullName.trim().split(/\s+/)[0] || s.fullName,
    lastName: getLastNameForSort(s.fullName),
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
        lastName: row.lastName,
        country: row.country,
        affiliation: row.affiliation,
      },
    });
  }
  console.log(`Seeded ${toInsert.length} initial supporters.`);

  // Backfill firstName and lastName from fullName for existing supporters (legacy records)
  const withoutLastName = await prisma.supporter.findMany({
    where: { lastName: null },
    select: { id: true, fullName: true },
  });
  for (const s of withoutLastName) {
    await prisma.supporter.update({
      where: { id: s.id },
      data: {
        firstName: getFirstNamesFromFullName(s.fullName) || s.fullName.trim().split(/\s+/)[0] || s.fullName,
        lastName: getLastWordFromFullName(s.fullName) || getLastNameForSort(s.fullName),
      },
    });
  }
  if (withoutLastName.length > 0) {
    console.log(`Backfilled firstName/lastName for ${withoutLastName.length} existing supporters.`);
  }

  // Ensure every supporter has full given name in firstName (e.g. "Ali Reza" not just "Ali")
  const all = await prisma.supporter.findMany({
    select: { id: true, fullName: true, firstName: true },
  });
  let updated = 0;
  for (const s of all) {
    const fullFirst = getFirstNamesFromFullName(s.fullName);
    if (!fullFirst) continue;
    if (fullFirst !== s.firstName) {
      await prisma.supporter.update({
        where: { id: s.id },
        data: { firstName: fullFirst },
      });
      updated++;
    }
  }
  if (updated > 0) {
    console.log(`Normalized full first name for ${updated} supporters.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
