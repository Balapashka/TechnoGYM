import { describe, expect, it } from "vitest";
import { checkoutSchema, checkoutPayloadSchema } from "./checkout";

const validCustomer = {
  email: "buyer@example.com",
  fullName: "Jane Doe",
  address: "1 Demo Street",
  city: "Dublin",
  postalCode: "D01",
  country: "IE",
  cardName: "Jane Doe",
  cardNumber: "4242 4242 4242 4242",
  cardExpiry: "04/29",
  cardCvc: "123",
};

describe("checkoutSchema", () => {
  it("accepts a valid customer", () => {
    expect(checkoutSchema.safeParse(validCustomer).success).toBe(true);
  });

  it("rejects a bad email", () => {
    const res = checkoutSchema.safeParse({ ...validCustomer, email: "nope" });
    expect(res.success).toBe(false);
  });

  it("rejects a short name", () => {
    const res = checkoutSchema.safeParse({ ...validCustomer, fullName: "J" });
    expect(res.success).toBe(false);
  });
});

describe("checkoutPayloadSchema", () => {
  it("requires at least one item", () => {
    const res = checkoutPayloadSchema.safeParse({
      customer: validCustomer,
      items: [],
      currency: "EUR",
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
      currency: "EUR",
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
      currency: "EUR",
    });
    expect(res.success).toBe(false);
  });
});
