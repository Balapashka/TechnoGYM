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
  address: "ул. Ленина, д. 1",
  city: "Москва",
  postalCode: "101000",
  country: "RU",
  cardName: "Ivan Petrov",
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "04/49",
  cardCvc: "123",
};

/** Shorthand: parse the valid customer with one field overridden. */
function parseWith(overrides: Partial<typeof validCustomer>) {
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
    });
  });

  describe("city", () => {
    it("rejects digits and short values", () => {
      expect(parseWith({ city: "Москва 1" }).success).toBe(false);
      expect(parseWith({ city: "М" }).success).toBe(false);
    });

    it("accepts hyphenated city names", () => {
      expect(parseWith({ city: "Ростов-на-Дону" }).success).toBe(true);
    });
  });

  describe("country", () => {
    it("rejects a country outside the list", () => {
      expect(parseWith({ country: "IE" }).success).toBe(false);
      expect(parseWith({ country: "Россия" }).success).toBe(false);
    });
  });

  describe("postalCode", () => {
    it("requires 6 digits for RU", () => {
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

  describe("cardName", () => {
    it("uppercases the value", () => {
      const res = parseWith({ cardName: "ivan petrov" });
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.cardName).toBe("IVAN PETROV");
    });

    it("rejects cyrillic and digits", () => {
      expect(parseWith({ cardName: "Иван Петров" }).success).toBe(false);
      expect(parseWith({ cardName: "IVAN 4" }).success).toBe(false);
    });
  });

  describe("cardNumber", () => {
    it("strips spaces in the output", () => {
      const res = parseWith({});
      expect(res.success).toBe(true);
      if (res.success) expect(res.data.cardNumber).toBe("4242424242424242");
    });

    it("rejects wrong length", () => {
      expect(parseWith({ cardNumber: "4242 4242 4242 424" }).success).toBe(
        false,
      );
    });

    it("rejects a number failing the Luhn check", () => {
      expect(parseWith({ cardNumber: "4242 4242 4242 4241" }).success).toBe(
        false,
      );
    });
  });

  describe("cardExpiry", () => {
    it("rejects a bad month or format", () => {
      expect(parseWith({ cardExpiry: "13/29" }).success).toBe(false);
      expect(parseWith({ cardExpiry: "0429" }).success).toBe(false);
    });

    it("rejects an expiry in the past", () => {
      expect(parseWith({ cardExpiry: "01/20" }).success).toBe(false);
    });
  });

  describe("cardCvc", () => {
    it("accepts 3 or 4 digits only", () => {
      expect(parseWith({ cardCvc: "1234" }).success).toBe(true);
      expect(parseWith({ cardCvc: "12" }).success).toBe(false);
      expect(parseWith({ cardCvc: "12a" }).success).toBe(false);
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
