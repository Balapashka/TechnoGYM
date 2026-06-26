"use client";

import { useQuickViewStore } from "@/store/quickview-store";
import type { ProductDTO } from "@/lib/catalog";

/** Hover-revealed button on a product card that opens the quick-view drawer. */
export function QuickViewButton({ product }: { product: ProductDTO }) {
  const open = useQuickViewStore((s) => s.open);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(product);
      }}
      className="absolute bottom-3 left-1/2 z-10 -translate-x-1/2 translate-y-3 rounded-full bg-ink px-5 py-2 text-xs font-bold uppercase tracking-wide text-paper opacity-0 shadow-lg transition-all duration-300 hover:bg-ink-soft group-hover:translate-y-0 group-hover:opacity-100"
    >
      Quick view
    </button>
  );
}
