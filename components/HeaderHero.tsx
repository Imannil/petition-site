"use client";

import { useEffect, useState } from "react";
import type { Lang } from "@/content/translations";
import { translations } from "@/content/translations";

async function fetchCount(): Promise<number> {
  const res = await fetch("/api/count", {
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
  });
  if (!res.ok) return 0;
  const data = await res.json();
  return typeof data.count === "number" ? data.count : 0;
}

type Props = { lang: Lang };

export default function HeaderHero({ lang }: Props) {
  const [count, setCount] = useState<number | null>(null);
  const t = translations[lang].hero;
  const isRtl = lang === "fa";

  useEffect(() => {
    fetchCount().then(setCount);
    const onSigned = () => fetchCount().then(setCount);
    window.addEventListener("petition-signed", onSigned);
    return () => window.removeEventListener("petition-signed", onSigned);
  }, []);

  const toggleLang = () => {
    window.dispatchEvent(new CustomEvent("language-toggle"));
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full bg-[var(--red)] shadow-[0_0_9px_rgba(192,57,43,.8)]"
              aria-hidden
            />
            <span className="text-xs font-semibold uppercase tracking-widest text-[var(--cream)]">
              {t.siteTitle}
            </span>
          </div>
          <button
            type="button"
            onClick={toggleLang}
            className="rounded-md border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--dim)] transition hover:border-[var(--border-h)] hover:text-[var(--cream)] focus:outline-none focus:ring-1 focus:ring-[var(--red-l)] focus:ring-offset-1 focus:ring-offset-[var(--bg)]"
            aria-label={lang === "en" ? "Switch to Farsi" : "Switch to English"}
            title={lang === "en" ? "فارسی" : "English"}
          >
            EN | فارسی
          </button>
        </nav>
      </header>

      <section
        className="relative mx-auto max-w-3xl px-4 pb-10 pt-10 text-center sm:px-6 sm:pt-12"
        dir={isRtl ? "rtl" : "ltr"}
      >
        {isRtl ? (
          <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight text-[var(--cream)] sm:text-5xl md:text-6xl animate-[fadeUp_0.55s_0.1s_ease_both]">
            <span className="text-[var(--red-l)]">جنگ</span>
            <span> با </span>
            <span className="text-[var(--red-l)]">ایران</span>
            <span> را </span>
            <span className="text-[var(--red-l)]">متوقف</span>
            <span> کنید</span>
          </h1>
        ) : (
          <h1 className="font-heading text-5xl font-bold leading-tight tracking-tight text-[var(--cream)] sm:text-6xl md:text-7xl animate-[fadeUp_0.55s_0.1s_ease_both]">
            <span className="text-[var(--red-l)]">{t.titleStop}</span>{" "}
            <span className="text-[var(--cream)]">{t.titleIran}</span>{" "}
            <span className="italic bg-gradient-to-br from-[var(--red)] to-[var(--red-l)] bg-clip-text text-transparent">
              {t.titleWar}
            </span>
          </h1>
        )}
        <p className={`mt-4 text-[var(--dim)] text-sm font-light tracking-wide animate-[fadeUp_0.55s_0.2s_ease_both] sm:text-base ${isRtl ? "text-center" : ""}`}>
          {t.subtitle}
        </p>
        <div className="mt-10 inline-flex flex-col items-center gap-0.5 rounded-xl border border-[rgba(192,57,43,.35)] bg-[var(--surface)] px-8 py-4 animate-[fadeUp_0.55s_0.3s_ease_both]">
          <span className="font-serif text-4xl font-bold text-[var(--cream)]">
            {count === null ? "…" : count.toLocaleString(lang === "fa" ? "fa-IR" : "en")}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-[var(--dim)]">
            {t.signaturesLabel}
          </span>
        </div>
      </section>
    </>
  );
}
