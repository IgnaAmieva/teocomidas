"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";

type PaymentStatus = "approved" | "rejected" | "pending" | "unknown";

const statusConfig: Record<
  PaymentStatus,
  { icon: string; title: string; description: string; color: string }
> = {
  approved: {
    icon: "✅",
    title: "Pago aprobado",
    description:
      "Tu pedido ya está en preparación. Te avisamos cuando esté listo.",
    color: "text-green-600",
  },
  pending: {
    icon: "⏳",
    title: "Pago pendiente",
    description:
      "Tu pago está siendo procesado. Cuando se confirme, empezamos a preparar tu pedido.",
    color: "text-amber-600",
  },
  rejected: {
    icon: "❌",
    title: "Pago rechazado",
    description:
      "No se pudo procesar el pago. Podés intentar de nuevo desde el carrito.",
    color: "text-red-600",
  },
  unknown: {
    icon: "❓",
    title: "Estado desconocido",
    description: "No pudimos verificar el estado del pago.",
    color: "text-zinc-600",
  },
};

function resolveStatus(param: string | null): PaymentStatus {
  if (param === "approved") return "approved";
  if (param === "rejected") return "rejected";
  if (param === "pending" || param === "in_process") return "pending";
  return "unknown";
}

function PedidoConfirmadoContent() {
  const searchParams = useSearchParams();
  const clearCart = useCartStore((s) => s.clearCart);
  const clearedRef = useRef(false);

  const mpStatus =
    searchParams.get("collection_status") || searchParams.get("status");
  const numeroPedido = searchParams.get("numero_pedido");
  const status = resolveStatus(mpStatus);
  const config = statusConfig[status];

  useEffect(() => {
    if (status === "approved" && !clearedRef.current) {
      clearedRef.current = true;
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <div className="flex flex-col items-center justify-center px-6 pt-16">
      <span className="text-6xl">{config.icon}</span>

      <h1
        className={`mt-6 text-center text-2xl font-extrabold ${config.color}`}
      >
        {config.title}
      </h1>

      <p className="mt-3 text-center text-zinc-500">{config.description}</p>

      {numeroPedido && (
        <div className="mt-6 rounded-2xl bg-zinc-900 px-6 py-5 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-zinc-400">
            Tu número de pedido
          </p>
          <p className="mt-1 text-5xl font-extrabold tabular-nums text-white">
            #{numeroPedido}
          </p>
          <p className="mt-2 text-sm text-zinc-400">
            Mostrá este número cuando retires tu pedido
          </p>
        </div>
      )}

      <div className="mt-8 flex w-full flex-col gap-3">
        {status === "rejected" && (
          <Link
            href="/carrito"
            className="block w-full rounded-2xl bg-zinc-900 py-4 text-center text-base font-bold text-white active:bg-zinc-700"
          >
            Volver al carrito
          </Link>
        )}
        <Link
          href="/"
          className="block w-full rounded-2xl border-2 border-zinc-200 py-4 text-center text-base font-bold text-zinc-700 active:bg-zinc-50"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export default function PedidoConfirmadoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center pt-20">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
        </div>
      }
    >
      <PedidoConfirmadoContent />
    </Suspense>
  );
}
