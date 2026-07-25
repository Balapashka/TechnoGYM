"use client";

/**
 * React hook for accessing translations with the current language.
 * The language lives in the locale store (Russian by default, English as the
 * secondary option) and is independent of the selected country.
 */

import { useMemo } from "react";
import { useLocaleStore } from "@/store/locale-store";
import { translations, type Locale, getTranslation, interpolate } from "./translations";

export function useTranslation() {
  const locale: Locale = useLocaleStore((s) => s.language);

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
