"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { categoryName } from "@/i18n/translations";

/**
 * PLP page header. Client-side so the category name and labels follow the
 * language switch; `slug` is null for the "all products" listing.
 */
export function CatalogHeader({
  slug,
  fallbackTitle,
  count,
}: {
  slug: string | null;
  fallbackTitle: string;
  count: number;
}) {
  const t = useTranslation();
  const title = slug
    ? categoryName(t.locale, slug, fallbackTitle)
    : t("common.allProducts");

  return (
    <div className="border-b border-stone">
      <div className="container-page py-8">
        <p className="text-xs uppercase tracking-wide text-ink-soft">
          {t("catalog.eyebrow")}
        </p>
        <h1 className="text-3xl font-black uppercase tracking-tight md:text-4xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          {t("catalog.productCount", { count })}
        </p>
      </div>
    </div>
  );
}
