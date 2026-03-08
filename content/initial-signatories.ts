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
  {
    fullName: "Omid Safi",
    country: "United States",
    affiliation: "Duke University",
  },
  {
    fullName: "Hassan Ansari",
    country: "United States",
    affiliation: "Institute for Advanced Study",
  },
  {
    fullName: "Alireza Doostdar",
    country: "United States",
    affiliation: "University of Chicago",
  },
  {
    fullName: "Hamidreza Samouei",
    country: "United States",
    affiliation: "Texas A&M University",
  },
  {
    fullName: "Ahmad Sadri",
    country: "United States",
    affiliation: "Lake Forest College",
  },
  {
    fullName: "Seyed Morteza Emadi",
    country: "United States",
    affiliation: "University of North Carolina-Chapel Hill",
  },
  {
    fullName: "Arman Rahmim",
    country: "Canada",
    affiliation: "University of British Columbia",
  },
  {
    fullName: "Mohammad Saleh Zarepour",
    country: "United Kingdom",
    affiliation: "University of Manchester",
  },
  {
    fullName: "Juan Cole",
    country: "United States",
    affiliation: "University of Michigan",
  },
  {
    fullName: "Mahmoud Sadri",
    country: "United States",
    affiliation: "Texas Woman's University",
  },
  {
    fullName: "Ervand Abrahamian",
    country: "United States",
    affiliation: "City University of New York",
  },
  {
    fullName: "Zeinab Vessal",
    country: "United States",
    affiliation: "GTU Berkeley",
  },
  {
    fullName: "Hossein Kamaly",
    country: "United States",
    affiliation: "Hartford International University for Religion and Peace",
  },
];
