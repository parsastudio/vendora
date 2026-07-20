import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem } from "../types/cart";

interface CartState {
  items: CartItem[];
  couponCode: string | null;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  setCouponCode: (code: string | null) => void;
  clearCart: () => void;
  mergeCart: (incomingItems: CartItem[]) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      couponCode: null,
      addItem: (newItem) =>
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.variantId === newItem.variantId,
          );
          if (existingIndex > -1) {
            const updated = [...state.items];
            updated[existingIndex].quantity += newItem.quantity;
            return { items: updated };
          }
          return { items: [...state.items, newItem] };
        }),
      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),
      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.variantId === variantId ? { ...item, quantity: Math.max(1, quantity) } : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      setCouponCode: (code) => set({ couponCode: code }),
      clearCart: () => set({ items: [], couponCode: null }),
      mergeCart: (incomingItems) =>
        set((state) => {
          const merged = [...state.items];
          for (const incoming of incomingItems) {
            const existingIdx = merged.findIndex((item) => item.variantId === incoming.variantId);
            if (existingIdx > -1) {
              merged[existingIdx].quantity += incoming.quantity;
            } else {
              merged.push(incoming);
            }
          }
          return { items: merged };
        }),
    }),
    {
      name: "vendora-cart",
    },
  ),
);
