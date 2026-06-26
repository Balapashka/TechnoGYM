import { describe, expect, it } from "vitest";
import { formatPrice, formatInstallment } from "./format";

describe("formatPrice", () => {
  it("formats euro cents without decimals", () => {
    const out = formatPrice(385000, "EUR", "en-IE");
    expect(out).toContain("3,850");
    expect(out).toContain("€");
  });

  it("respects the requested currency", () => {
    expect(formatPrice(100000, "USD", "en-US")).toContain("$");
    expect(formatPrice(100000, "GBP", "en-GB")).toContain("£");
  });

  it("rounds half-cents to whole currency units", () => {
    expect(formatPrice(99950, "EUR", "en-IE")).toContain("1,000");
  });
});

describe("formatInstallment", () => {
  it("splits a price across months", () => {
    const out = formatInstallment(360000, 36, "EUR", "en-IE");
    // 360000 / 36 = 10000 cents = €100
    expect(out).toContain("100");
  });
});
