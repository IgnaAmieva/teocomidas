"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Producto } from "./types";

interface CartState {
  items: CartItem[];
  addItem: (producto: Producto, cantidad?: number) => void;
  removeItem: (productoId: string) => void;
  updateQuantity: (productoId: string, cantidad: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (producto, cantidad = 1) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.producto.id === producto.id
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.producto.id === producto.id
                  ? { ...i, cantidad: i.cantidad + cantidad }
                  : i
              ),
            };
          }
          return { items: [...state.items, { producto, cantidad }] };
        });
      },

      removeItem: (productoId) => {
        set((state) => ({
          items: state.items.filter((i) => i.producto.id !== productoId),
        }));
      },

      updateQuantity: (productoId, cantidad) => {
        if (cantidad <= 0) {
          get().removeItem(productoId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.producto.id === productoId ? { ...i, cantidad } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.cantidad, 0),

      totalPrice: () =>
        get().items.reduce(
          (sum, i) => sum + i.producto.precio * i.cantidad,
          0
        ),
    }),
    { name: "teocomidas-cart" }
  )
);
