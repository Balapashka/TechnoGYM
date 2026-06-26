import type { CheckoutPayload } from "@/schemas/checkout";

export type OrderLine = {
  productId: string;
  nameSnapshot: string;
  priceCents: number;
  quantity: number;
};

export type BuiltOrder = {
  email: string;
  currency: string;
  totalCents: number;
  items: OrderLine[];
};

/**
 * Build an order from a validated checkout payload.
 * Snapshots name + unit price per line and computes the total. Pure function.
 */
export function buildOrder(payload: CheckoutPayload): BuiltOrder {
  const items: OrderLine[] = payload.items.map((i) => ({
    productId: i.productId,
    nameSnapshot: i.name,
    priceCents: i.unitPriceCents,
    quantity: i.quantity,
  }));

  const totalCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0,
  );

  return {
    email: payload.customer.email,
    currency: payload.currency,
    totalCents,
    items,
  };
}
