"use client";

import { useEffect, useState } from "react";
import { useLocaleStore } from "@/store/locale-store";
import { useTranslation } from "@/i18n/useTranslation";

/** Bottom cookie-consent banner. Shows until the user accepts or declines. */
export function CookieBanner() {
  const cookieAccepted = useLocaleStore((s) => s.cookieAccepted);
  const acceptCookies = useLocaleStore((s) => s.acceptCookies);
  const declineCookies = useLocaleStore((s) => s.declineCookies);
  const t = useTranslation();

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || cookieAccepted !== null) return null;

  return (
    <div
      role="dialog"
      aria-label={t("cookie.message")}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-stone bg-paper p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
    >
      <div className="container-page flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-sm text-ink-soft">
          {t("cookie.message")}
        </p>
        <div className="flex gap-3">
          <button
            onClick={declineCookies}
            className="rounded border border-ink px-4 py-2 text-sm font-bold uppercase"
          >
            {t("cookie.decline")}
          </button>
          <button
            onClick={acceptCookies}
            className="rounded bg-accent px-4 py-2 text-sm font-bold uppercase text-ink"
          >
            {t("cookie.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}
