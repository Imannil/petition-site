"use client";

/**
 * Scroll speed for all marquee rows (in seconds).
 * Increase for slower scroll, decrease for faster. All 3 rows use this value.
 */
const MARQUEE_DURATION_SECONDS = 140;

type Item = { fullName: string; country: string; affiliation: string | null };

function splitIntoRows<T>(items: T[], rowCount: number): T[][] {
  if (items.length === 0) return [];
  const size = Math.ceil(items.length / rowCount);
  const rows: T[][] = [];
  for (let i = 0; i < rowCount; i++) {
    rows.push(items.slice(i * size, (i + 1) * size));
  }
  return rows.filter((r) => r.length > 0);
}

function MarqueeRow({
  items,
  durationSec,
}: {
  items: Item[];
  durationSec: number;
}) {
  const duplicated = [...items, ...items];

  return (
    <div className="overflow-hidden" aria-hidden="true">
      <div
        className="flex w-max animate-marquee gap-6 pr-6 sm:gap-8 sm:pr-8"
        style={{ animationDuration: `${durationSec}s` }}
      >
        {duplicated.map((s, i) => (
          <div
            key={`${i}-${s.fullName}-${s.country}`}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 sm:gap-3 sm:px-4 sm:py-2"
          >
            <span className="text-sm font-medium text-[var(--cream)] whitespace-nowrap">
              {s.fullName}
            </span>
            <span className="text-xs text-[var(--dim)] whitespace-nowrap">
              {s.country}
            </span>
            {s.affiliation && (
              <span className="text-xs text-[var(--dim)] italic whitespace-nowrap max-w-[120px] sm:max-w-[180px] truncate">
                {s.affiliation}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InitialSignatoriesMarquee({
  supporters,
}: {
  supporters: Item[];
}) {
  if (supporters.length === 0) return null;

  const rows = splitIntoRows(supporters, 3);

  return (
    <div className="border-y border-[var(--border)] bg-[var(--surface)]/50 py-4">
      <div className="flex flex-col gap-3 sm:gap-4">
        {rows.map((rowItems, rowIndex) => (
          <MarqueeRow
            key={rowIndex}
            items={rowItems}
            durationSec={MARQUEE_DURATION_SECONDS}
          />
        ))}
      </div>
    </div>
  );
}
