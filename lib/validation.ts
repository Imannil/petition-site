import { z } from "zod";

// Country code/name: we use full country names; ensure value is in allowed set
const COUNTRY_MAX = 100;

export const signPetitionSchema = z.object({
  fullName: z
    .string()
    .min(1, "Full name is required.")
    .max(200, "Name is too long.")
    .transform((s) => s.trim()),
  country: z
    .string()
    .min(1, "Country of residence is required.")
    .max(COUNTRY_MAX),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address.")
    .max(254)
    .transform((s) => s.trim().toLowerCase()),
  affiliation: z
    .string()
    .max(300)
    .optional()
    .transform((s) => (s?.trim() || undefined)),
  consentGiven: z.literal(true, {
    errorMap: () => ({
      message:
        "You must confirm the statement to sign. Please check the box.",
    }),
  }),
  // Optional: Turnstile token for bot protection
  turnstileToken: z.string().optional(),
});

export type SignPetitionInput = z.infer<typeof signPetitionSchema>;
