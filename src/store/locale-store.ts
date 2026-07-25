"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/translations";
import { useHydrated } from "@/lib/use-hydrated";

export type Country = {
  code: string;
  name: string;
  locale: string;
  currency: string;
};

/**
 * Supported countries — CIS only. Switching one updates the number/currency
 * formatting locale. The UI language is chosen separately (see `language`).
 */
export const COUNTRIES: Country[] = [
  { code: "RU", name: "Россия", locale: "ru-RU", currency: "RUB" },
  { code: "KZ", name: "Казахстан", locale: "ru-KZ", currency: "KZT" },
  { code: "UZ", name: "Узбекистан", locale: "ru-UZ", currency: "UZS" },
  { code: "KG", name: "Кыргызстан", locale: "ru-KG", currency: "KGS" },
];

export const DEFAULT_COUNTRY = COUNTRIES[0]; // Россия (ru-RU / RUB)

type LocaleState = {
  country: Country;
  /** UI language. Russian by default, English available as a switch. */
  language: Locale;
  cookieAccepted: boolean | null; // null = not decided yet
  countryModalDismissed: boolean;
  setCountry: (code: string) => void;
  setLanguage: (language: Locale) => void;
  acceptCookies: () => void;
  declineCookies: () => void;
  dismissCountryModal: () => void;
};

const initialState = {
  country: DEFAULT_COUNTRY,
  language: DEFAULT_LOCALE,
  cookieAccepted: null,
  countryModalDismissed: false,
} satisfies Pick<
  LocaleState,
  "country" | "language" | "cookieAccepted" | "countryModalDismissed"
>;

/**
 * The country to format prices with. Falls back to the default country until
 * the persisted store has hydrated, so server and first client render agree —
 * prices are *converted* per country, so a mismatch here changes the number.
 */
export function useDisplayCountry(): Country {
  const stored = useLocaleStore((s) => s.country);
  return useHydrated() ? stored : DEFAULT_COUNTRY;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      ...initialState,
      setCountry: (code) =>
        set(() => {
          const next = COUNTRIES.find((c) => c.code === code);
          return next ? { country: next } : {};
        }),
      setLanguage: (language) => set({ language }),
      acceptCookies: () => set({ cookieAccepted: true }),
      declineCookies: () => set({ cookieAccepted: false }),
      dismissCountryModal: () => set({ countryModalDismissed: true }),
    }),
    {
      name: "movigym-locale",
      // v2 dropped the EU/US countries and added `language`. Anything stored by
      // an older build would rehydrate a now-unsupported country, so discard it.
      version: 2,
      migrate: () => initialState,
    },
  ),
);
