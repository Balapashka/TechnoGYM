"use client";

import { useQuoteStore } from "@/store/quote-store";
import { useTranslation } from "@/i18n/useTranslation";
import type { ProductDTO } from "@/lib/catalog";

/**
 * Quote CTA on a product card. Quote-only products show no price, so without
 * this the card — and the whole homepage carousel, which now leads with the
 * imported range — would offer nothing to act on. The card itself is a link,
 * hence the swallowed click.
 */
export function RequestPriceButton({
  product,
  className,
}: {
  product: ProductDTO;
  className?: string;
}) {
  const openQuote = useQuoteStore((s) => s.open);
  const t = useTranslation();

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openQuote({ id: product.id, name: product.name });
      }}
      className={
        className ??
        "mt-2 w-full rounded-full border border-ink px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
      }
    >
      {t("product.requestPrice")}
    </button>
  );
}
