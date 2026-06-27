"use client";

/**
 * React hook for accessing translations with the current locale.
 * Uses the locale store to get the current locale and provides a t() function.
 */

import { useMemo } from "react";
import { useLocaleStore } from "@/store/locale-store";
import { translations, type Locale, getTranslation, interpolate } from "./translations";

export function useTranslation() {
  // Map country locale (e.g., "en-IE") to our translation locale ("en" or "ru")
  const country = useLocaleStore((s) => s.country);
  
  const locale: Locale = useMemo(() => {
    // For now, we support en/ru based on country code
    // Russia -> ru, everything else -> en
    if (country.code === "RU") {
      return "ru";
    }
    return "en";
  }, [country]);

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

/**
 * Helper component to provide translation context to children.
 * Not strictly necessary but can be useful for organizing components.
 */
export function TranslationProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
