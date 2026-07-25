import { create } from "zustand";
import type { ProductDTO } from "@/lib/catalog";

type QuickViewState = {
  product: ProductDTO | null;
  open: (product: ProductDTO) => void;
  close: () => void;
};

/** Holds the product shown in the slide-in quick-view drawer. */
export const useQuickViewStore = create<QuickViewState>((set) => ({
  product: null,
  open: (product) => set({ product }),
  close: () => set({ product: null }),
}));
