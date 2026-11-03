"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

/** Search form + result summary. A plain GET form: works without JS too. */
export function SearchHeader({ q, count }: { q: string; count: number }) {
  const t = useTranslation();
  return (
    <div>
      <h1 className="text-3xl font-black uppercase">{t("search.title")}</h1>
      <form action="/search" method="get" role="search" className="mt-5 flex max-w-2xl gap-2">
        <input
          type="search"
          name="q"
          defaultValue={q}
          autoFocus={!q}
          maxLength={100}
          aria-label={t("search.title")}
          placeholder={t("search.placeholder")}
          className="min-w-0 flex-1 rounded-full border border-stone px-5 py-3 text-sm focus:border-ink focus:outline-none focus:ring-2 focus:ring-accent/40"
        />
        <button
          type="submit"
          className="hover-lift rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("search.submit")}
        </button>
      </form>
      <p className="mt-4 text-sm text-ink-soft">
        {!q
          ? t("search.hint")
          : count > 0
            ? t("search.found", { count })
            : t("search.nothing", { q })}
      </p>
      {q && count === 0 && (
        <div className="mt-6">
          <p className="text-ink-soft">{t("search.nothingHint")}</p>
          <Link
            href="/category/all"
            className="hover-lift mt-4 inline-flex rounded-full border border-ink px-6 py-3 text-sm font-bold uppercase"
          >
            {t("errors.toCatalog")}
          </Link>
        </div>
      )}
    </div>
  );
}
