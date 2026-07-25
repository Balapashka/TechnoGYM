import { create } from "zustand";

type CartUiState = {
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

/** Controls the slide-in cart drawer (separate from cart contents). */
export const useCartUiStore = create<CartUiState>((set) => ({
  open: false,
  openCart: () => set({ open: true }),
  closeCart: () => set({ open: false }),
  toggleCart: () => set((s) => ({ open: !s.open })),
}));
