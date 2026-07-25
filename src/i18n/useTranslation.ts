"use client";

/**
 * React hook for accessing translations with the current language.
 * The language lives in the locale store (Russian by default, English as the
 * secondary option) and is independent of the selected country.
 */

import { useMemo } from "react";
import { useLocaleStore } from "@/store/locale-store";
import { useHydrated } from "@/lib/use-hydrated";
import {
  DEFAULT_LOCALE,
  translations,
  type Locale,
  getTranslation,
  interpolate,
} from "./translations";

export function useTranslation() {
  const stored = useLocaleStore((s) => s.language);
  const hydrated = useHydrated();

  // The store is localStorage-backed, so on the server — and on the first
  // client render — it must resolve to the default locale, or every translated
  // string becomes a hydration mismatch for a visitor who picked English.
  const locale: Locale = hydrated ? stored : DEFAULT_LOCALE;

  const t = useMemo(() => {
    function translate(keyPath: string): string;
    function translate(keyPath: string, vars: Record<string, string | number>): string;
    function translate(keyPath: string, vars?: Record<string, string | number>): string {
      const str = getTranslation(locale, keyPath);
      return vars ? interpolate(str, vars) : str;
    }

    return Object.assign(translate, {
      /** Current locale code */
      locale,

      /** Full translation object for current locale */
      data: translations[locale],
    });
  }, [locale]);

  return t;
}
