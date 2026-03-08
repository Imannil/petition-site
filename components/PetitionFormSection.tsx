"use client";

import { useState } from "react";
import { signPetition } from "@/app/actions/sign";
import { COUNTRIES } from "@/data/countries";

const CONSENT_TEXT =
  "I support this petition and understand that my name, country, and affiliation may be publicly displayed as a supporter. My email is used to register my signature and will not be shown publicly or shared. Signatures with affiliation appear first.";

export default function PetitionFormSection() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    country: "",
    email: "",
    affiliation: "",
    consentGiven: false,
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    formData.set("consentGiven", form.consentGiven ? "true" : "false");

    const result = await signPetition(formData);

    if (result.ok) {
      setStatus("success");
      setForm({ firstName: "", lastName: "", country: "", email: "", affiliation: "", consentGiven: false });
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("petition-signed"));
      }
    } else {
      setStatus("idle");
      setError(result.error);
    }
  }

  return (
    <section
      id="petition-form"
      className="mx-auto max-w-xl px-4 py-10 sm:py-12 scroll-mt-20"
      aria-labelledby="form-heading"
    >
      <h2 id="form-heading" className="font-heading text-2xl font-semibold text-[var(--cream)] text-center mb-5">
        Add Your Name
      </h2>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8">
        {status === "success" ? (
          <div
            className="rounded-lg border border-[var(--green-t)]/25 bg-[var(--green-bg)] p-4 text-center text-[var(--green-t)]"
            role="status"
          >
            Your name has been added to the petition. Thank you for standing with us.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="sr-only">
                  First name (required)
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="First name *"
                  value={form.firstName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, firstName: e.target.value }));
                    setError("");
                  }}
                  disabled={status === "submitting"}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--cream)] placeholder:text-[var(--dim)] focus:border-[var(--red-l)] focus:outline-none focus:ring-1 focus:ring-[var(--red-l)] disabled:opacity-50"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="sr-only">
                  Last name (required)
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="Last name *"
                  value={form.lastName}
                  onChange={(e) => {
                    setForm((f) => ({ ...f, lastName: e.target.value }));
                    setError("");
                  }}
                  disabled={status === "submitting"}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--cream)] placeholder:text-[var(--dim)] focus:border-[var(--red-l)] focus:outline-none focus:ring-1 focus:ring-[var(--red-l)] disabled:opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="affiliation" className="sr-only">
                Affiliation (optional)
              </label>
              <input
                id="affiliation"
                name="affiliation"
                type="text"
                maxLength={300}
                placeholder="Job affiliation (highly recommended)"
                value={form.affiliation}
                onChange={(e) => setForm((f) => ({ ...f, affiliation: e.target.value }))}
                disabled={status === "submitting"}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--cream)] placeholder:text-[var(--dim)] focus:border-[var(--red-l)] focus:outline-none focus:ring-1 focus:ring-[var(--red-l)] disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="email" className="sr-only">
                Email (required, not shown publicly)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={254}
                placeholder="Email address * (registration only)"
                value={form.email}
                onChange={(e) => {
                  setForm((f) => ({ ...f, email: e.target.value }));
                  setError("");
                }}
                disabled={status === "submitting"}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 text-[var(--cream)] placeholder:text-[var(--dim)] focus:border-[var(--red-l)] focus:outline-none focus:ring-1 focus:ring-[var(--red-l)] disabled:opacity-50"
              />
            </div>

            <div>
              <label htmlFor="country" className="sr-only">
                Country of residence (required)
              </label>
              <select
                id="country"
                name="country"
                required
                value={form.country}
                onChange={(e) => {
                  setForm((f) => ({ ...f, country: e.target.value }));
                  setError("");
                }}
                disabled={status === "submitting"}
                className={`w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-4 py-3 focus:border-[var(--red-l)] focus:outline-none focus:ring-1 focus:ring-[var(--red-l)] disabled:opacity-50 cursor-pointer appearance-none bg-no-repeat bg-[length:12px] bg-[right_1rem_center] pr-10 ${
                  form.country ? "text-[var(--cream)]" : "text-[var(--dim)]"
                }`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239a9389' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                }}
              >
                <option value="">Country of residence *</option>
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[rgba(192,57,43,.2)] bg-[rgba(192,57,43,.06)] p-4 transition hover:bg-[rgba(192,57,43,.1)]">
              <input
                type="checkbox"
                name="consentGiven"
                checked={form.consentGiven}
                onChange={(e) => {
                  setForm((f) => ({ ...f, consentGiven: e.target.checked }));
                  setError("");
                }}
                disabled={status === "submitting"}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--red-l)]"
              />
              <span className="text-sm leading-relaxed text-[var(--dim)]">
                {CONSENT_TEXT}
              </span>
            </label>

            {error && (
              <div className="rounded-lg border border-red-900/30 bg-[var(--err-bg)] px-4 py-3 text-sm text-[var(--err-t)]">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full rounded-lg bg-[var(--red)] py-3 font-semibold text-white transition hover:bg-[var(--red-l)] hover:shadow-[0_4px_20px_rgba(192,57,43,.35)] disabled:opacity-55 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--red-l)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
            >
              {status === "submitting" ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                  Signing…
                </span>
              ) : (
                "Sign the petition"
              )}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
