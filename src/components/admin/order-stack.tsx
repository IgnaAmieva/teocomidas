"use client";

import type { Pedido } from "@/lib/types";
import OrderCard from "./order-card";

export default function OrderStack({
  pedidos,
  onAvanzar,
}: {
  pedidos: Pedido[];
  onAvanzar: (id: string) => Promise<void>;
}) {
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-4xl">📭</p>
        <p className="mt-3 text-lg font-bold text-zinc-400">
          No hay pedidos acá ahora
        </p>
      </div>
    );
  }

  // Show top card fully, peek at the next few behind it
  const topPedido = pedidos[0];
  const behindCount = Math.min(pedidos.length - 1, 3);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pt-4 pb-6">
      {/* Stack container */}
      <div className="relative">
        {/* Behind cards (decorative peek) */}
        {Array.from({ length: behindCount }).map((_, i) => {
          const offset = (i + 1) * 6;
          const scale = 1 - (i + 1) * 0.03;
          return (
            <div
              key={`behind-${i}`}
              className="absolute inset-x-0 top-0 rounded-2xl border-2 border-zinc-200 bg-white shadow-sm"
              style={{
                transform: `translateY(${offset}px) scale(${scale})`,
                zIndex: behindCount - i,
                height: "100%",
                opacity: 1 - (i + 1) * 0.15,
              }}
            />
          );
        })}

        {/* Top card — fully interactive */}
        <div className="relative" style={{ zIndex: behindCount + 1 }}>
          <OrderCard
            pedido={topPedido}
            onAvanzar={onAvanzar}
          />
        </div>
      </div>

      {/* Remaining count */}
      {pedidos.length > 1 && (
        <p className="mt-4 text-center text-sm font-semibold text-zinc-400">
          +{pedidos.length - 1} pedido{pedidos.length - 1 > 1 ? "s" : ""} más
          en la pila
        </p>
      )}
    </div>
  );
}
