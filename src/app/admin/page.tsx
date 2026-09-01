"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { usePedidosRealtime } from "@/hooks/use-pedidos-realtime";
import { useNotificationSound } from "@/hooks/use-notification-sound";
import OrderStack from "@/components/admin/order-stack";
import type { EstadoPedido } from "@/lib/types";

const TABS: { estado: EstadoPedido; label: string; color: string; activeColor: string }[] = [
  { estado: "pendiente", label: "Pendiente", color: "text-amber-700", activeColor: "bg-amber-500 text-white" },
  { estado: "en_preparacion", label: "En prep.", color: "text-orange-700", activeColor: "bg-orange-500 text-white" },
  { estado: "listo", label: "Listo", color: "text-green-700", activeColor: "bg-green-600 text-white" },
  { estado: "entregado", label: "Entregado", color: "text-zinc-500", activeColor: "bg-zinc-700 text-white" },
];

export default function AdminPage() {
  const router = useRouter();
  const playSound = useNotificationSound();
  const [soloHoy, setSoloHoy] = useState(true);
  const [flash, setFlash] = useState(false);
  const [tabActivo, setTabActivo] = useState<EstadoPedido>("pendiente");

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
    // Obtener el token de la sesión activa de Supabase (guardada en localStorage)
    const session = await supabase?.auth.getSession();
    const token = session?.data?.session?.access_token;

    const res = await fetch("/api/admin/pedidos", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
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

  // Count per estado
  const contadores = TABS.reduce(
    (acc, tab) => {
      acc[tab.estado] = pedidos.filter((p) => p.estado === tab.estado).length;
      return acc;
    },
    {} as Record<EstadoPedido, number>
  );

  const pedidosFiltrados = pedidos.filter((p) => p.estado === tabActivo);

  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Notificación flash de nuevo pedido */}
      {flash && (
        <div className="fixed inset-x-0 top-0 z-50 animate-pulse bg-green-500 py-3 text-center text-lg font-extrabold text-white">
          🔔 Nuevo pedido!
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-extrabold text-white">
              TC
            </div>
            <h1 className="text-xl font-extrabold">Pedidos</h1>
          </div>

          <div className="flex items-center gap-2">
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

      {/* Tabs de estado */}
      <div className="sticky top-[61px] z-30 overflow-hidden border-b border-zinc-200 bg-white px-1.5 py-2">
        <div className="grid grid-cols-4 gap-1">
          {TABS.map((tab) => {
            const isActive = tabActivo === tab.estado;
            const count = contadores[tab.estado];
            return (
              <button
                key={tab.estado}
                onClick={() => setTabActivo(tab.estado)}
                className={`flex flex-col items-center justify-center rounded-xl py-2.5 text-xs font-bold transition-colors ${
                  isActive
                    ? tab.activeColor
                    : "bg-zinc-50 text-zinc-500 active:bg-zinc-100"
                }`}
              >
                <span className="leading-tight">{tab.label}</span>
                <span
                  className={`mt-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full text-[10px] font-extrabold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-zinc-200 text-zinc-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <main>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : (
          <OrderStack
            pedidos={pedidosFiltrados}
            onAvanzar={handleAvanzar}
          />
        )}
      </main>
    </div>
  );
}
