import { describe, expect, it } from "vitest";
import {
  filterProducts,
  sortProducts,
  applyCatalog,
  facetCounts,
} from "./filter";
import type { ProductDTO } from "@/lib/catalog";

const make = (
  id: string,
  name: string,
  priceCents: number,
  inStock = true,
  brand = "Technogym",
  originCountry = "Италия",
): ProductDTO => ({
  id,
  slug: id,
  name,
  description: "",
  priceCents,
  currency: "RUB",
  images: [],
  features: [],
  badge: null,
  inStock,
  brand,
  originCountry,
  categorySlug: "c",
  categoryName: "C",
  variants: [],
});

const products = [
  make("1", "Bravo", 30000),
  make("2", "Alpha", 10000, false),
  make("3", "Charlie", 20000),
];

const sourced = [
  make("cn1", "UNIX A", 20000, true, "UNIX Fit", "Китай"),
  make("cn2", "UNIX B", 90000, true, "UNIX Fit", "Китай"),
  make("it1", "TG A", 500000, false, "Technogym", "Италия"),
  make("it2", "PN A", 400000, false, "Panatta", "Италия"),
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

describe("country and brand filters", () => {
  it("filters by a single country", () => {
    const out = filterProducts(sourced, { countries: ["Китай"] });
    expect(out.map((p) => p.id)).toEqual(["cn1", "cn2"]);
  });

  it("ORs values within a group", () => {
    const out = filterProducts(sourced, { countries: ["Китай", "Италия"] });
    expect(out).toHaveLength(4);
  });

  it("ANDs across groups", () => {
    const out = filterProducts(sourced, {
      countries: ["Италия"],
      brands: ["Panatta"],
    });
    expect(out.map((p) => p.id)).toEqual(["it2"]);
  });

  it("combines with price and stock", () => {
    const out = filterProducts(sourced, {
      countries: ["Китай"],
      maxPriceCents: 50000,
      inStockOnly: true,
    });
    expect(out.map((p) => p.id)).toEqual(["cn1"]);
  });

  it("empty groups are no-ops", () => {
    expect(filterProducts(sourced, { countries: [], brands: [] })).toHaveLength(4);
  });
});

describe("facetCounts", () => {
  it("counts each group against the other groups only", () => {
    const facets = facetCounts(sourced, { countries: ["Италия"] });
    // Country counts ignore the country selection itself…
    expect(facets.countries).toEqual({ Китай: 2, Италия: 2 });
    // …while brand counts respect it.
    expect(facets.brands).toEqual({ Technogym: 1, Panatta: 1 });
  });

  it("respects price and stock in both groups", () => {
    const facets = facetCounts(sourced, { inStockOnly: true });
    expect(facets.countries).toEqual({ Китай: 2 });
    expect(facets.brands).toEqual({ "UNIX Fit": 2 });
  });

  it("zeroes brands excluded by the selected country", () => {
    const facets = facetCounts(sourced, { countries: ["Китай"] });
    expect(facets.brands["Technogym"]).toBeUndefined();
    expect(facets.brands["UNIX Fit"]).toBe(2);
  });
});
