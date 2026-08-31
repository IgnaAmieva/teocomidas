"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center px-6 pt-16">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-zinc-900 text-3xl font-extrabold text-white">
        TC
      </div>
      <h1 className="mb-2 text-center text-3xl font-extrabold tracking-tight">
        Teo Comidas
      </h1>
      <p className="mb-8 text-center text-zinc-500">
        Pizzas, sanguches y focaccias con masa madre.
        <br />
        Tunuyán, Mendoza.
      </p>

      <div className="grid w-full gap-3">
        <Link
          href="/menu?modalidad=retiro"
          className="rounded-xl bg-zinc-900 px-6 py-4 text-center text-lg font-bold text-white transition-colors active:bg-zinc-700"
        >
          🏪 Retiro en el local
        </Link>
        <Link
          href="/menu?modalidad=auto_car"
          className="rounded-xl border-2 border-zinc-900 px-6 py-4 text-center text-lg font-bold text-zinc-900 transition-colors active:bg-zinc-100"
        >
          🚗 Auto Car
        </Link>
      </div>

      <p className="mt-10 text-center text-sm text-zinc-400">
        Elegí cómo querés recibir tu pedido y empezá a armar tu combo.
      </p>
    </div>
  );
}
