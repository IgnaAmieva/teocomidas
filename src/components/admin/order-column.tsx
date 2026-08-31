"use client";

import type { EstadoPedido, Pedido } from "@/lib/types";
import OrderCard from "./order-card";

const COLUMN_CONFIG: Record<
  EstadoPedido,
  { label: string; color: string; bgColor: string }
> = {
  pendiente: {
    label: "Pendiente",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  en_preparacion: {
    label: "En preparación",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
  },
  listo: {
    label: "Listo",
    color: "text-green-700",
    bgColor: "bg-green-50",
  },
  entregado: {
    label: "Entregado",
    color: "text-zinc-500",
    bgColor: "bg-zinc-50",
  },
};

export default function OrderColumn({
  estado,
  pedidos,
  onAvanzar,
}: {
  estado: EstadoPedido;
  pedidos: Pedido[];
  onAvanzar: (id: string) => Promise<void>;
}) {
  const config = COLUMN_CONFIG[estado];

  return (
    <div className={`flex flex-col rounded-2xl ${config.bgColor} p-3`}>
      {/* Header */}
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className={`text-lg font-extrabold ${config.color}`}>
          {config.label}
        </h2>
        <span
          className={`flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold ${config.color} ${config.bgColor} border border-current`}
        >
          {pedidos.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3 overflow-y-auto">
        {pedidos.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-400">
            Sin pedidos
          </p>
        ) : (
          pedidos.map((p) => (
            <OrderCard key={p.id} pedido={p} onAvanzar={onAvanzar} />
          ))
        )}
      </div>
    </div>
  );
}
