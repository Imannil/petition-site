"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { ReactNode } from "react";

/**
 * Consumes language context so that when lang changes, this subtree re-renders.
 * Use as a wrapper around page content that depends on lang (e.g. StatementSection).
 */
export function LanguageConsumer({ children }: { children: ReactNode }) {
  useLanguage();
  return <>{children}</>;
}
