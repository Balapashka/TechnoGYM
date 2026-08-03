import type { ProductDTO } from "@/lib/catalog";
import { originRank } from "@/lib/countries";

export type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export type FilterOptions = {
  maxPriceCents?: number;
  inStockOnly?: boolean;
  /** Raw `originCountry` values; OR within the group. */
  countries?: string[];
  /** Raw `brand` values; OR within the group. */
  brands?: string[];
};

/** Filter products (groups combine as AND). Pure — safe to unit test. */
export function filterProducts(
  products: ProductDTO[],
  { maxPriceCents, inStockOnly, countries, brands }: FilterOptions = {},
): ProductDTO[] {
  return products.filter((p) => {
    if (inStockOnly && !p.inStock) return false;
    // A max-price filter only applies to products that actually show a price:
    // matching "price on request" items against a hidden figure would produce
    // results the visitor cannot explain.
    if (maxPriceCents != null) {
      if (p.priceOnRequest) return false;
      if (p.priceCents > maxPriceCents) return false;
    }
    if (countries?.length && !countries.includes(p.originCountry)) return false;
    if (brands?.length && !brands.includes(p.brand)) return false;
    return true;
  });
}

export type FacetCounts = {
  /** originCountry -> product count with every filter except the country group. */
  countries: Record<string, number>;
  /** brand -> product count with every filter except the brand group. */
  brands: Record<string, number>;
};

/**
 * Option counts for the filter UI. Standard faceting: each group is counted
 * against all *other* active groups, so checking an option never zeroes its
 * own group's siblings.
 */
export function facetCounts(
  products: ProductDTO[],
  options: FilterOptions,
): FacetCounts {
  const countries: Record<string, number> = {};
  for (const p of filterProducts(products, { ...options, countries: undefined })) {
    if (p.originCountry) {
      countries[p.originCountry] = (countries[p.originCountry] ?? 0) + 1;
    }
  }
  const brands: Record<string, number> = {};
  for (const p of filterProducts(products, { ...options, brands: undefined })) {
    if (p.brand) brands[p.brand] = (brands[p.brand] ?? 0) + 1;
  }
  return { countries, brands };
}

/** Products without a public price sort after the priced ones. */
const quotedLast = (p: ProductDTO) => (p.priceOnRequest ? 1 : 0);

/**
 * Return a new sorted array (does not mutate the input).
 *
 * `featured` is the default the storefront opens on: it leads with the
 * priority sourcing country (see ORIGIN_PRIORITY in src/lib/countries.ts) and
 * keeps the incoming order inside each group — `Array.sort` is stable.
 */
export function sortProducts(
  products: ProductDTO[],
  sort: SortKey,
): ProductDTO[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort(
        (a, b) => quotedLast(a) - quotedLast(b) || a.priceCents - b.priceCents,
      );
    case "price-desc":
      return copy.sort(
        (a, b) => quotedLast(a) - quotedLast(b) || b.priceCents - a.priceCents,
      );
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return copy.sort(
        (a, b) => originRank(a.originCountry) - originRank(b.originCountry),
      );
  }
}

/** Apply filters then sort, in one pass. */
export function applyCatalog(
  products: ProductDTO[],
  options: FilterOptions,
  sort: SortKey,
): ProductDTO[] {
  return sortProducts(filterProducts(products, options), sort);
}
