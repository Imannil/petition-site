"use client";

import type { Lang } from "@/content/translations";
import { translations } from "@/content/translations";
import type { StatementSegment } from "@/content/translations";

function StatementParagraph({
  segments,
  isRtl,
}: {
  segments: readonly StatementSegment[];
  isRtl: boolean;
}) {
  return (
    <p className={isRtl ? "text-right" : "text-left"}>
      {segments.map((seg, i) => {
        if (seg.type === "text") {
          return <span key={i}>{seg.value}</span>;
        }
        return (
          <a
            key={i}
            href={seg.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--red-l)] underline decoration-[var(--red-l)] decoration-from-font underline-offset-2 hover:decoration-[var(--cream)] hover:text-[var(--cream)] transition-colors duration-150"
          >
            {seg.value}
          </a>
        );
      })}
    </p>
  );
}

type Props = { lang: Lang };

export default function StatementSection({ lang }: Props) {
  const t = translations[lang].statement;
  const isRtl = lang === "fa";

  return (
    <section
      className="mx-auto max-w-2xl px-4 py-10 sm:py-12"
      aria-labelledby="statement-heading"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <h2
        id="statement-heading"
        className="font-heading text-xl font-bold leading-tight text-center text-[var(--cream)] sm:text-2xl mb-6"
      >
        {t.heading}
      </h2>
      <div
        className={`space-y-5 text-base font-light leading-[1.75] text-[rgba(240,235,227,0.92)] ${
          isRtl ? "text-right" : "text-left"
        }`}
      >
        {t.paragraphs.map((segments, i) => (
          <StatementParagraph key={i} segments={segments} isRtl={isRtl} />
        ))}
      </div>
      <div className="mt-8 flex justify-center">
        <a
          href="#petition-form"
          className="inline-block rounded-lg bg-[var(--red)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--red-l)] hover:shadow-[0_4px_20px_rgba(192,57,43,.35)] focus:outline-none focus:ring-2 focus:ring-[var(--red-l)] focus:ring-offset-2 focus:ring-offset-[var(--bg)]"
        >
          {translations[lang].hero.ctaButton}
        </a>
      </div>
    </section>
  );
}
