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

  // FIFO: oldest first (front of stack), newest at the back
  const sorted = [...pedidos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const topPedido = sorted[0];
  const behindCount = Math.min(sorted.length - 1, 3);

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6">
      {/* Stack: cards behind peek upward above the top card */}
      <div className="relative" style={{ marginTop: `${behindCount * 10 + 16}px` }}>
        {/* Behind cards — peek upward */}
        {Array.from({ length: behindCount }).map((_, i) => {
          const peekUp = (i + 1) * 10;
          const scale = 1 - (i + 1) * 0.04;
          return (
            <div
              key={`behind-${i}`}
              className="pointer-events-none absolute inset-x-0 top-0 rounded-2xl border-2 border-zinc-300 bg-zinc-100"
              style={{
                transform: `translateY(-${peekUp}px) scale(${scale})`,
                zIndex: behindCount - i,
                height: "60px",
              }}
            />
          );
        })}

        {/* Top card — fully interactive */}
        <div className="relative" style={{ zIndex: behindCount + 1 }}>
          <OrderCard pedido={topPedido} onAvanzar={onAvanzar} />
        </div>
      </div>
    </div>
  );
}
