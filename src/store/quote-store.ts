import { create } from "zustand";

/** Minimal product identity a price request needs — name is snapshotted server-side. */
export type QuoteProduct = { id: string; name: string };

type QuoteState = {
  product: QuoteProduct | null;
  open: (product: QuoteProduct) => void;
  close: () => void;
};

/**
 * Holds the product the visitor is requesting a price for. Italian brands are
 * imported to order and never show a price, so the catalog and the product page
 * open this modal instead of adding to the cart.
 */
export const useQuoteStore = create<QuoteState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
