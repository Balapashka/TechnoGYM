import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Country = {
  code: string;
  name: string;
  locale: string;
  currency: string;
};

/** Supported demo countries. Switching one updates locale + currency. */
export const COUNTRIES: Country[] = [
  { code: "IT", name: "Italy", locale: "it-IT", currency: "EUR" },
  { code: "IE", name: "Ireland", locale: "en-IE", currency: "EUR" },
  { code: "GB", name: "United Kingdom", locale: "en-GB", currency: "GBP" },
  { code: "US", name: "United States", locale: "en-US", currency: "USD" },
  { code: "RU", name: "Russia", locale: "ru-RU", currency: "RUB" },
];

export const DEFAULT_COUNTRY = COUNTRIES[1]; // Ireland (en-IE / EUR)

type LocaleState = {
  country: Country;
  cookieAccepted: boolean | null; // null = not decided yet
  countryModalDismissed: boolean;
  setCountry: (code: string) => void;
  acceptCookies: () => void;
  declineCookies: () => void;
  dismissCountryModal: () => void;
};

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      country: DEFAULT_COUNTRY,
      cookieAccepted: null,
      countryModalDismissed: false,
      setCountry: (code) =>
        set(() => {
          const next = COUNTRIES.find((c) => c.code === code);
          return next ? { country: next } : {};
        }),
      acceptCookies: () => set({ cookieAccepted: true }),
      declineCookies: () => set({ cookieAccepted: false }),
      dismissCountryModal: () => set({ countryModalDismissed: true }),
    }),
    { name: "movigym-locale" },
  ),
);
