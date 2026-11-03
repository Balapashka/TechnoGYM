import { describe, expect, it } from "vitest";
import { normalizeQuery, searchProducts, type Searchable } from "./search";

const p = (name: string, extra: Partial<Searchable> = {}): Searchable => ({
  name,
  brand: "",
  categoryName: "",
  description: "",
  features: [],
  slug: name.toLowerCase().replace(/\s+/g, "-"),
  ...extra,
});

const catalog = [
  p("Беговая дорожка UNIX Fit R-300", { brand: "UNIX Fit", categoryName: "Беговые дорожки" }),
  p("Велотренажёр Technogym Bike", { brand: "Technogym", categoryName: "Велотренажёры" }),
  p("Скамья Panatta", { brand: "Panatta", description: "Регулируемая спинка" }),
];

describe("normalizeQuery", () => {
  it("lower-cases, folds ё and strips punctuation", () => {
    expect(normalizeQuery("  Велотренажёр, R-300! ")).toBe("велотренажер r 300");
  });
});

describe("searchProducts", () => {
  it("ignores queries shorter than two characters", () => {
    expect(searchProducts(catalog, "б")).toEqual([]);
  });

  it("is case-insensitive for Cyrillic", () => {
    expect(searchProducts(catalog, "БЕГОВАЯ")).toHaveLength(1);
  });

  it("tolerates Russian word endings", () => {
    expect(searchProducts(catalog, "дорожки")[0].name).toContain("дорожка");
  });

  it("requires every word to match", () => {
    expect(searchProducts(catalog, "unix скамья")).toEqual([]);
    expect(searchProducts(catalog, "unix дорожка")).toHaveLength(1);
  });

  it("matches brand, category and description", () => {
    expect(searchProducts(catalog, "technogym")).toHaveLength(1);
    expect(searchProducts(catalog, "спинка")[0].name).toContain("Скамья");
  });

  it("treats е and ё as the same letter", () => {
    expect(searchProducts(catalog, "велотренажер")).toHaveLength(1);
  });

  it("ranks name matches above description matches", () => {
    const list = [
      p("Коврик", { description: "подходит для скамьи" }),
      p("Скамья силовая"),
    ];
    expect(searchProducts(list, "скамья")[0].name).toBe("Скамья силовая");
  });
});
