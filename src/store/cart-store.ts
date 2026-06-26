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
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity }] };
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
                ? { ...i, quantity }
                : i,
            ),
          };
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "movigym-cart" },
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
