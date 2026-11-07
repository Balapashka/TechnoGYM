import { describe, expect, it } from "vitest";
import {
  checkoutSchema,
  checkoutPayloadSchema,
  CHECKOUT_COUNTRY_CODES,
} from "./checkout";
import { COUNTRIES } from "@/store/locale-store";

const validCustomer = {
  email: "buyer@example.com",
  fullName: "Иван Петров",
  phone: "+7 (999) 123-45-67",
  deliveryMethod: "delivery",
  address: "ул. Ленина, д. 1",
  city: "Москва",
  postalCode: "101000",
  country: "RU",
  paymentMethod: "manual",
  consent: true,
};

/** Shorthand: parse the valid customer with one field overridden. */
function parseWith(overrides: Partial<Record<keyof typeof validCustomer, unknown>>) {
  return checkoutSchema.safeParse({ ...validCustomer, ...overrides });
}

describe("checkoutSchema", () => {
  it("accepts a valid customer", () => {
    expect(parseWith({}).success).toBe(true);
  });

  it("stays in sync with the locale store's country list", () => {
    expect([...CHECKOUT_COUNTRY_CODES].sort()).toEqual(
      COUNTRIES.map((c) => c.code).sort(),
    );
  });

  describe("email", () => {
    it("rejects a bad email", () => {
      expect(parseWith({ email: "nope" }).success).toBe(false);
      expect(parseWith({ email: "a@b" }).success).toBe(false);
      expect(parseWith({ email: "" }).success).toBe(false);
    });
  });

  describe("fullName", () => {
    it("requires at least two words", () => {
      expect(parseWith({ fullName: "Иван" }).success).toBe(false);
    });

    it("rejects digits and special characters", () => {
      expect(parseWith({ fullName: "Иван Петров1" }).success).toBe(false);
      expect(parseWith({ fullName: "Иван_Петров ок" }).success).toBe(false);
    });

    it("accepts latin and hyphenated names", () => {
      expect(parseWith({ fullName: "Jane Doe" }).success).toBe(true);
      expect(parseWith({ fullName: "Анна-Мария Иванова" }).success).toBe(true);
      // Kazakhstan, Uzbekistan and Kyrgyzstan are in the country list.
      expect(parseWith({ fullName: "Нұрлан Әлиев" }).success).toBe(true);
      expect(parseWith({ fullName: "Oʻktam Gʻulomov" }).success).toBe(true);
      expect(parseWith({ fullName: "Шон О’Брайен" }).success).toBe(true);
    });
  });

  describe("city", () => {
    it("rejects digits and short values", () => {
      expect(parseWith({ city: "Москва 1" }).success).toBe(false);
      expect(parseWith({ city: "М" }).success).toBe(false);
    });

    it("rejects special characters", () => {
      expect(parseWith({ city: "г. Москва" }).success).toBe(false);
      expect(parseWith({ city: "Almaty@" }).success).toBe(false);
      expect(parseWith({ city: "Ош;" }).success).toBe(false);
    });

    it("accepts hyphenated city names", () => {
      expect(parseWith({ city: "Ростов-на-Дону" }).success).toBe(true);
      expect(parseWith({ city: "Өскемен" }).success).toBe(true);
      expect(parseWith({ city: "Qoʻqon" }).success).toBe(true);
      expect(parseWith({ city: "Нұр-Сұлтан" }).success).toBe(true);
    });

    it("accepts a hand-typed city outside the suggestion list", () => {
      expect(parseWith({ city: "Верхний Уфалей" }).success).toBe(true);
    });

    it("normalizes spacing and capitalization in the output", () => {
      const res = parseWith({ city: "  нижний   новгород " });
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.city).toBe("Нижний новгород");
    });
  });

  describe("country", () => {
    it("rejects a country outside the list", () => {
      expect(parseWith({ country: "IE" }).success).toBe(false);
      expect(parseWith({ country: "Россия" }).success).toBe(false);
    });
  });

  describe("postalCode", () => {
    it("requires 6 digits for RU when entered", () => {
      expect(parseWith({ postalCode: "10100" }).success).toBe(false);
      expect(parseWith({ postalCode: "10100a" }).success).toBe(false);
    });

    it("accepts both KZ formats", () => {
      expect(
        parseWith({ country: "KZ", postalCode: "010000" }).success,
      ).toBe(true);
      expect(
        parseWith({ country: "KZ", postalCode: "A10A5T4" }).success,
      ).toBe(true);
      expect(
        parseWith({ country: "KZ", postalCode: "A10A5T" }).success,
      ).toBe(false);
    });
  });

  describe("address", () => {
    it("requires at least 5 characters", () => {
      expect(parseWith({ address: "д. 1" }).success).toBe(false);
    });
  });

  describe("phone", () => {
    it("is required and normalized", () => {
      expect(parseWith({ phone: "" }).success).toBe(false);
      const res = parseWith({});
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.phone).toBe("+79991234567");
    });
    it("rejects junk", () => {
      expect(parseWith({ phone: "позвоните" }).success).toBe(false);
      expect(parseWith({ phone: "12345" }).success).toBe(false);
    });
  });

  describe("email", () => {
    it("is lower-cased", () => {
      const res = parseWith({ email: "  Buyer@Example.COM " });
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.email).toBe("buyer@example.com");
    });
  });

  describe("pickup", () => {
    it("does not require an address", () => {
      expect(
        parseWith({
          deliveryMethod: "pickup",
          city: "",
          address: "",
          postalCode: "",
        }).success,
      ).toBe(true);
    });
  });

  describe("delivery", () => {
    it("requires city and address", () => {
      expect(parseWith({ city: "" }).success).toBe(false);
      expect(parseWith({ address: "" }).success).toBe(false);
    });
    it("accepts an empty postal code", () => {
      expect(parseWith({ postalCode: "" }).success).toBe(true);
    });
    it("rejects an unknown delivery method", () => {
      expect(parseWith({ deliveryMethod: "drone" }).success).toBe(false);
    });
  });

  describe("payment and consent", () => {
    it("accepts only known payment methods", () => {
      expect(parseWith({ paymentMethod: "online" }).success).toBe(true);
      expect(parseWith({ paymentMethod: "crypto" }).success).toBe(false);
    });
    it("requires personal-data consent", () => {
      expect(parseWith({ consent: false }).success).toBe(false);
      expect(parseWith({ consent: undefined }).success).toBe(false);
    });
  });
});

describe("checkoutPayloadSchema", () => {
  it("requires at least one item", () => {
    const res = checkoutPayloadSchema.safeParse({
      customer: validCustomer,
      items: [],
      currency: "RUB",
    });
    expect(res.success).toBe(false);
  });

  it("accepts a valid payload", () => {
    const res = checkoutPayloadSchema.safeParse({
      customer: validCustomer,
      items: [
        {
          productId: "p1",
          variantId: null,
          name: "Runner X1",
          unitPriceCents: 385000,
          quantity: 1,
        },
      ],
      currency: "RUB",
    });
    expect(res.success).toBe(true);
  });

  it("rejects non-positive quantity", () => {
    const res = checkoutPayloadSchema.safeParse({
      customer: validCustomer,
      items: [
        {
          productId: "p1",
          variantId: null,
          name: "X",
          unitPriceCents: 100,
          quantity: 0,
        },
      ],
      currency: "RUB",
    });
    expect(res.success).toBe(false);
  });
});
