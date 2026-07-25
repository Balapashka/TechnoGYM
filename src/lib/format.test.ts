import { describe, expect, it } from "vitest";
import {
  BASE_CURRENCY,
  convertCents,
  formatInstallment,
  formatInstallmentIn,
  formatPrice,
  formatPriceIn,
} from "./format";

const KZ = { currency: "KZT", locale: "ru-KZ" };
const RU = { currency: "RUB", locale: "ru-RU" };

describe("formatPrice", () => {
  it("defaults to roubles in the Russian locale", () => {
    expect(BASE_CURRENCY).toBe("RUB");
    const out = formatPrice(38500000);
    expect(out).toContain("385");
    expect(out).toContain("₽");
  });

  it("respects the requested currency", () => {
    expect(formatPrice(100000, "KZT", "ru-KZ")).toContain("₸");
    expect(formatPrice(100000, "USD", "en-US")).toContain("$");
  });

  it("rounds half units to whole currency units", () => {
    expect(formatPrice(99950, "RUB", "ru-RU")).toContain("1");
  });
});

describe("convertCents", () => {
  it("is an identity for the same currency", () => {
    expect(convertCents(123456, "RUB", "RUB")).toBe(123456);
  });

  it("converts roubles into tenge at the demo rate", () => {
    // 1 RUB = 6.4 KZT
    expect(convertCents(10000, "RUB", "KZT")).toBe(64000);
  });

  it("round-trips within rounding error", () => {
    const there = convertCents(500000, "RUB", "KZT");
    expect(convertCents(there, "KZT", "RUB")).toBe(500000);
  });

  it("leaves unknown currencies untouched", () => {
    expect(convertCents(10000, "EUR", "KZT")).toBe(10000);
  });
});

describe("formatPriceIn", () => {
  it("shows a rouble price in tenge for a Kazakh shopper", () => {
    const out = formatPriceIn(10000000, "RUB", KZ);
    expect(out).toContain("₸");
    expect(out).toContain("640");
  });

  it("keeps roubles for a Russian shopper", () => {
    expect(formatPriceIn(10000000, "RUB", RU)).toContain("₽");
  });

  it("falls back to the product currency when not convertible", () => {
    expect(formatPriceIn(10000, "EUR", KZ)).toContain("€");
  });
});

describe("formatInstallment", () => {
  it("splits a price across months", () => {
    // 3 600 000 kopeks / 36 = 100 000 kopeks = 1 000 ₽
    expect(formatInstallment(3600000, 36)).toContain("1");
  });

  it("converts the monthly amount for the selected country", () => {
    const out = formatInstallmentIn(3600000, 36, "RUB", KZ);
    expect(out).toContain("₸");
    expect(out).toContain("6");
  });
});
