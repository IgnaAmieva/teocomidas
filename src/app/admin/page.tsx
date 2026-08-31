"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePedidosRealtime } from "@/hooks/use-pedidos-realtime";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import OrderColumn from "@/components/admin/order-column";
import type { EstadoPedido } from "@/lib/types";

const ESTADOS: EstadoPedido[] = [
  "pendiente",
  "en_preparacion",
  "listo",
  "entregado",
];

export default function AdminPage() {
  const router = useRouter();
  const playSound = useNotificationSound();
  const [soloHoy, setSoloHoy] = useState(true);
  const [flash, setFlash] = useState(false);

  const handleNuevoPedido = useCallback(() => {
    playSound();
    setFlash(true);
    setTimeout(() => setFlash(false), 2000);
  }, [playSound]);

  const { pedidos, loading } = usePedidosRealtime({
    soloHoy,
    onNuevoPedido: handleNuevoPedido,
  });

  async function handleAvanzar(pedidoId: string) {
    const res = await fetch("/api/admin/pedidos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pedidoId, accion: "avanzar_estado" }),
    });
    const result = await res.json();
    if (!result.success) {
      alert("Error: " + result.error);
    }
  }

  async function handleLogout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Notificación flash de nuevo pedido */}
      {flash && (
        <div className="fixed inset-x-0 top-0 z-50 animate-pulse bg-green-500 py-3 text-center text-lg font-extrabold text-white">
          🔔 Nuevo pedido!
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-extrabold text-white">
              TC
            </div>
            <h1 className="text-xl font-extrabold lg:text-2xl">
              Pedidos
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Filtro hoy / historial */}
            <div className="flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
              <button
                onClick={() => setSoloHoy(true)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                  soloHoy
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Hoy
              </button>
              <button
                onClick={() => setSoloHoy(false)}
                className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
                  !soloHoy
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                Historial
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-semibold text-zinc-500 transition-colors hover:text-zinc-700"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="p-4 lg:p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {ESTADOS.map((estado) => (
              <OrderColumn
                key={estado}
                estado={estado}
                pedidos={pedidos.filter((p) => p.estado === estado)}
                onAvanzar={handleAvanzar}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
