"use client";

import type { Producto } from "@/lib/types";
import { formatPrice } from "@/lib/format";

export default function ProductCard({
  producto,
  onSelect,
}: {
  producto: Producto;
  onSelect: (p: Producto) => void;
}) {
  return (
    <button
      onClick={() => onSelect(producto)}
      className="flex w-full items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-3 text-left transition-colors active:bg-zinc-50"
    >
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-zinc-200">
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl text-zinc-400">
            🍽
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-base font-bold leading-tight truncate">
          {producto.nombre}
        </h3>
        <p className="mt-0.5 text-sm text-zinc-500 line-clamp-2">
          {producto.descripcion}
        </p>
        <p className="mt-1 text-base font-extrabold">
          {formatPrice(producto.precio)}
        </p>
      </div>

      <div className="flex-shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-lg text-white">
          +
        </div>
      </div>
    </button>
  );
}
