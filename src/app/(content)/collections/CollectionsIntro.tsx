"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { formatProductCount } from "@/i18n/translations";

/**
 * Intro block of the collections page. Client-side so the copy follows the
 * language switch; `total` and `categories` are counted on the server.
 */
export function CollectionsIntro({
  total,
  categories,
}: {
  total: number;
  categories: number;
}) {
  const t = useTranslation();

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
        {t("landing.exploreTheRange")}
      </p>
      <h1 className="mb-3 text-4xl font-black uppercase md:text-5xl">
        {t("common.collections")}
      </h1>
      <p className="max-w-xl text-ink-soft">
        {t("landing.collectionsLead", {
          categories,
          products: formatProductCount(t.locale, total),
        })}
      </p>
    </>
  );
}
