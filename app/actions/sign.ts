"use server";

import { prisma } from "@/lib/db";
import { signPetitionSchema } from "@/lib/validation";
import { getLastNameForSort } from "@/lib/formatName";
import { getClientIP, checkRateLimit } from "@/lib/rateLimit";
import { COUNTRY_SET } from "@/data/countries";
import { headers } from "next/headers";
import { createHash } from "crypto";

function sanitize(s: string, maxLen: number): string {
  return s.replace(/<[^>]*>/g, "").replace(/[<>'"]/g, "").trim().slice(0, maxLen);
}

function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex").slice(0, 32);
}

export type SignResult =
  | { ok: true }
  | { ok: false; error: string };

export async function signPetition(formData: FormData): Promise<SignResult> {
  const raw = {
    firstName: formData.get("firstName") ?? "",
    lastName: formData.get("lastName") ?? "",
    country: formData.get("country") ?? "",
    email: formData.get("email") ?? "",
    affiliation: formData.get("affiliation") ?? "",
    consentGiven: formData.get("consentGiven") === "true" || formData.get("consentGiven") === "on",
  };

  const parsed = signPetitionSchema.safeParse({
    ...raw,
    affiliation: raw.affiliation || undefined,
  });

  if (!parsed.success) {
    const first = parsed.error.flatten().formErrors[0] ?? parsed.error.errors[0]?.message;
    return { ok: false, error: first || "Invalid input." };
  }

  const data = parsed.data;

  if (!COUNTRY_SET.has(data.country)) {
    return { ok: false, error: "Please select a valid country." };
  }

  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim()
    || headersList.get("x-real-ip")
    || "unknown";
  const userAgent = headersList.get("user-agent") ?? "";

  const rate = checkRateLimit(ip, "sign", 5, 3600_000);
  if (!rate.allowed) {
    return { ok: false, error: "Too many attempts. Please try again later." };
  }

  const emailNormalized = data.email.trim().toLowerCase();
  const firstName = sanitize(data.firstName, 100);
  const lastName = sanitize(data.lastName, 100);
  const fullName = `${firstName} ${lastName}`.trim();
  const country = sanitize(data.country, 100);
  const affiliation = data.affiliation ? sanitize(data.affiliation, 300) : null;

  try {
    const existing = await prisma.supporter.findUnique({
      where: { email: emailNormalized },
      select: { id: true },
    });
    if (existing) {
      return { ok: false, error: "This email has already been used to sign the petition." };
    }

    // Include lastName when DB has last_name column; retry without it if column is missing
    try {
      await prisma.supporter.create({
        data: {
          fullName,
          firstName,
          lastName: lastName.trim() || getLastNameForSort(fullName),
          email: emailNormalized,
          emailHash: hash(emailNormalized),
          country,
          affiliation,
          consentGiven: true,
          isApproved: true,
          isInitialSupporter: false,
          ipHash: hash(ip),
          userAgentHash: hash(userAgent),
        },
      });
    } catch (createErr: unknown) {
      const msg = String(createErr && typeof createErr === "object" && "message" in createErr ? (createErr as { message: unknown }).message : createErr);
      if (/last_name|lastName/i.test(msg) && /does not exist|column/i.test(msg)) {
        await prisma.supporter.create({
          data: {
            fullName,
            firstName,
            email: emailNormalized,
            emailHash: hash(emailNormalized),
            country,
            affiliation,
            consentGiven: true,
            isApproved: true,
            isInitialSupporter: false,
            ipHash: hash(ip),
            userAgentHash: hash(userAgent),
          },
        });
      } else {
        throw createErr;
      }
    }
    return { ok: true };
  } catch (e: unknown) {
    const msg = e && typeof e === "object" && "code" in e && e.code === "P2002"
      ? "This email has already been used to sign the petition."
      : "Something went wrong. Please try again later.";
    return { ok: false, error: msg };
  }
}
