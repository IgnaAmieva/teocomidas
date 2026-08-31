"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/format";
import { getHorariosDisponibles } from "@/lib/horarios";
import type { CheckoutFormData, Modalidad, Result } from "@/lib/types";

export default function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const totalPrice = useCartStore((s) => s.totalPrice);

  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CheckoutFormData>({
    modalidad: "retiro",
    horario: "asap",
    nombre_cliente: "",
    patente: "",
    color_auto: "",
  });

  const [horarios, setHorarios] = useState<string[]>([]);

  useEffect(() => {
    setMounted(true);
    setHorarios(getHorariosDisponibles());
  }, []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-6 pt-20">
        <p className="text-5xl">🛒</p>
        <h1 className="mt-4 text-2xl font-extrabold">
          No hay nada para pagar
        </h1>
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

  const total = totalPrice();

  function updateField<K extends keyof CheckoutFormData>(
    key: K,
    value: CheckoutFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canSubmit =
    form.nombre_cliente.trim().length > 0 &&
    (form.modalidad !== "auto_car" || form.patente.trim().length > 0);

  async function handleSubmit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form, items, total }),
      });

      const result: Result<{ pedidoId: string; initPoint: string }> =
        await res.json();

      if (!result.success) {
        setError(result.error);
        setSubmitting(false);
        return;
      }

      // Redirigir al checkout de Mercado Pago
      window.location.href = result.data.initPoint;
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setSubmitting(false);
    }
  }

  return (
    <div className="px-4 pt-6 pb-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Checkout</h1>

      {/* 1. Modalidad */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Modalidad de retiro
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {(["retiro", "auto_car"] as Modalidad[]).map((m) => (
            <button
              key={m}
              onClick={() => updateField("modalidad", m)}
              className={`rounded-2xl border-2 px-4 py-4 text-center font-bold transition-colors ${
                form.modalidad === m
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700 active:bg-zinc-50"
              }`}
            >
              {m === "retiro" ? (
                <>
                  <span className="block text-2xl">🏪</span>
                  Retiro en el local
                </>
              ) : (
                <>
                  <span className="block text-2xl">🚗</span>
                  Auto Car
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Horario */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Horario
        </h2>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <button
            onClick={() => updateField("horario", "asap")}
            className={`rounded-2xl border-2 px-4 py-3.5 text-center font-bold transition-colors ${
              form.horario === "asap"
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-700 active:bg-zinc-50"
            }`}
          >
            Lo antes posible
          </button>
          <div className="relative">
            <select
              value={form.horario === "asap" ? "" : form.horario}
              onChange={(e) => {
                if (e.target.value) updateField("horario", e.target.value);
              }}
              className={`w-full appearance-none rounded-2xl border-2 px-4 py-3.5 text-center font-bold transition-colors ${
                form.horario !== "asap"
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              <option value="" disabled>
                Elegir hora
              </option>
              {horarios.map((h) => (
                <option key={h} value={h}>
                  {h} hs
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* 3. Datos del cliente */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Tus datos
        </h2>
        <div className="mt-2 space-y-3">
          <input
            type="text"
            placeholder="Nombre y apellido *"
            value={form.nombre_cliente}
            onChange={(e) => updateField("nombre_cliente", e.target.value)}
            className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base font-semibold placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />

          {form.modalidad === "auto_car" && (
            <>
              <input
                type="text"
                placeholder="Patente del auto *"
                value={form.patente}
                onChange={(e) =>
                  updateField("patente", e.target.value.toUpperCase())
                }
                maxLength={10}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base font-semibold uppercase placeholder:text-zinc-400 placeholder:normal-case focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <input
                type="text"
                placeholder="Color / modelo del auto (opcional)"
                value={form.color_auto}
                onChange={(e) => updateField("color_auto", e.target.value)}
                className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 text-base font-semibold placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
            </>
          )}
        </div>
      </section>

      {/* 4. Resumen del pedido */}
      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Tu pedido
        </h2>
        <div className="mt-2 rounded-2xl border border-zinc-200 bg-white p-4">
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.producto.id}
                className="flex items-center justify-between"
              >
                <span className="text-sm">
                  <span className="font-bold">{item.cantidad}x</span>{" "}
                  {item.producto.nombre}
                </span>
                <span className="text-sm font-bold">
                  {formatPrice(item.producto.precio * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-zinc-100 pt-3">
            <span className="text-lg font-bold">Total</span>
            <span className="text-xl font-extrabold">{formatPrice(total)}</span>
          </div>
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-2xl bg-red-50 p-4 text-center text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      {/* 5. Botón pagar */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit || submitting}
        className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#009ee3] py-4 text-base font-bold text-white transition-colors active:bg-[#0081c2] disabled:opacity-50"
      >
        {submitting ? (
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
            </svg>
            Pagar con Mercado Pago
          </>
        )}
      </button>
    </div>
  );
}
