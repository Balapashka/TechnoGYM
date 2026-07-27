import { describe, expect, it } from "vitest";
import {
  CITY_PATTERN,
  citiesForCountry,
  formatCityInput,
  normalizeCity,
} from "./city";
import { CHECKOUT_COUNTRY_CODES } from "@/schemas/checkout";
import { CITIES_BY_COUNTRY } from "../../config/cities";

describe("CITY_PATTERN", () => {
  it("accepts plain, hyphenated and apostrophized names", () => {
    expect(CITY_PATTERN.test("Москва")).toBe(true);
    expect(CITY_PATTERN.test("Ростов-на-Дону")).toBe(true);
    expect(CITY_PATTERN.test("Усть-Каменогорск")).toBe(true);
    expect(CITY_PATTERN.test("Нижний Новгород")).toBe(true);
    expect(CITY_PATTERN.test("L'Aquila")).toBe(true);
  });

  it("rejects digits and special characters", () => {
    expect(CITY_PATTERN.test("Москва 1")).toBe(false);
    expect(CITY_PATTERN.test("г. Москва")).toBe(false);
    expect(CITY_PATTERN.test("Almaty@")).toBe(false);
    expect(CITY_PATTERN.test("Тараз#")).toBe(false);
    expect(CITY_PATTERN.test("Ош;")).toBe(false);
    expect(CITY_PATTERN.test("")).toBe(false);
  });

  it("rejects dangling separators", () => {
    expect(CITY_PATTERN.test("-Москва")).toBe(false);
    expect(CITY_PATTERN.test("Москва-")).toBe(false);
  });
});

describe("formatCityInput", () => {
  it("capitalizes the first letter", () => {
    expect(formatCityInput("москва")).toBe("Москва");
  });

  it("collapses repeated spaces and strips leading whitespace", () => {
    expect(formatCityInput("  нижний   новгород")).toBe("Нижний новгород");
  });

  it("keeps a single trailing space so multi-word names stay typeable", () => {
    expect(formatCityInput("Нижний ")).toBe("Нижний ");
  });
});

describe("normalizeCity", () => {
  it("trims, collapses spaces and capitalizes", () => {
    expect(normalizeCity("  москва  ")).toBe("Москва");
    expect(normalizeCity("нижний   новгород ")).toBe("Нижний новгород");
  });
});

describe("citiesForCountry", () => {
  it("returns the list for a known country", () => {
    expect(citiesForCountry("KZ")).toContain("Алматы");
    expect(citiesForCountry("KZ")).toContain("Астана");
  });

  it("returns an empty list for unknown codes", () => {
    expect(citiesForCountry("IE")).toEqual([]);
  });

  it("covers every checkout country", () => {
    expect(Object.keys(CITIES_BY_COUNTRY).sort()).toEqual(
      [...CHECKOUT_COUNTRY_CODES].sort(),
    );
  });

  it("only lists cities that pass validation", () => {
    for (const cities of Object.values(CITIES_BY_COUNTRY)) {
      for (const city of cities) {
        expect(city).toMatch(CITY_PATTERN);
      }
    }
  });
});
