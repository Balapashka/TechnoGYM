"use client";

import { useTranslation } from "@/i18n/useTranslation";
import { cn } from "@/lib/cn";

/**
 * Availability line: Chinese stock ships from the Moscow warehouse, Italian
 * equipment is imported to order — both are purchasable, so this is a status,
 * not an "out of stock" barrier.
 */
export function Availability({
  inStock,
  className = "",
}: {
  inStock: boolean;
  className?: string;
}) {
  const t = useTranslation();
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest",
        inStock ? "text-ink" : "text-ink-soft",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          inStock ? "bg-accent-strong" : "bg-stone",
        )}
      />
      {inStock ? t("product.inStock") : t("product.madeToOrder")}
    </p>
  );
}
