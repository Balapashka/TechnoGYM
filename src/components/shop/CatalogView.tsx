"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ProductCard } from "./ProductCard";
import { CompareBar } from "./CompareBar";
import { useCompareStore } from "@/store/compare-store";
import type { FacetCounts, SortKey } from "@/lib/filter";
import type { CatalogQuery } from "@/lib/catalog-url";
import type { BrandOption, CountryOption } from "./CatalogShell";
import type { ProductDTO } from "@/lib/catalog";
import { useTranslation } from "@/i18n/useTranslation";
import {
  countryLabel,
  formatProductCount,
  type Locale,
} from "@/i18n/translations";
import { useDisplayCountry } from "@/store/locale-store";
import { BASE_CURRENCY, formatPriceIn } from "@/lib/format";
import { cn } from "@/lib/cn";

const SORT_OPTIONS: { key: SortKey; labelKey: string }[] = [
  { key: "featured", labelKey: "catalog.sortFeatured" },
  { key: "price-asc", labelKey: "catalog.sortPriceAsc" },
  { key: "price-desc", labelKey: "catalog.sortPriceDesc" },
  { key: "name", labelKey: "catalog.sortName" },
];

type CatalogViewProps = {
  products: ProductDTO[];
  visible: ProductDTO[];
  query: CatalogQuery;
  facets: FacetCounts;
  countryOptions: CountryOption[];
  brandOptions: BrandOption[];
  onChange: (next: CatalogQuery, mode?: "push" | "replace") => void;
};

/** Catalog (PLP) view: faceted filters + sort on the left, grid on the right. */
export function CatalogView(props: CatalogViewProps) {
  const { products, visible, query, onChange } = props;
  const t = useTranslation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const toggleCompare = useCompareStore((s) => s.toggle);
  const compareIds = useCompareStore((s) => s.ids);

  useEffect(() => {
    if (!sheetOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  const activeCount =
    query.countries.length +
    query.brands.length +
    (query.maxPriceRub != null ? 1 : 0) +
    (query.inStockOnly ? 1 : 0);

  const resetAll = () =>
    onChange({ ...query, countries: [], brands: [], maxPriceRub: null, inStockOnly: false });

  return (
    <div className="container-page grid gap-8 py-10 lg:grid-cols-[16rem_1fr]">
      <aside className="hidden space-y-8 lg:sticky lg:top-24 lg:block lg:h-fit">
        <FilterControls {...props} />
      </aside>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="hover-lift inline-flex items-center gap-2 rounded-full border border-stone bg-paper px-5 py-2.5 text-sm font-bold uppercase"
          >
            {t("catalog.filters")}
            {activeCount > 0 && (
              <span className="grid h-5 w-5 place-items-center rounded-full bg-accent text-[11px] font-black text-ink">
                {activeCount}
              </span>
            )}
          </button>
        </div>

        <ActiveChips {...props} onReset={resetAll} />

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
            <div className="col-span-full py-16 text-center">
              <p className="text-xl font-black uppercase">
                {t("catalog.emptyTitle")}
              </p>
              <p className="mt-2 text-sm text-ink-soft">{t("catalog.noMatches")}</p>
              <button
                type="button"
                onClick={resetAll}
                className="hover-lift mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
              >
                {t("catalog.resetAll")}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        resultCount={visible.length}
        {...props}
      />

      <CompareBar products={products} />
    </div>
  );
}

/* ── Filter controls (shared by the sidebar and the mobile sheet) ───────── */

function FilterControls({
  products,
  visible,
  query,
  facets,
  countryOptions,
  brandOptions,
  onChange,
}: CatalogViewProps) {
  const t = useTranslation();
  const country = useDisplayCountry();
  const [sortOpen, setSortOpen] = useState(false);

  // Every product in a listing shares one currency; fall back to the base one.
  const currency = products[0]?.currency ?? BASE_CURRENCY;

  const priceCeiling = useMemo(
    () => Math.max(...products.map((p) => p.priceCents), 0),
    [products],
  );
  const maxPriceCents = query.maxPriceRub != null ? query.maxPriceRub * 100 : null;

  /** Brands that structurally exist within the selected countries. */
  const visibleBrands = useMemo(() => {
    if (!query.countries.length) return brandOptions;
    const origins = new Set(
      countryOptions
        .filter((c) => query.countries.includes(c.code))
        .map((c) => c.origin),
    );
    const names = new Set(
      products.filter((p) => origins.has(p.originCountry)).map((p) => p.brand),
    );
    return brandOptions.filter((b) => names.has(b.name));
  }, [query.countries, countryOptions, brandOptions, products]);

  const toggleCountry = (code: string) => {
    const countries = query.countries.includes(code)
      ? query.countries.filter((c) => c !== code)
      : [...query.countries, code];

    // Prune brand picks that no longer exist within the country selection,
    // so the URL never carries an invisible active filter.
    const origins = new Set(
      countryOptions
        .filter((c) => countries.includes(c.code))
        .map((c) => c.origin),
    );
    const reachable = new Set(
      products
        .filter((p) => !countries.length || origins.has(p.originCountry))
        .map((p) => p.brand),
    );
    const brands = query.brands.filter((slug) =>
      brandOptions.some((b) => b.slug === slug && reachable.has(b.name)),
    );
    onChange({ ...query, countries, brands });
  };

  const toggleBrand = (slug: string) => {
    const brands = query.brands.includes(slug)
      ? query.brands.filter((b) => b !== slug)
      : [...query.brands, slug];
    onChange({ ...query, brands });
  };

  return (
    <div className="space-y-8">
      {/* Animated custom sort dropdown */}
      <div className="relative">
        <p className="mb-2 block text-xs font-bold uppercase tracking-wide">
          {t("catalog.sortBy")}
        </p>
        <button
          type="button"
          onClick={() => setSortOpen((v) => !v)}
          aria-expanded={sortOpen}
          className="hover-lift flex w-full items-center justify-between rounded-xl border border-stone bg-paper px-4 py-3 text-sm font-semibold"
        >
          {t(
            SORT_OPTIONS.find((o) => o.key === query.sort)?.labelKey ??
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
                        onChange({ ...query, sort: o.key });
                        setSortOpen(false);
                      }}
                      className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition hover:bg-mist ${
                        o.key === query.sort ? "font-bold" : ""
                      }`}
                    >
                      {t(o.labelKey)}
                      {o.key === query.sort && (
                        <span className="text-accent-strong">●</span>
                      )}
                    </button>
                  </li>
                ))}
              </motion.ul>
            </>
          )}
        </AnimatePresence>
      </div>

      <fieldset>
        <legend className="mb-3 text-xs font-bold uppercase tracking-wide">
          {t("product.origin")}
        </legend>
        <div className="space-y-2.5">
          {countryOptions.map((c) => (
            <FilterCheckbox
              key={c.code}
              label={countryLabel(t.locale, c.code, c.origin)}
              count={facets.countries[c.origin] ?? 0}
              checked={query.countries.includes(c.code)}
              onChange={() => toggleCountry(c.code)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-bold uppercase tracking-wide">
          {t("product.brand")}
        </legend>
        <div className="space-y-2.5">
          {visibleBrands.map((b) => (
            <FilterCheckbox
              key={b.slug}
              label={b.name}
              count={facets.brands[b.name] ?? 0}
              checked={query.brands.includes(b.slug)}
              onChange={() => toggleBrand(b.slug)}
            />
          ))}
        </div>
      </fieldset>

      {/* Themed price slider with floating value chip */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label htmlFor="catalog-max-price" className="text-xs font-bold uppercase tracking-wide">
            {t("catalog.maxPrice")}
          </label>
          <motion.span
            key={maxPriceCents ?? "any"}
            initial={{ scale: 0.8, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-paper"
          >
            {maxPriceCents != null
              ? formatPriceIn(maxPriceCents, currency, country)
              : t("catalog.any")}
          </motion.span>
        </div>
        <input
          id="catalog-max-price"
          type="range"
          min={0}
          max={priceCeiling}
          step={10000}
          value={maxPriceCents ?? priceCeiling}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(
              {
                ...query,
                maxPriceRub: v >= priceCeiling ? null : Math.round(v / 100),
              },
              "replace",
            );
          }}
          className="range-themed w-full"
          style={{
            ["--fill" as string]: `${
              priceCeiling
                ? ((maxPriceCents ?? priceCeiling) / priceCeiling) * 100
                : 100
            }%`,
          }}
        />
        <div className="mt-1 flex justify-between text-[11px] text-ink-soft">
          <span>{formatPriceIn(0, currency, country)}</span>
          <span>{formatPriceIn(priceCeiling, currency, country)}</span>
        </div>
      </div>

      {/* Animated toggle switch */}
      <button
        type="button"
        onClick={() => onChange({ ...query, inStockOnly: !query.inStockOnly })}
        role="switch"
        aria-checked={query.inStockOnly}
        className="flex w-full items-center justify-between"
      >
        <span className="text-sm font-semibold">{t("catalog.inStockOnly")}</span>
        <span
          className={`relative h-6 w-11 rounded-full transition-colors ${
            query.inStockOnly ? "bg-accent" : "bg-stone"
          }`}
        >
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 600, damping: 32 }}
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink ${
              query.inStockOnly ? "right-0.5" : "left-0.5"
            }`}
          />
        </span>
      </button>

      <p
        aria-live="polite"
        className="rounded-lg bg-mist px-3 py-2 text-xs font-semibold text-ink-soft"
      >
        {formatProductCount(t.locale, visible.length)}
      </p>
    </div>
  );
}

function FilterCheckbox({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: () => void;
}) {
  const disabled = count === 0 && !checked;
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-2 text-sm",
        disabled ? "cursor-not-allowed text-ink-soft/60" : "cursor-pointer",
      )}
    >
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={onChange}
          className="h-4 w-4 accent-accent-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-strong"
        />
        <span className={checked ? "font-bold" : undefined}>{label}</span>
      </span>
      <span className="text-xs tabular-nums text-ink-soft">{count}</span>
    </label>
  );
}

/* ── Active filter chips ────────────────────────────────────────────────── */

function ActiveChips(
  props: CatalogViewProps & { onReset: () => void },
) {
  const { query, countryOptions, brandOptions, onChange, onReset } = props;
  const t = useTranslation();
  const country = useDisplayCountry();
  const currency = props.products[0]?.currency ?? BASE_CURRENCY;

  type Chip = { key: string; label: string; remove: () => void };
  const chips: Chip[] = [
    ...query.countries.map((code) => ({
      key: `country-${code}`,
      label: countryLabel(
        t.locale,
        code,
        countryOptions.find((c) => c.code === code)?.origin,
      ),
      remove: () =>
        onChange({
          ...query,
          countries: query.countries.filter((c) => c !== code),
        }),
    })),
    ...query.brands.map((slug) => ({
      key: `brand-${slug}`,
      label: brandOptions.find((b) => b.slug === slug)?.name ?? slug,
      remove: () =>
        onChange({ ...query, brands: query.brands.filter((b) => b !== slug) }),
    })),
    ...(query.maxPriceRub != null
      ? [
          {
            key: "max",
            label: `≤ ${formatPriceIn(query.maxPriceRub * 100, currency, country)}`,
            remove: () => onChange({ ...query, maxPriceRub: null }),
          },
        ]
      : []),
    ...(query.inStockOnly
      ? [
          {
            key: "stock",
            label: t("catalog.inStockOnly"),
            remove: () => onChange({ ...query, inStockOnly: false }),
          },
        ]
      : []),
  ];

  if (!chips.length) return null;

  return (
    <div
      aria-label={t("catalog.activeFilters")}
      className="flex flex-wrap items-center gap-2"
    >
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.remove}
          aria-label={t("catalog.removeFilter", { name: chip.label })}
          className="hover-lift inline-flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-xs font-bold uppercase text-paper"
        >
          {chip.label}
          <span aria-hidden="true" className="text-paper/70">
            ×
          </span>
        </button>
      ))}
      <button
        type="button"
        onClick={onReset}
        className="text-xs font-bold uppercase text-ink-soft underline-offset-4 hover:underline"
      >
        {t("catalog.resetAll")}
      </button>
    </div>
  );
}

/* ── Mobile bottom-sheet ────────────────────────────────────────────────── */

function FilterSheet(
  props: CatalogViewProps & {
    open: boolean;
    onClose: () => void;
    resultCount: number;
  },
) {
  const { open, onClose, resultCount, ...controls } = props;
  const t = useTranslation();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t("catalog.filters")}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overflow-hidden rounded-t-3xl bg-paper lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-stone px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-soft">
                {t("catalog.filters")}
              </p>
              <button
                onClick={onClose}
                aria-label={t("common.close")}
                className="hover-lift grid h-9 w-9 place-items-center rounded-full border border-stone text-lg"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FilterControls {...controls} />
            </div>
            <div className="border-t border-stone bg-paper px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="hover-lift w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold uppercase text-ink"
              >
                {t("catalog.show", {
                  count: formatProductCount(t.locale as Locale, resultCount),
                })}
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
