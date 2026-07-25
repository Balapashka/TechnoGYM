"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "./ProductCard";
import { CompareBar } from "./CompareBar";
import { useCompareStore } from "@/store/compare-store";
import { applyCatalog, type SortKey } from "@/lib/filter";
import type { ProductDTO } from "@/lib/catalog";
import { useTranslation } from "@/i18n/useTranslation";

const SORT_OPTIONS: { key: SortKey; labelKey: string }[] = [
  { key: "featured", labelKey: "catalog.sortFeatured" },
  { key: "price-asc", labelKey: "catalog.sortPriceAsc" },
  { key: "price-desc", labelKey: "catalog.sortPriceDesc" },
  { key: "name", labelKey: "catalog.sortName" },
];

/** Catalog (PLP) view: filters + sort on the left, product grid on the right. */
export function CatalogView({ products }: { products: ProductDTO[] }) {
  const t = useTranslation();
  const [sort, setSort] = useState<SortKey>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  const toggleCompare = useCompareStore((s) => s.toggle);
  const compareIds = useCompareStore((s) => s.ids);

  const priceCeiling = useMemo(
    () => Math.max(...products.map((p) => p.priceCents), 0),
    [products],
  );

  const visible = useMemo(
    () =>
      applyCatalog(products, { inStockOnly, maxPriceCents: maxPrice }, sort),
    [products, inStockOnly, maxPrice, sort],
  );

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[16rem_1fr]">
      <aside className="space-y-8 lg:sticky lg:top-24 lg:h-fit">
        {/* Animated custom sort dropdown */}
        <div className="relative">
          <label className="mb-2 block text-xs font-bold uppercase tracking-wide">
            {t("catalog.sortBy")}
          </label>
          <button
            type="button"
            onClick={() => setSortOpen((v) => !v)}
            className="hover-lift flex w-full items-center justify-between rounded-xl border border-stone bg-paper px-4 py-3 text-sm font-semibold"
          >
            {t(
              SORT_OPTIONS.find((o) => o.key === sort)?.labelKey ??
                "catalog.sortFeatured",
            )}
            <motion.span animate={{ rotate: sortOpen ? 180 : 0 }} className="text-ink-soft">
              ▾
            </motion.span>
          </button>
          <AnimatePresence>
            {sortOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                <motion.ul
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-stone bg-paper shadow-xl"
                >
                  {SORT_OPTIONS.map((o) => (
                    <li key={o.key}>
                      <button
                        onClick={() => {
                          setSort(o.key);
                          setSortOpen(false);
                        }}
                        className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-mist ${
                          o.key === sort ? "font-bold" : ""
                        }`}
                      >
                        {t(o.labelKey)}
                        {o.key === sort && <span className="text-accent-strong">●</span>}
                      </button>
                    </li>
                  ))}
                </motion.ul>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Themed price slider with floating value chip */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wide">
              {t("catalog.maxPrice")}
            </label>
            <motion.span
              key={maxPrice ?? "any"}
              initial={{ scale: 0.8, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper"
            >
              {maxPrice
                ? `€${Math.round(maxPrice / 100).toLocaleString()}`
                : t("catalog.any")}
            </motion.span>
          </div>
          <input
            type="range"
            min={0}
            max={priceCeiling}
            step={10000}
            value={maxPrice ?? priceCeiling}
            onChange={(e) => {
              const v = Number(e.target.value);
              setMaxPrice(v >= priceCeiling ? undefined : v);
            }}
            className="range-themed w-full"
            style={{
              ["--fill" as string]: `${
                priceCeiling ? ((maxPrice ?? priceCeiling) / priceCeiling) * 100 : 100
              }%`,
            }}
          />
          <div className="mt-1 flex justify-between text-[11px] text-ink-soft">
            <span>€0</span>
            <span>€{Math.round(priceCeiling / 100).toLocaleString()}</span>
          </div>
        </div>

        {/* Animated toggle switch */}
        <button
          type="button"
          onClick={() => setInStockOnly((v) => !v)}
          className="flex w-full items-center justify-between"
        >
          <span className="text-sm font-semibold">{t("catalog.inStockOnly")}</span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              inStockOnly ? "bg-accent" : "bg-stone"
            }`}
          >
            <motion.span
              layout
              transition={{ type: "spring", stiffness: 600, damping: 32 }}
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink ${
                inStockOnly ? "right-0.5" : "left-0.5"
              }`}
            />
          </span>
        </button>

        <p className="rounded-lg bg-mist px-3 py-2 text-xs font-semibold text-ink-soft">
          {t("catalog.productCount", { count: visible.length })}
        </p>
      </aside>

      <motion.div layout className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {visible.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <ProductCard product={p} />
              <label className="mt-2 flex items-center gap-2 px-4 text-xs text-ink-soft">
                <input
                  type="checkbox"
                  checked={compareIds.includes(p.id)}
                  onChange={() => toggleCompare(p.id)}
                />
                {t("catalog.compare")}
              </label>
            </motion.div>
          ))}
        </AnimatePresence>
        {visible.length === 0 && (
          <p className="col-span-full py-10 text-center text-ink-soft">
            {t("catalog.noMatches")}
          </p>
        )}
      </motion.div>

      <CompareBar products={products} />
    </div>
  );
}
