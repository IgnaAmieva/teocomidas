"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Pedido } from "@/lib/types";

interface UsePedidosRealtimeOptions {
  soloHoy: boolean;
  onNuevoPedido?: () => void;
}

function startOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function startOfTomorrow(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export function usePedidosRealtime({
  soloHoy,
  onNuevoPedido,
}: UsePedidosRealtimeOptions) {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const onNuevoPedidoRef = useRef(onNuevoPedido);
  onNuevoPedidoRef.current = onNuevoPedido;

  const fetchPedidos = useCallback(async () => {
    if (!supabase) return;

    let query = supabase
      .from("pedidos")
      .select("*")
      .eq("mp_status", "approved")
      .order("created_at", { ascending: false });

    if (soloHoy) {
      const hoy = new Date();
      query = query
        .gte("created_at", startOfDay(hoy))
        .lt("created_at", startOfTomorrow(hoy));
    }

    const { data } = await query;
    if (data) {
      setPedidos(data as Pedido[]);
    }
    setLoading(false);
  }, [soloHoy]);

  useEffect(() => {
    fetchPedidos();
  }, [fetchPedidos]);

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel("pedidos-admin")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pedidos" },
        (payload) => {
          const pedido = payload.new as Pedido;

          if (payload.eventType === "INSERT" && pedido.mp_status === "approved") {
            setPedidos((prev) => [pedido, ...prev]);
            onNuevoPedidoRef.current?.();
          }

          if (payload.eventType === "UPDATE") {
            setPedidos((prev) =>
              prev.map((p) =>
                p.id === pedido.id ? { ...p, ...pedido } : p
              )
            );

            // Un pedido que pasa de pending a approved también es "nuevo"
            if (pedido.mp_status === "approved") {
              const existed = pedidos.some((p) => p.id === pedido.id);
              if (!existed) {
                setPedidos((prev) => {
                  if (prev.some((p) => p.id === pedido.id)) return prev;
                  return [pedido, ...prev];
                });
                onNuevoPedidoRef.current?.();
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(channel);
    };
  }, [soloHoy]); // eslint-disable-line react-hooks/exhaustive-deps

  return { pedidos, loading, refetch: fetchPedidos };
}
