import { describe, expect, it } from "vitest";
import { buildOrder, type CatalogEntry } from "./order";
import type { CheckoutPayload } from "@/schemas/checkout";

const customer: CheckoutPayload["customer"] = {
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
};

const payload: CheckoutPayload = {
  customer,
  currency: "RUB",
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

const catalog = new Map<string, CatalogEntry>([
  [
    "p1",
    { name: "Runner X1", priceCents: 385000, priceOnRequest: false, variants: [] },
  ],
  [
    "p2",
    {
      name: "Aero Bike",
      priceCents: 295000,
      priceOnRequest: false,
      variants: [{ id: "v2", priceDeltaCents: 50000 }],
    },
  ],
]);

/** Unwrap a build that is expected to succeed. */
function build(p: CheckoutPayload, c = catalog) {
  const result = buildOrder(p, c);
  if (!result.ok) throw new Error(`expected ok, got: ${result.error}`);
  return result.order;
}

describe("buildOrder", () => {
  it("snapshots name and unit price per line", () => {
    const order = build(payload);
    expect(order.items).toHaveLength(2);
    expect(order.items[0]).toMatchObject({
      productId: "p1",
      nameSnapshot: "Runner X1",
      priceCents: 385000,
      quantity: 2,
    });
  });

  it("adds the variant delta to the catalog price", () => {
    const order = build(payload);
    expect(order.items[1].priceCents).toBe(295000 + 50000);
  });

  it("computes the total across lines", () => {
    const order = build(payload);
    expect(order.totalCents).toBe(385000 * 2 + (295000 + 50000));
  });

  it("carries the customer email", () => {
    expect(build(payload).email).toBe("buyer@example.com");
  });

  it("always stores the order in the base currency", () => {
    const order = build({ ...payload, currency: "KZT" });
    expect(order.currency).toBe("RUB");
  });

  it("ignores a tampered unit price and uses the catalog price", () => {
    const tampered: CheckoutPayload = {
      ...payload,
      items: [{ ...payload.items[0], unitPriceCents: 1, quantity: 1 }],
    };
    const order = build(tampered);
    expect(order.items[0].priceCents).toBe(385000);
    expect(order.totalCents).toBe(385000);
  });

  it("ignores a tampered product name and uses the catalog name", () => {
    const tampered: CheckoutPayload = {
      ...payload,
      items: [{ ...payload.items[0], name: "Free Treadmill" }],
    };
    expect(build(tampered).items[0].nameSnapshot).toBe("Runner X1");
  });

  it("fails when a product is no longer in the catalog", () => {
    const result = buildOrder(payload, new Map());
    expect(result.ok).toBe(false);
  });

  it("refuses a quote-only product, whatever price the request claims", () => {
    const quoteOnly = new Map<string, CatalogEntry>([
      [
        "p1",
        {
          name: "Technogym RUN-729",
          priceCents: 278690000,
          priceOnRequest: true,
          variants: [],
        },
      ],
    ]);
    const result = buildOrder(
      { ...payload, items: [{ ...payload.items[0], unitPriceCents: 0 }] },
      quoteOnly,
    );
    expect(result.ok).toBe(false);
    // The refusal must not disclose the hidden figure.
    if (!result.ok) expect(result.error).not.toContain("278690000");
  });

  it("fails when the requested variant does not exist", () => {
    const result = buildOrder(
      { ...payload, items: [{ ...payload.items[1], variantId: "ghost" }] },
      catalog,
    );
    expect(result.ok).toBe(false);
  });
});
