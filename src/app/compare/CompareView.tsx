"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useCompareStore } from "@/store/compare-store";
import { useTranslation } from "@/i18n/useTranslation";
import { useHydrated } from "@/lib/use-hydrated";
import { useDisplayCountry } from "@/store/locale-store";
import { formatPriceIn } from "@/lib/format";
import { categoryName } from "@/i18n/translations";
import { Media } from "@/components/ui/Media";
import { PriceOrRequest } from "@/components/ui/Price";
import { RequestPriceButton } from "@/components/shop/RequestPriceButton";
import { Availability } from "@/components/shop/Availability";
import { cn } from "@/lib/cn";
import type { ProductDTO } from "@/lib/catalog";

/** A comparison row: `value` is the string used to detect differences. */
type Row = {
  key: string;
  label: string;
  value: (p: ProductDTO) => string;
  render?: (p: ProductDTO) => ReactNode;
};

/** Comparison grid for the products selected via the compare store. */
export function CompareView() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.removeFromCompare);
  const clear = useCompareStore((s) => s.clearCompare);
  const t = useTranslation();
  const country = useDisplayCountry();
  const [onlyDiffs, setOnlyDiffs] = useState(false);

  const mounted = useHydrated();
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="container-page flex-1 py-20 text-center">
        <h1 className="mb-3 text-3xl font-black uppercase">
          {t("compare.title")}
        </h1>
        <p className="text-ink-soft">{t("compare.empty")}</p>
        <p className="mt-1 text-sm text-ink-soft">{t("compare.emptyHint")}</p>
        <Link
          href="/category/all"
          className="hover-lift mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-bold uppercase text-ink"
        >
          {t("cart.browseProducts")}
        </Link>
      </div>
    );
  }

  const rows: Row[] = [
    {
      key: "price",
      label: t("compare.price"),
      // Quote-only products compare on the label, not on the hidden amount, so
      // "only differences" never singles one out by a price nobody can see.
      value: (p) =>
        p.priceOnRequest
          ? t("product.priceOnRequest")
          : formatPriceIn(p.priceCents, p.currency, country),
      render: (p) => (
        <>
          <PriceOrRequest product={p} />
          {/* Without this the column shows a hidden price and no way to ask
              for it — the whole point of the comparison is to act on it. */}
          {p.priceOnRequest && (
            <RequestPriceButton
              product={p}
              className="mt-2 rounded-full border border-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide transition-colors hover:bg-ink hover:text-paper"
            />
          )}
        </>
      ),
    },
    {
      key: "brand",
      label: t("product.brand"),
      value: (p) => p.brand || "—",
    },
    {
      key: "origin",
      label: t("product.origin"),
      value: (p) => p.originCountry || "—",
    },
    {
      key: "category",
      label: t("compare.category"),
      value: (p) => categoryName(t.locale, p.categorySlug, p.categoryName),
    },
    {
      key: "availability",
      label: t("compare.availability"),
      value: (p) =>
        p.inStock ? t("product.inStock") : t("product.madeToOrder"),
      render: (p) => <Availability inStock={p.inStock} />,
    },
    {
      key: "features",
      label: t("product.specs"),
      value: (p) => p.features.join(" | "),
      render: (p) => (
        <ul className="list-inside list-disc space-y-1 text-left text-xs">
          {p.features.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      ),
    },
  ];

  const differs = (row: Row) =>
    new Set(items.map(row.value)).size > 1;

  const visibleRows =
    onlyDiffs && items.length > 1 ? rows.filter(differs) : rows;

  return (
    <div className="container-page flex-1 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-black uppercase">{t("compare.title")}</h1>
        <div className="flex items-center gap-5">
          {items.length > 1 && (
            <button
              type="button"
              role="switch"
              aria-checked={onlyDiffs}
              onClick={() => setOnlyDiffs((v) => !v)}
              className="flex items-center gap-2.5"
            >
              <span
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  onlyDiffs ? "bg-accent" : "bg-stone",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 h-5 w-5 rounded-full bg-ink transition-all",
                    onlyDiffs ? "left-[1.375rem]" : "left-0.5",
                  )}
                />
              </span>
              <span className="text-sm font-semibold">
                {t("compare.onlyDifferences")}
              </span>
            </button>
          )}
          <button
            type="button"
            onClick={clear}
            className="text-xs font-bold uppercase text-ink-soft hover:text-ink"
          >
            {t("product.clearAll")}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 w-36 min-w-36 bg-paper p-4" />
              {items.map((p) => (
                <th
                  key={p.id}
                  className="min-w-48 border-l border-stone p-4 align-top font-normal"
                >
                  <div className="relative mx-auto mb-3 aspect-square w-32 overflow-hidden rounded-lg bg-mist">
                    <Media src={p.images[0] ?? null} alt={p.name} sizes="128px" />
                  </div>
                  <Link
                    href={`/product/${p.slug}`}
                    className="block text-sm font-bold uppercase tracking-wide hover:underline"
                  >
                    {p.name}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="mt-2 text-xs font-bold uppercase text-ink-soft hover:text-ink"
                  >
                    {t("product.remove")} ×
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const highlight = items.length > 1 && differs(row);
              return (
                <tr
                  key={row.key}
                  className={cn(
                    "border-t border-stone",
                    highlight && "bg-accent/10",
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 z-10 w-36 min-w-36 bg-paper p-4 text-left align-top text-xs font-bold uppercase tracking-wide text-ink-soft"
                  >
                    {row.label}
                  </th>
                  {items.map((p) => (
                    <td
                      key={p.id}
                      className={cn(
                        "border-l border-stone p-4 text-center align-top",
                        highlight && "font-semibold",
                      )}
                    >
                      {row.render ? row.render(p) : row.value(p)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
