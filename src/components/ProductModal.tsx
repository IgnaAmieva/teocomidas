"use client";

import { useEffect, useState } from "react";
import type { Producto } from "@/lib/types";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export default function ProductModal({
  producto,
  onClose,
}: {
  producto: Producto;
  onClose: () => void;
}) {
  const [cantidad, setCantidad] = useState(1);
  const addItem = useCartStore((s) => s.addItem);

  // Close on escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  function handleAdd() {
    addItem(producto, cantidad);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Bottom sheet */}
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)]">
        {/* Handle */}
        <div className="flex justify-center py-3">
          <div className="h-1.5 w-10 rounded-full bg-zinc-300" />
        </div>

        {/* Image */}
        <div className="mx-4 h-48 overflow-hidden rounded-2xl bg-zinc-200">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl text-zinc-400">
              🍽
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-6 pt-4">
          <h2 className="text-2xl font-extrabold">{producto.nombre}</h2>
          <p className="mt-1 text-zinc-500">{producto.descripcion}</p>
          <p className="mt-2 text-xl font-extrabold">
            {formatPrice(producto.precio)}
          </p>
        </div>

        {/* Quantity selector + Add button */}
        <div className="flex items-center gap-4 px-6 pb-6 pt-5">
          <div className="flex items-center rounded-full border border-zinc-300">
            <button
              onClick={() => setCantidad((c) => Math.max(1, c - 1))}
              className="flex h-12 w-12 items-center justify-center text-xl font-bold text-zinc-600 active:bg-zinc-100 rounded-l-full"
            >
              −
            </button>
            <span className="w-8 text-center text-lg font-bold">
              {cantidad}
            </span>
            <button
              onClick={() => setCantidad((c) => c + 1)}
              className="flex h-12 w-12 items-center justify-center text-xl font-bold text-zinc-600 active:bg-zinc-100 rounded-r-full"
            >
              +
            </button>
          </div>

          <button
            onClick={handleAdd}
            className="flex-1 rounded-2xl bg-zinc-900 py-4 text-center text-base font-bold text-white transition-colors active:bg-zinc-700"
          >
            Agregar {formatPrice(producto.precio * cantidad)}
          </button>
        </div>
      </div>
    </div>
  );
}
