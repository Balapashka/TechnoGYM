"use client";

import { useCompareStore } from "@/store/compare-store";
import { useTranslation } from "@/i18n/useTranslation";
import type { ProductDTO } from "@/lib/catalog";
import { useHydrated } from "@/lib/use-hydrated";

/** Sticky bottom bar listing products selected for comparison. */
export function CompareBar({ products }: { products: ProductDTO[] }) {
  const ids = useCompareStore((s) => s.ids);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);
  const t = useTranslation();

  const mounted = useHydrated();
  if (!mounted || ids.length === 0) return null;

  const selected = products.filter((p) => ids.includes(p.id));

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone bg-paper p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
      <div className="container-page flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold uppercase">
            {t("product.compare")}
          </span>
          {selected.map((p) => (
            <span
              key={p.id}
              className="flex items-center gap-2 rounded bg-mist px-2 py-1 text-xs"
            >
              {p.name}
              <button
                aria-label={t("product.removeFromCompare", { name: p.name })}
                onClick={() => remove(p.id)}
                className="font-bold"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <button
          onClick={clear}
          className="text-xs font-bold uppercase text-ink-soft hover:text-ink"
        >
          {t("product.clearAll")}
        </button>
      </div>
    </div>
  );
}
