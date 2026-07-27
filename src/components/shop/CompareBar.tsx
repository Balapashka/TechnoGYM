"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useCompareStore, COMPARE_LIMIT } from "@/store/compare-store";
import { useTranslation } from "@/i18n/useTranslation";
import { useHydrated } from "@/lib/use-hydrated";
import { Media } from "@/components/ui/Media";

/**
 * Floating bottom bar shown on every page while the comparison list is
 * non-empty: product thumbnails, an N/4 counter, clear and a CTA to /compare.
 */
export function CompareBar() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.removeFromCompare);
  const clear = useCompareStore((s) => s.clearCompare);
  const t = useTranslation();
  const pathname = usePathname();

  const mounted = useHydrated();
  const visible = mounted && items.length > 0 && pathname !== "/compare";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          exit={{ y: "110%" }}
          transition={{ type: "spring", stiffness: 380, damping: 36 }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-stone bg-paper p-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
        >
          <div className="container-page flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold uppercase">
                {t("product.compare")}
                <span className="ml-2 tabular-nums text-ink-soft">
                  {items.length}/{COMPARE_LIMIT}
                </span>
              </span>
              <div className="flex items-center gap-2">
                {items.map((p) => (
                  <div
                    key={p.id}
                    className="group/thumb relative h-12 w-12 overflow-hidden rounded-lg border border-stone bg-mist"
                  >
                    <Media
                      src={p.images[0] ?? null}
                      alt={p.name}
                      sizes="48px"
                    />
                    <button
                      type="button"
                      aria-label={t("product.removeFromCompare", {
                        name: p.name,
                      })}
                      onClick={() => remove(p.id)}
                      className="absolute inset-0 grid place-items-center bg-ink/60 text-lg font-bold text-paper opacity-0 transition-opacity focus-visible:opacity-100 group-hover/thumb:opacity-100"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={clear}
                className="text-xs font-bold uppercase text-ink-soft hover:text-ink"
              >
                {t("product.clearAll")}
              </button>
              <Link
                href="/compare"
                className="hover-lift rounded-full bg-accent px-5 py-2.5 text-xs font-bold uppercase text-ink hover:bg-accent-strong"
              >
                {t("compare.compareCta")}
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
