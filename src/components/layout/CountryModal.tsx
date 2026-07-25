"use client";

import { useEffect, useState } from "react";
import { useLocaleStore, COUNTRIES } from "@/store/locale-store";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * First-visit modal asking the user to confirm their country/region.
 * Options are restricted to the CIS countries the demo store ships to.
 * It is fully dismissible (backdrop, ×, Escape) — the default country already
 * works, so it never blocks a first visit.
 */
export function CountryModal() {
  const country = useLocaleStore((s) => s.country);
  const dismissed = useLocaleStore((s) => s.countryModalDismissed);
  const setCountry = useLocaleStore((s) => s.setCountry);
  const dismiss = useLocaleStore((s) => s.dismissCountryModal);
  const t = useTranslation();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismiss]);

  if (!mounted || dismissed) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="absolute inset-0"
        onClick={dismiss}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("locale.chooseCountry")}
        className="relative w-full max-w-md rounded bg-paper p-6"
      >
        <button
          onClick={dismiss}
          aria-label={t("common.close")}
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full border border-stone text-lg leading-none"
        >
          ×
        </button>
        <h2 className="mb-1 pr-10 text-xl font-black uppercase">
          {t("locale.chooseCountry")}
        </h2>
        <p className="mb-5 text-sm text-ink-soft">
          {t("locale.browsingDemoStore", { country: country.name })}{" "}
          {t("locale.pickRegion")}
        </p>
        <ul className="mb-5 space-y-2">
          {COUNTRIES.map((c) => (
            <li key={c.code}>
              <button
                onClick={() => setCountry(c.code)}
                aria-pressed={country.code === c.code}
                className={`flex w-full items-center justify-between rounded border px-4 py-2 text-sm ${
                  country.code === c.code
                    ? "border-ink bg-mist font-bold"
                    : "border-stone"
                }`}
              >
                <span>{c.name}</span>
                <span className="text-ink-soft">{c.currency}</span>
              </button>
            </li>
          ))}
        </ul>
        <button
          onClick={dismiss}
          className="w-full rounded bg-accent px-4 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("common.confirm")}
        </button>
      </div>
    </div>
  );
}
