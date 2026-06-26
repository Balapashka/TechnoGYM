import { describe, expect, it } from "vitest";
import { filterProducts, sortProducts, applyCatalog } from "./filter";
import type { ProductDTO } from "@/lib/catalog";

const make = (
  id: string,
  name: string,
  priceCents: number,
  inStock = true,
): ProductDTO => ({
  id,
  slug: id,
  name,
  description: "",
  priceCents,
  currency: "EUR",
  images: [],
  features: [],
  badge: null,
  inStock,
  categorySlug: "c",
  categoryName: "C",
  variants: [],
});

const products = [
  make("1", "Bravo", 30000),
  make("2", "Alpha", 10000, false),
  make("3", "Charlie", 20000),
];

describe("filterProducts", () => {
  it("filters by max price", () => {
    const out = filterProducts(products, { maxPriceCents: 20000 });
    expect(out.map((p) => p.id)).toEqual(["2", "3"]);
  });

  it("filters out-of-stock items", () => {
    const out = filterProducts(products, { inStockOnly: true });
    expect(out.map((p) => p.id)).toEqual(["1", "3"]);
  });

  it("returns all when no options", () => {
    expect(filterProducts(products)).toHaveLength(3);
  });
});

describe("sortProducts", () => {
  it("sorts by price ascending and descending", () => {
    expect(sortProducts(products, "price-asc").map((p) => p.priceCents)).toEqual(
      [10000, 20000, 30000],
    );
    expect(
      sortProducts(products, "price-desc").map((p) => p.priceCents),
    ).toEqual([30000, 20000, 10000]);
  });

  it("sorts by name", () => {
    expect(sortProducts(products, "name").map((p) => p.name)).toEqual([
      "Alpha",
      "Bravo",
      "Charlie",
    ]);
  });

  it("does not mutate the input", () => {
    const before = products.map((p) => p.id);
    sortProducts(products, "price-asc");
    expect(products.map((p) => p.id)).toEqual(before);
  });
});

describe("applyCatalog", () => {
  it("filters then sorts", () => {
    const out = applyCatalog(
      products,
      { inStockOnly: true },
      "price-desc",
    );
    expect(out.map((p) => p.id)).toEqual(["1", "3"]);
  });
});
