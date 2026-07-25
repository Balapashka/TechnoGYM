import { describe, expect, it } from "vitest";
import {
  parseCatalogQuery,
  serializeCatalogQuery,
  brandSlug,
  DEFAULT_CATALOG_QUERY,
} from "./catalog-url";

describe("brandSlug", () => {
  it("slugifies brand names", () => {
    expect(brandSlug("UNIX Fit")).toBe("unix-fit");
    expect(brandSlug("Technogym")).toBe("technogym");
  });
});

describe("parseCatalogQuery", () => {
  it("returns defaults for an empty query", () => {
    expect(parseCatalogQuery(new URLSearchParams())).toEqual(
      DEFAULT_CATALOG_QUERY,
    );
  });

  it("parses lists, price, stock and sort", () => {
    const q = parseCatalogQuery(
      new URLSearchParams(
        "country=cn,it&brand=unix-fit&max=250000&stock=1&sort=price-asc",
      ),
    );
    expect(q).toEqual({
      countries: ["cn", "it"],
      brands: ["unix-fit"],
      maxPriceRub: 250000,
      inStockOnly: true,
      sort: "price-asc",
    });
  });

  it("drops malformed values", () => {
    const q = parseCatalogQuery(
      new URLSearchParams("max=abc&sort=hack&country=,,&stock=2"),
    );
    expect(q).toEqual(DEFAULT_CATALOG_QUERY);
  });

  it("dedupes repeated tokens", () => {
    const q = parseCatalogQuery(new URLSearchParams("brand=technogym,technogym"));
    expect(q.brands).toEqual(["technogym"]);
  });
});

describe("serializeCatalogQuery", () => {
  it("serializes an empty query to an empty string", () => {
    expect(serializeCatalogQuery(DEFAULT_CATALOG_QUERY)).toBe("");
  });

  it("round-trips through parse", () => {
    const q = {
      countries: ["it"],
      brands: ["technogym", "panatta"],
      maxPriceRub: 900000,
      inStockOnly: true,
      sort: "price-desc" as const,
    };
    const s = serializeCatalogQuery(q);
    expect(parseCatalogQuery(new URLSearchParams(s.slice(1)))).toEqual(q);
  });
});
