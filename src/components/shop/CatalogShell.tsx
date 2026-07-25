"use client";

import { useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { CatalogHeader } from "./CatalogHeader";
import { CatalogView } from "./CatalogView";
import {
  applyCatalog,
  facetCounts,
  type FilterOptions,
} from "@/lib/filter";
import {
  parseCatalogQuery,
  serializeCatalogQuery,
  brandSlug,
  type CatalogQuery,
} from "@/lib/catalog-url";
import { countryCode, originFromCode } from "@/lib/countries";
import type { ProductDTO } from "@/lib/catalog";

export type CountryOption = { origin: string; code: string };
export type BrandOption = { name: string; slug: string };

/**
 * Client shell of a PLP: reads the filter state from the URL, filters the
 * server-provided DTOs and keeps the header count live. State changes are
 * written back via history so links share, back works and SSR restores.
 */
export function CatalogShell({
  slug,
  fallbackTitle,
  products,
}: {
  slug: string | null;
  fallbackTitle: string;
  products: ProductDTO[];
}) {
  const searchParams = useSearchParams();
  const query = useMemo(
    () => parseCatalogQuery(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  // Facet dictionaries come from the data, never from a hardcoded list.
  const countryOptions = useMemo<CountryOption[]>(() => {
    const origins = [...new Set(products.map((p) => p.originCountry))].filter(
      Boolean,
    );
    return origins
      .sort((a, b) => a.localeCompare(b))
      .map((origin) => ({ origin, code: countryCode(origin) ?? origin }));
  }, [products]);

  const brandOptions = useMemo<BrandOption[]>(() => {
    const names = [...new Set(products.map((p) => p.brand))].filter(Boolean);
    return names
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({ name, slug: brandSlug(name) }));
  }, [products]);

  // URL tokens -> raw data values for the pure filter layer.
  const options = useMemo<FilterOptions>(
    () => ({
      inStockOnly: query.inStockOnly || undefined,
      maxPriceCents:
        query.maxPriceRub != null ? query.maxPriceRub * 100 : undefined,
      countries: query.countries.length
        ? query.countries.map((code) => originFromCode(code) ?? code)
        : undefined,
      brands: query.brands.length
        ? query.brands
            .map((s) => brandOptions.find((b) => b.slug === s)?.name)
            .filter((n): n is string => Boolean(n))
        : undefined,
    }),
    [query, brandOptions],
  );

  const visible = useMemo(
    () => applyCatalog(products, options, query.sort),
    [products, options, query.sort],
  );
  const facets = useMemo(
    () => facetCounts(products, options),
    [products, options],
  );

  const onChange = useCallback(
    (next: CatalogQuery, mode: "push" | "replace" = "push") => {
      const url = `${window.location.pathname}${serializeCatalogQuery(next)}`;
      if (mode === "replace") window.history.replaceState(null, "", url);
      else window.history.pushState(null, "", url);
    },
    [],
  );

  return (
    <>
      <CatalogHeader
        slug={slug}
        fallbackTitle={fallbackTitle}
        count={visible.length}
      />
      <CatalogView
        products={products}
        visible={visible}
        query={query}
        facets={facets}
        countryOptions={countryOptions}
        brandOptions={brandOptions}
        onChange={onChange}
      />
    </>
  );
}
