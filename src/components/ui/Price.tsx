"use client";

import { formatPrice } from "@/lib/format";
import { useLocaleStore } from "@/store/locale-store";
import { cn } from "@/lib/cn";

/**
 * Renders a price. Display locale follows the selected country (demo state),
 * while the currency stays the product's currency.
 */
export function Price({
  cents,
  currency = "EUR",
  prefix,
  className,
}: {
  cents: number;
  currency?: string;
  prefix?: string;
  className?: string;
}) {
  const locale = useLocaleStore((s) => s.country.locale);
  return (
    <span className={cn("font-bold", className)}>
      {prefix ? `${prefix} ` : ""}
      {formatPrice(cents, currency, locale)}
    </span>
  );
}
