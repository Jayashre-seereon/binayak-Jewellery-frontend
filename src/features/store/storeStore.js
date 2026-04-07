import { create } from "zustand";

export const useStoreStore = create((set) => ({
  selectedStore: null,

  setStore: (store) => set({ selectedStore: store }),

  clearStore: () => set({ selectedStore: null }),
}));