import { describe, expect, it } from "vitest";
import { buildOrder } from "./order";
import type { CheckoutPayload } from "@/schemas/checkout";

const payload: CheckoutPayload = {
  customer: {
    email: "buyer@example.com",
    fullName: "Jane Doe",
    address: "1 Demo Street",
    city: "Dublin",
    postalCode: "101000",
    country: "RU",
    cardName: "JANE DOE",
    cardNumber: "4111111111111111",
    cardExpiry: "12/28",
    cardCvc: "123",
  },
  currency: "EUR",
  items: [
    {
      productId: "p1",
      variantId: null,
      name: "Runner X1",
      unitPriceCents: 385000,
      quantity: 2,
    },
    {
      productId: "p2",
      variantId: "v2",
      name: "Aero Bike",
      unitPriceCents: 295000,
      quantity: 1,
    },
  ],
};

describe("buildOrder", () => {
  it("snapshots name and unit price per line", () => {
    const order = buildOrder(payload);
    expect(order.items).toHaveLength(2);
    expect(order.items[0]).toMatchObject({
      productId: "p1",
      nameSnapshot: "Runner X1",
      priceCents: 385000,
      quantity: 2,
    });
  });

  it("computes the total across lines", () => {
    const order = buildOrder(payload);
    expect(order.totalCents).toBe(385000 * 2 + 295000);
  });

  it("carries email and currency", () => {
    const order = buildOrder(payload);
    expect(order.email).toBe("buyer@example.com");
    expect(order.currency).toBe("EUR");
  });
});
