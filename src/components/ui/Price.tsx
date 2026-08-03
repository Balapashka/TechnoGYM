"use client";

import {
  BASE_CURRENCY,
  formatInstallmentIn,
  formatPriceIn,
} from "@/lib/format";
import { useDisplayCountry } from "@/store/locale-store";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/catalog";

/**
 * Renders a price converted into the currency of the selected country.
 * Catalog prices are stored in roubles; conversion is display-only.
 */
export function Price({
  cents,
  currency = BASE_CURRENCY,
  prefix,
  className,
}: {
  cents: number;
  currency?: string;
  prefix?: string;
  className?: string;
}) {
  const country = useDisplayCountry();
  return (
    <span className={cn("font-bold", className)}>
      {prefix ? `${prefix} ` : ""}
      {formatPriceIn(cents, currency, country)}
    </span>
  );
}

/**
 * The price-bearing part of a product. Anything shaped like a `ProductDTO`
 * satisfies it, so cards, drawers and the compare table can share one guard.
 */
export type PricedProduct = Pick<
  ProductDTO,
  "priceCents" | "currency" | "priceOnRequest"
>;

/**
 * The single place that decides whether a product's price may be shown.
 *
 * Made-to-order imports carry a `priceCents` in the database (orders and the
 * admin form need it) but must never expose it in the storefront — they render
 * the "Цена по запросу" label instead, and the caller offers a quote CTA.
 * Use this everywhere a catalog price is rendered; `Price` stays the raw
 * primitive for the cart and orders, where a price always exists.
 */
export function PriceOrRequest({
  product,
  prefix,
  className,
}: {
  product: PricedProduct;
  prefix?: string;
  className?: string;
}) {
  const t = useTranslation();

  if (product.priceOnRequest) {
    return (
      <span className={cn("font-bold", className)}>
        {t("product.priceOnRequest")}
      </span>
    );
  }

  return (
    <Price
      cents={product.priceCents}
      currency={product.currency}
      prefix={prefix}
      className={className}
    />
  );
}

/**
 * Installment line for a catalog product — renders nothing for quote-only
 * products, since a monthly payment would leak the hidden price.
 */
export function ProductInstallment({
  product,
  months,
  className,
}: {
  product: PricedProduct;
  months?: number;
  className?: string;
}) {
  if (product.priceOnRequest) return null;

  return (
    <Installment
      cents={product.priceCents}
      currency={product.currency}
      months={months}
      className={className}
    />
  );
}

/** "12 500 ₽ / мес · 36 месяцев" line under a price. */
export function Installment({
  cents,
  months = 36,
  currency = BASE_CURRENCY,
  className,
}: {
  cents: number;
  months?: number;
  currency?: string;
  className?: string;
}) {
  const country = useDisplayCountry();
  const t = useTranslation();
  return (
    <span className={className}>
      {t("product.installment", {
        amount: formatInstallmentIn(cents, months, currency, country),
        months,
      })}
    </span>
  );
}
