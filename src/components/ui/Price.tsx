"use client";

import {
  BASE_CURRENCY,
  formatInstallmentIn,
  formatPriceIn,
} from "@/lib/format";
import { useDisplayCountry } from "@/store/locale-store";
import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/cn";

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
