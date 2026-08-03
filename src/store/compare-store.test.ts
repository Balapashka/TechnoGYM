import { beforeEach, describe, expect, it } from "vitest";
import { useCompareStore, COMPARE_LIMIT } from "./compare-store";
import type { ProductDTO } from "@/lib/catalog";

/** Minimal product fixture — only identity matters to the store. */
function product(id: string): ProductDTO {
  return {
    id,
    slug: `product-${id}`,
    name: `Product ${id.toUpperCase()}`,
    description: "",
    priceCents: 100_000,
    currency: "RUB",
    images: [],
    features: [],
    badge: null,
    inStock: true,
    priceOnRequest: false,
    brand: "UNIX Fit",
    originCountry: "Китай",
    categorySlug: "treadmills",
    categoryName: "Беговые дорожки",
    variants: [],
  };
}

const ids = () => useCompareStore.getState().items.map((p) => p.id);

describe("compare-store", () => {
  beforeEach(() => useCompareStore.setState({ items: [], limitNudges: 0 }));

  it("adds and removes a product", () => {
    expect(useCompareStore.getState().addToCompare(product("a"))).toBe(true);
    expect(ids()).toEqual(["a"]);
    useCompareStore.getState().removeFromCompare("a");
    expect(ids()).toEqual([]);
  });

  it("ignores a duplicate add", () => {
    useCompareStore.getState().addToCompare(product("a"));
    expect(useCompareStore.getState().addToCompare(product("a"))).toBe(true);
    expect(ids()).toEqual(["a"]);
  });

  it("enforces the compare limit and nudges the toast", () => {
    ["a", "b", "c", "d"].forEach((id) =>
      useCompareStore.getState().addToCompare(product(id)),
    );
    expect(useCompareStore.getState().limitNudges).toBe(0);

    expect(useCompareStore.getState().addToCompare(product("e"))).toBe(false);
    expect(ids()).toHaveLength(COMPARE_LIMIT);
    expect(ids()).not.toContain("e");
    expect(useCompareStore.getState().limitNudges).toBe(1);
  });

  it("toggles a product on and off", () => {
    useCompareStore.getState().toggleCompare(product("a"));
    expect(ids()).toEqual(["a"]);
    useCompareStore.getState().toggleCompare(product("a"));
    expect(ids()).toEqual([]);
  });

  it("reports full state and membership", () => {
    expect(useCompareStore.getState().isFull()).toBe(false);
    ["a", "b", "c", "d"].forEach((id) =>
      useCompareStore.getState().addToCompare(product(id)),
    );
    expect(useCompareStore.getState().isFull()).toBe(true);
    expect(useCompareStore.getState().isInCompare("a")).toBe(true);
    expect(useCompareStore.getState().isInCompare("z")).toBe(false);
  });

  it("clears the list", () => {
    ["a", "b"].forEach((id) =>
      useCompareStore.getState().addToCompare(product(id)),
    );
    useCompareStore.getState().clearCompare();
    expect(ids()).toEqual([]);
  });

  it("persists items (but not the toast counter) to localStorage", () => {
    useCompareStore.getState().addToCompare(product("a"));
    useCompareStore.setState({ limitNudges: 5 });

    const raw = localStorage.getItem("movigym-compare");
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!) as { state: Record<string, unknown> };
    expect(stored.state).toHaveProperty("items");
    expect(stored.state).not.toHaveProperty("limitNudges");
  });
});
