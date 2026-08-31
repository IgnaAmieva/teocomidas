"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalPrice = useCartStore((s) => s.totalPrice);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-20">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-extrabold">Tu pedido está vacío</h1>
        <p className="mt-2 text-zinc-500">Agregá productos desde el menú.</p>
        <Link
          href="/menu"
          className="mt-6 rounded-2xl bg-zinc-900 px-8 py-3.5 font-bold text-white active:bg-zinc-700"
        >
          Ver menú
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Tu pedido</h1>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div
            key={item.producto.id}
            className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-3"
          >
            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-200">
              {item.producto.imagen_url ? (
                <img
                  src={item.producto.imagen_url}
                  alt={item.producto.nombre}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl text-zinc-400">
                  🍽
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold truncate">
                {item.producto.nombre}
              </h3>
              <p className="text-sm font-extrabold">
                {formatPrice(item.producto.precio * item.cantidad)}
              </p>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() =>
                  item.cantidad === 1
                    ? removeItem(item.producto.id)
                    : updateQuantity(item.producto.id, item.cantidad - 1)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold active:bg-zinc-200"
              >
                {item.cantidad === 1 ? "✕" : "−"}
              </button>
              <span className="w-6 text-center text-sm font-bold">
                {item.cantidad}
              </span>
              <button
                onClick={() =>
                  updateQuantity(item.producto.id, item.cantidad + 1)
                }
                className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-100 text-lg font-bold active:bg-zinc-200"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total + checkout */}
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold">Total</span>
          <span className="text-xl font-extrabold">
            {formatPrice(totalPrice())}
          </span>
        </div>
        <Link
          href="/checkout"
          className="mt-3 block w-full rounded-2xl bg-zinc-900 py-4 text-center text-base font-bold text-white transition-colors active:bg-zinc-700"
        >
          Ir al checkout
        </Link>
      </div>
    </div>
  );
}
