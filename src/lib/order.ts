import type { CheckoutPayload } from "@/schemas/checkout";
import { BASE_CURRENCY } from "@/lib/format";

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
 * Authoritative product data, read from the database at checkout time.
 * The request body is never trusted for names or prices.
 */
export type CatalogEntry = {
  name: string;
  priceCents: number;
  /** Quote-only products are not sold through the cart — see buildOrder. */
  priceOnRequest: boolean;
  variants: { id: string; priceDeltaCents: number }[];
};

export type BuildOrderResult =
  | { ok: true; order: BuiltOrder }
  | { ok: false; error: string };

/**
 * Build an order from a validated checkout payload.
 *
 * The client sends product ids, variant ids and quantities; every price and
 * name is re-read from `catalog` so a tampered payload cannot change what an
 * order costs. Pure function — the caller supplies the catalog.
 */
export function buildOrder(
  payload: CheckoutPayload,
  catalog: ReadonlyMap<string, CatalogEntry>,
): BuildOrderResult {
  const items: OrderLine[] = [];

  for (const line of payload.items) {
    const product = catalog.get(line.productId);
    if (!product) {
      return { ok: false, error: "Товар из корзины больше недоступен" };
    }

    // Sold by quote, not through the cart. The storefront never offers an
    // add-to-cart for these, so reaching here means a stale or hand-edited
    // cart — answering with the price would also disclose what is hidden.
    if (product.priceOnRequest) {
      return {
        ok: false,
        error: `«${product.name}» продаётся по запросу — оформите заявку на цену`,
      };
    }

    let priceDeltaCents = 0;
    if (line.variantId !== null) {
      const variant = product.variants.find((v) => v.id === line.variantId);
      if (!variant) {
        return {
          ok: false,
          error: `Выбранная конфигурация недоступна: ${product.name}`,
        };
      }
      priceDeltaCents = variant.priceDeltaCents;
    }

    items.push({
      productId: line.productId,
      // Snapshot the catalog's name and price, not the ones in the request.
      nameSnapshot: product.name,
      priceCents: product.priceCents + priceDeltaCents,
      quantity: line.quantity,
    });
  }

  const totalCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0,
  );

  return {
    ok: true,
    order: {
      email: payload.customer.email,
      // Orders are always stored in the catalog's own currency; the country
      // selector only converts prices for display.
      currency: BASE_CURRENCY,
      totalCents,
      items,
    },
  };
}
