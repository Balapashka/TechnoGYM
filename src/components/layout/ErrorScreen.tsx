"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

/** Shared 404 / 500 screen with a way back into the shop. */
export function ErrorScreen({
  kind,
  onRetry,
}: {
  kind: "notFound" | "crash";
  onRetry?: () => void;
}) {
  const t = useTranslation();
  const notFound = kind === "notFound";
  return (
    <main className="container-page flex flex-1 flex-col items-center justify-center py-24 text-center">
      <p className="text-7xl font-black text-accent-strong md:text-9xl" aria-hidden="true">
        {notFound ? "404" : "500"}
      </p>
      <h1 className="mt-4 text-3xl font-black uppercase">
        {notFound ? t("errors.notFoundTitle") : t("errors.crashTitle")}
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        {notFound ? t("errors.notFoundBody") : t("errors.crashBody")}
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
          >
            {t("errors.retry")}
          </button>
        )}
        <Link
          href="/category/all"
          className={`hover-lift rounded-full px-6 py-3 text-sm font-bold uppercase ${
            onRetry ? "border border-ink" : "bg-accent text-ink"
          }`}
        >
          {t("errors.toCatalog")}
        </Link>
        <Link
          href="/"
          className="hover-lift rounded-full border border-ink px-6 py-3 text-sm font-bold uppercase"
        >
          {t("errors.toHome")}
        </Link>
      </div>
    </main>
  );
}
