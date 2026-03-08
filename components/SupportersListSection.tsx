"use client";

import { useEffect, useState, useCallback } from "react";

type Supporter = {
  id: string;
  fullName: string;
  country: string;
  affiliation: string | null;
  isInitialSupporter: boolean;
};

const PAGE_SIZE = 50;

export default function SupportersListSection() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: String(PAGE_SIZE),
      });
      const res = await fetch(`/api/supporters?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setSupporters(data.supporters ?? []);
      setTotal(data.total ?? 0);
      setPage(pageNum);
    } catch {
      setError(true);
      setSupporters([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(1);
  }, [load]);

  useEffect(() => {
    const onUpdate = () => load(1);
    window.addEventListener("petition-signed", onUpdate);
    return () => window.removeEventListener("petition-signed", onUpdate);
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasMore = page < totalPages;
  const showInitialLabel =
    page === 1 &&
    supporters.length > 0 &&
    supporters.some((s) => s.isInitialSupporter);

  return (
    <section
      className="mx-auto max-w-4xl px-4 py-12 sm:py-16"
      aria-labelledby="supporters-heading"
    >
      <h2
        id="supporters-heading"
        className="font-serif text-2xl font-semibold text-[var(--cream)] text-center mb-2"
      >
        Signatures
      </h2>
      <p className="text-center text-sm text-[var(--dim)] mb-6">
        {total.toLocaleString()} signatures
      </p>

      {error && (
        <p className="text-center text-[var(--err-t)] py-4">
          Unable to load signatures. Please try again later.
        </p>
      )}

      {!error && loading && supporters.length === 0 && (
        <p className="text-center text-[var(--dim)] py-8">Loading…</p>
      )}

      {!error && !loading && supporters.length === 0 && (
        <p className="text-center text-[var(--dim)] py-8">No signatures yet.</p>
      )}

      {!error && supporters.length > 0 && (
        <>
          {showInitialLabel && (
            <p
              className="text-xs font-medium uppercase tracking-wider text-[var(--dim)] mb-3"
              aria-hidden
            >
              Initial Signatories
            </p>
          )}
          <ul className="grid gap-2 sm:grid-cols-2" aria-busy={loading}>
            {supporters.map((s) => (
              <li
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--green-t)]"
                  aria-hidden
                />
                <div className="min-w-0">
                  <span className="font-medium text-[var(--cream)]">
                    {s.fullName}
                  </span>
                  <span className="text-[var(--dim)]"> · {s.country}</span>
                  {s.affiliation && (
                    <span className="block text-xs text-[var(--dim)] truncate">
                      {s.affiliation}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => load(page - 1)}
              disabled={page <= 1 || loading}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--cream)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--border)]"
            >
              Previous
            </button>
            <span className="text-sm text-[var(--dim)]">
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              onClick={() => load(page + 1)}
              disabled={!hasMore || loading}
              className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm text-[var(--cream)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--border)]"
            >
              Next
            </button>
          </div>
        </>
      )}
    </section>
  );
}
