"use client";

import { useCompareStore } from "@/store/compare-store";
import { useTranslation } from "@/i18n/useTranslation";
import { useHydrated } from "@/lib/use-hydrated";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/catalog";

/**
 * Compare toggle in the product card's image corner. Filled accent state when
 * the product is already in the comparison list.
 */
export function CompareButton({ product }: { product: ProductDTO }) {
  const toggle = useCompareStore((s) => s.toggleCompare);
  const active = useCompareStore((s) =>
    s.items.some((p) => p.id === product.id),
  );
  const t = useTranslation();
  const mounted = useHydrated();

  const inCompare = mounted && active;

  return (
    <button
      type="button"
      aria-pressed={inCompare}
      aria-label={
        inCompare
          ? t("product.removeFromCompare", { name: product.name })
          : t("compare.addToCompare", { name: product.name })
      }
      onClick={(e) => {
        // The whole card is a <Link> — keep the click from navigating.
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={cn(
        "absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full border shadow-sm transition-colors",
        inCompare
          ? "border-accent-strong bg-accent text-ink"
          : "border-stone bg-paper/90 text-ink-soft hover:text-ink",
      )}
    >
      {/* Scales icon: two mirrored bars — reads as "compare". */}
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      >
        <path d="M5.5 2.5v11M10.5 2.5v11M2.5 5.5l3-3 3 3M13.5 10.5l-3 3-3-3" />
      </svg>
    </button>
  );
}
