"use client";

import { useState, useEffect } from "react";
import type { Lang } from "@/content/translations";
import HeaderHero from "@/components/HeaderHero";
import StatementSection from "@/components/StatementSection";
import type { ReactNode } from "react";

const STORAGE_KEY = "stopiranwar-lang";

function getStoredLang(): Lang {
  if (typeof window === "undefined") return "en";
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s === "en" || s === "fa") return s;
  } catch {
    // ignore
  }
  return "en";
}

export default function HomeClient({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(getStoredLang());
  }, []);

  useEffect(() => {
    const handleToggle = () => {
      setLangState((prev) => {
        const next = prev === "en" ? "fa" : "en";
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          // ignore
        }
        return next;
      });
    };
    window.addEventListener("language-toggle", handleToggle);
    return () => window.removeEventListener("language-toggle", handleToggle);
  }, []);

  return (
    <main className="relative z-[1] min-h-screen">
      <HeaderHero lang={lang} />
      <div className="h-px max-w-2xl mx-auto bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-8" aria-hidden />
      <StatementSection lang={lang} />
      {children}
    </main>
  );
}
