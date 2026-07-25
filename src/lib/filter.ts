import type { ProductDTO } from "@/lib/catalog";

export type SortKey = "featured" | "price-asc" | "price-desc" | "name";

export type FilterOptions = {
  maxPriceCents?: number;
  inStockOnly?: boolean;
};

/** Filter products by price ceiling and stock. Pure — safe to unit test. */
export function filterProducts(
  products: ProductDTO[],
  { maxPriceCents, inStockOnly }: FilterOptions = {},
): ProductDTO[] {
  return products.filter((p) => {
    if (inStockOnly && !p.inStock) return false;
    if (maxPriceCents != null && p.priceCents > maxPriceCents) return false;
    return true;
  });
}

/** Return a new sorted array (does not mutate the input). */
export function sortProducts(
  products: ProductDTO[],
  sort: SortKey,
): ProductDTO[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.priceCents - b.priceCents);
    case "price-desc":
      return copy.sort((a, b) => b.priceCents - a.priceCents);
    case "name":
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
    default:
      return copy;
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
