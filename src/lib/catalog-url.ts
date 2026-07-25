import type { SortKey } from "@/lib/filter";

/**
 * Catalog filter state as it lives in the URL, so listings are shareable,
 * the back button works and SSR restores the exact view.
 * Countries are codes (see lib/countries), brands are brand slugs.
 */
export type CatalogQuery = {
  countries: string[];
  brands: string[];
  /** Price ceiling in whole roubles; null = no ceiling. */
  maxPriceRub: number | null;
  inStockOnly: boolean;
  sort: SortKey;
};

export const DEFAULT_CATALOG_QUERY: CatalogQuery = {
  countries: [],
  brands: [],
  maxPriceRub: null,
  inStockOnly: false,
  sort: "featured",
};

const SORT_KEYS: SortKey[] = ["featured", "price-asc", "price-desc", "name"];

/** URL slug for a brand name: "UNIX Fit" -> "unix-fit". */
export function brandSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseList(value: string | null): string[] {
  if (!value) return [];
  return [...new Set(value.split(",").map((s) => s.trim()).filter(Boolean))];
}

export function parseCatalogQuery(params: URLSearchParams): CatalogQuery {
  const max = Number(params.get("max"));
  const sort = params.get("sort") as SortKey | null;
  return {
    countries: parseList(params.get("country")),
    brands: parseList(params.get("brand")),
    maxPriceRub: Number.isFinite(max) && max > 0 ? Math.round(max) : null,
    inStockOnly: params.get("stock") === "1",
    sort: sort && SORT_KEYS.includes(sort) ? sort : "featured",
  };
}

/** Serialize back to a query string ("" when everything is default). */
export function serializeCatalogQuery(q: CatalogQuery): string {
  const params = new URLSearchParams();
  if (q.countries.length) params.set("country", q.countries.join(","));
  if (q.brands.length) params.set("brand", q.brands.join(","));
  if (q.maxPriceRub != null) params.set("max", String(q.maxPriceRub));
  if (q.inStockOnly) params.set("stock", "1");
  if (q.sort !== "featured") params.set("sort", q.sort);
  const s = params.toString();
  return s ? `?${s}` : "";
}
