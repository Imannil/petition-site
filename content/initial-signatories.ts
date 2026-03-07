/**
 * Initial signatories (credibility supporters).
 * Full name, country, affiliation only — no email (emails are stored only in the database).
 * These appear in the "Initial Signatories" section and are seeded into the DB for the public list.
 * To add more: append to the array below and add the corresponding email in prisma/seed.ts.
 */

export type InitialSignatory = {
  fullName: string;
  country: string;
  affiliation?: string;
};

export const initialSignatories: InitialSignatory[] = [
  {
    fullName: "Hamid Dabashi",
    country: "United States",
    affiliation: "Columbia University",
  },
  {
    fullName: "Mohsen Kadivar",
    country: "United States",
    affiliation: "Duke University",
  },
  {
    fullName: "Seyed N. Mousavian",
    country: "United States",
    affiliation: "Loyola University Chicago",
  },
  {
    fullName: "Heydar Davoudi",
    country: "United States",
    affiliation: "Northwestern University",
  },
];
