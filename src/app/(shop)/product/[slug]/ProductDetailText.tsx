"use client";

import Link from "next/link";
import { useTranslation } from "@/i18n/useTranslation";

/**
 * Breadcrumb "Home" link. Extracted as a client component so the label follows
 * the language switch — the product page itself is a server component.
 */
export function BreadcrumbHome() {
  const t = useTranslation();

  return (
    <Link href="/" className="hover:text-ink">
      {t("product.home")}
    </Link>
  );
}

/**
 * Labelled brand / country-of-origin block for the product detail page.
 * Both fields are optional in the data model, so each row renders only when
 * its value is present; the values themselves come from the DB and are not
 * translated.
 */
export function ProductSpecs({
  brand,
  originCountry,
}: {
  brand: string;
  originCountry: string;
}) {
  const t = useTranslation();

  if (!brand && !originCountry) return null;

  return (
    <div className="rounded-xl border border-stone p-4">
      <p className="mb-3 text-xs font-bold uppercase tracking-wide">
        {t("product.specs")}
      </p>
      <dl className="grid gap-2 text-sm">
        {brand && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-soft">{t("product.brand")}</dt>
            <dd className="font-semibold">{brand}</dd>
          </div>
        )}
        {originCountry && (
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-ink-soft">{t("product.origin")}</dt>
            <dd className="font-semibold">{originCountry}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
