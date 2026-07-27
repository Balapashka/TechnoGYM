"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductDTO } from "@/lib/catalog";

/** Max number of products that can be compared at once. */
export const COMPARE_LIMIT = 4;

type CompareState = {
  /**
   * Product snapshots, not ids: the floating bar and the /compare page render
   * from any route, where the catalog props are out of reach.
   */
  items: ProductDTO[];
  /**
   * Bumped every time an add is rejected because the list is full — the toast
   * component watches this counter to know when to pop.
   */
  limitNudges: number;
  /** Adds a product; returns false (and nudges the toast) when full. */
  addToCompare: (product: ProductDTO) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
  /** Card button behaviour: in the list → remove, otherwise add. */
  toggleCompare: (product: ProductDTO) => void;
  isFull: () => boolean;
};

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      limitNudges: 0,
      addToCompare: (product) => {
        const { items } = get();
        if (items.some((p) => p.id === product.id)) return true;
        if (items.length >= COMPARE_LIMIT) {
          set((s) => ({ limitNudges: s.limitNudges + 1 }));
          return false;
        }
        set({ items: [...items, product] });
        return true;
      },
      removeFromCompare: (id) =>
        set((s) => ({ items: s.items.filter((p) => p.id !== id) })),
      clearCompare: () => set({ items: [] }),
      isInCompare: (id) => get().items.some((p) => p.id === id),
      toggleCompare: (product) => {
        const { isInCompare, addToCompare, removeFromCompare } = get();
        if (isInCompare(product.id)) removeFromCompare(product.id);
        else addToCompare(product);
      },
      isFull: () => get().items.length >= COMPARE_LIMIT,
    }),
    {
      name: "movigym-compare",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);
