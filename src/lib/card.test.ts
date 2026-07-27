import { describe, expect, it } from "vitest";
import {
  digitsOnly,
  expiryInFuture,
  formatCardNumber,
  formatExpiry,
  luhnValid,
} from "./card";

describe("digitsOnly", () => {
  it("strips everything but digits", () => {
    expect(digitsOnly("12a b-3/4")).toBe("1234");
  });
});

describe("formatCardNumber", () => {
  it("groups digits by four", () => {
    expect(formatCardNumber("4242424242424242")).toBe("4242 4242 4242 4242");
  });

  it("formats partial input while typing", () => {
    expect(formatCardNumber("42424")).toBe("4242 4");
  });

  it("drops non-digits and caps at 16 digits", () => {
    expect(formatCardNumber("4242-4242-4242-4242-999")).toBe(
      "4242 4242 4242 4242",
    );
  });

  it("returns an empty string for no digits", () => {
    expect(formatCardNumber("abc")).toBe("");
  });
});

describe("formatExpiry", () => {
  it("inserts the slash after the month", () => {
    expect(formatExpiry("0429")).toBe("04/29");
  });

  it("zero-pads a single digit 2-9 as the month", () => {
    expect(formatExpiry("4")).toBe("04/");
  });

  it("keeps a leading 0 or 1 waiting for the next digit", () => {
    expect(formatExpiry("1")).toBe("1");
    expect(formatExpiry("12")).toBe("12/");
  });

  it("caps at four digits", () => {
    expect(formatExpiry("042999")).toBe("04/29");
  });
});

describe("luhnValid", () => {
  it("accepts the demo card number", () => {
    expect(luhnValid("4242 4242 4242 4242")).toBe(true);
  });

  it("rejects a number with a wrong check digit", () => {
    expect(luhnValid("4242424242424241")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(luhnValid("")).toBe(false);
  });
});

describe("expiryInFuture", () => {
  const now = new Date(2026, 6, 15); // 15 июля 2026

  it("accepts a future expiry", () => {
    expect(expiryInFuture("04/29", now)).toBe(true);
  });

  it("accepts the current month (valid through month end)", () => {
    expect(expiryInFuture("07/26", now)).toBe(true);
  });

  it("rejects last month", () => {
    expect(expiryInFuture("06/26", now)).toBe(false);
  });

  it("rejects a past year", () => {
    expect(expiryInFuture("12/20", now)).toBe(false);
  });

  it("rejects a malformed value", () => {
    expect(expiryInFuture("13/29", now)).toBe(false);
    expect(expiryInFuture("0429", now)).toBe(false);
  });
});
