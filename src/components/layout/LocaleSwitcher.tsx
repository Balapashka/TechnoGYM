"use client";

import { useLocaleStore, COUNTRIES } from "@/store/locale-store";
import { useTranslation } from "@/i18n/useTranslation";
import { LOCALES } from "@/i18n/translations";
import { useHydrated } from "@/lib/use-hydrated";

/**
 * Header control: RU/EN language toggle plus the CIS country selector.
 * Desktop (`lg+`) only — on mobile the same controls live in the drawer
 * footer (see MobileMenu).
 */
export function LocaleSwitcher() {
  const language = useLocaleStore((s) => s.language);
  const setLanguage = useLocaleStore((s) => s.setLanguage);
  const country = useLocaleStore((s) => s.country);
  const setCountry = useLocaleStore((s) => s.setCountry);
  const t = useTranslation();

  // Language/country come from persisted state, so render only after mount to
  // keep the server markup and the first client render identical.
  const mounted = useHydrated();
  if (!mounted) return null;

  return (
    <div className="hidden items-center gap-3 lg:flex">
      <div
        role="group"
        aria-label={t("locale.language")}
        className="flex items-center rounded-full border border-stone"
      >
        {LOCALES.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLanguage(l.code)}
            aria-pressed={language === l.code}
            title={l.name}
            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase transition ${
              language === l.code ? "bg-ink text-paper" : "text-ink-soft hover:bg-mist"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <select
        aria-label={t("locale.country")}
        value={country.code}
        onChange={(e) => setCountry(e.target.value)}
        className="hidden rounded-full border border-stone bg-paper px-3 py-1 text-xs font-semibold xl:block"
      >
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
