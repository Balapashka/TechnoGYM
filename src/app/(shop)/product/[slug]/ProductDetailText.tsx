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

/** Heading of the description / specification sections. */
export function SectionTitle({ kind }: { kind: "description" | "specs" }) {
  const t = useTranslation();
  return (
    <h2 className="mb-5 text-xl font-semibold uppercase md:text-2xl">
      {kind === "description" ? t("product.description") : t("product.specs")}
    </h2>
  );
}

/**
 * Brand / country-of-origin rows, rendered at the top of the specification
 * table. Each row appears only when its value is present.
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
    <dl className="divide-y divide-stone border-t border-stone text-sm">
      {brand && (
        <div className="grid grid-cols-2 gap-4 py-3">
          <dt className="text-ink-soft">{t("product.brand")}</dt>
          <dd className="font-medium">{brand}</dd>
        </div>
      )}
      {originCountry && (
        <div className="grid grid-cols-2 gap-4 py-3">
          <dt className="text-ink-soft">{t("product.origin")}</dt>
          <dd className="font-medium">{originCountry}</dd>
        </div>
      )}
    </dl>
  );
}
