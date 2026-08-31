"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Pedido } from "@/lib/types";

const BOTON_LABEL: Record<string, string> = {
  pendiente: "Empezar a preparar",
  en_preparacion: "Marcar listo",
  listo: "Marcar entregado",
};

function timeAgo(created: string): string {
  const now = new Date();
  const then = new Date(created);
  const diffMin = Math.round((now.getTime() - then.getTime()) / 60000);
  if (diffMin < 1) return "recién";
  if (diffMin < 60) return `hace ${diffMin} min`;
  const h = Math.floor(diffMin / 60);
  return `hace ${h}h ${diffMin % 60}m`;
}

function formatHora(created: string): string {
  return new Date(created).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderCard({
  pedido,
  onAvanzar,
}: {
  pedido: Pedido;
  onAvanzar: (id: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);
  const esAutoCar = pedido.modalidad === "auto_car";
  const puedeAvanzar = pedido.estado !== "entregado";

  async function handleAvanzar() {
    setUpdating(true);
    await onAvanzar(pedido.id);
    setUpdating(false);
  }

  return (
    <div className="rounded-2xl border-2 border-zinc-200 bg-white p-4 shadow-sm">
      {/* Header: numero_pedido + modalidad */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-3xl font-extrabold tabular-nums">
            #{pedido.numero_pedido}
          </span>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-3 py-1 text-sm font-bold ${
            esAutoCar
              ? "bg-blue-100 text-blue-800"
              : "bg-zinc-100 text-zinc-700"
          }`}
        >
          {esAutoCar ? "🚗 Auto Car" : "🏪 Retiro"}
        </span>
      </div>

      {/* Cliente + hora */}
      <div className="mt-3">
        <p className="text-xl font-extrabold">{pedido.nombre_cliente}</p>
        <p className="text-sm text-zinc-400">
          {formatHora(pedido.created_at)} · {timeAgo(pedido.created_at)}
        </p>
        {pedido.horario_solicitado && (
          <p className="text-sm text-zinc-500">
            Quiere para las {pedido.horario_solicitado} hs
          </p>
        )}
      </div>

      {/* Auto car info — color/modelo como dato secundario */}
      {esAutoCar && pedido.color_auto && (
        <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2">
          <p className="text-center text-sm font-semibold text-blue-800">
            🚗 {pedido.color_auto}
          </p>
        </div>
      )}

      {/* Items */}
      <ul className="mt-3 space-y-1 border-t border-zinc-100 pt-3">
        {pedido.items.map((item, i) => (
          <li key={i} className="flex justify-between text-base">
            <span>
              <span className="font-bold">{item.cantidad}x</span>{" "}
              {item.nombre}
            </span>
            <span className="font-semibold tabular-nums text-zinc-600">
              {formatPrice(item.precio_unitario * item.cantidad)}
            </span>
          </li>
        ))}
      </ul>

      {/* Total */}
      <div className="mt-2 flex justify-between border-t border-zinc-100 pt-2">
        <span className="text-lg font-bold">Total</span>
        <span className="text-lg font-extrabold">{formatPrice(pedido.total)}</span>
      </div>

      {/* Botón avanzar estado */}
      {puedeAvanzar && (
        <button
          onClick={handleAvanzar}
          disabled={updating}
          className={`mt-4 w-full rounded-xl py-3.5 text-base font-bold text-white transition-colors disabled:opacity-50 ${
            pedido.estado === "pendiente"
              ? "bg-amber-500 active:bg-amber-600"
              : pedido.estado === "en_preparacion"
                ? "bg-green-600 active:bg-green-700"
                : "bg-zinc-700 active:bg-zinc-800"
          }`}
        >
          {updating ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            BOTON_LABEL[pedido.estado]
          )}
        </button>
      )}
    </div>
  );
}
