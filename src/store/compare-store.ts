import { create } from "zustand";

/** Max number of products that can be compared at once. */
export const COMPARE_LIMIT = 4;

type CompareState = {
  ids: string[];
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
  isFull: () => boolean;
};

export const useCompareStore = create<CompareState>((set, get) => ({
  ids: [],
  toggle: (id) =>
    set((state) => {
      if (state.ids.includes(id)) {
        return { ids: state.ids.filter((x) => x !== id) };
      }
      if (state.ids.length >= COMPARE_LIMIT) return state; // ignore over limit
      return { ids: [...state.ids, id] };
    }),
  remove: (id) => set((state) => ({ ids: state.ids.filter((x) => x !== id) })),
  clear: () => set({ ids: [] }),
  has: (id) => get().ids.includes(id),
  isFull: () => get().ids.length >= COMPARE_LIMIT,
}));
