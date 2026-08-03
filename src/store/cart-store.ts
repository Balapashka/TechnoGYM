import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  variantId: string | null;
  variantName: string | null;
  unitPriceCents: number; // base price + variant delta
  currency: string;
  quantity: number;
};

/** Stable key for a line item (same product + variant merge together). */
export function lineKey(productId: string, variantId: string | null): string {
  return `${productId}::${variantId ?? "_"}`;
}

/**
 * Upper bound for a single cart line. Mirrored by `checkoutItemSchema`, so the
 * quantity controls can never build a cart the checkout endpoint would reject.
 */
export const MAX_LINE_QUANTITY = 99;

const clampQuantity = (n: number) => Math.min(n, MAX_LINE_QUANTITY);

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  setQuantity: (
    productId: string,
    variantId: string | null,
    quantity: number,
  ) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const key = lineKey(item.productId, item.variantId);
          const existing = state.items.find(
            (i) => lineKey(i.productId, i.variantId) === key,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                lineKey(i.productId, i.variantId) === key
                  ? { ...i, quantity: clampQuantity(i.quantity + quantity) }
                  : i,
              ),
            };
          }
          return {
            items: [...state.items, { ...item, quantity: clampQuantity(quantity) }],
          };
        }),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (i) =>
              lineKey(i.productId, i.variantId) !==
              lineKey(productId, variantId),
          ),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return {
              items: state.items.filter(
                (i) =>
                  lineKey(i.productId, i.variantId) !==
                  lineKey(productId, variantId),
              ),
            };
          }
          return {
            items: state.items.map((i) =>
              lineKey(i.productId, i.variantId) ===
              lineKey(productId, variantId)
                ? { ...i, quantity: clampQuantity(quantity) }
                : i,
            ),
          };
        }),
      clear: () => set({ items: [] }),
    }),
    {
      name: "movigym-cart",
      // v2 = the rouble catalog. A cart persisted against the previous EUR
      // catalog holds product ids that no longer exist, so checkout would fail
      // on a foreign-key error. Drop those lines instead of restoring them.
      // v3 = quote-only products. Carts saved before `priceOnRequest` may hold
      // imported items that are no longer sold through the cart, at a price
      // that is now hidden — checkout rejects them, so drop them here too.
      version: 3,
      migrate: () => ({ items: [] }),
    },
  ),
);

/** Total number of units in the cart. */
export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

/** Total price of the cart in cents. */
export function cartTotalCents(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
}
