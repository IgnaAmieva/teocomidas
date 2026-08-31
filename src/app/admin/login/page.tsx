"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setError("Supabase no está configurado");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Login via API route con rate limiting server-side
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // Setear la sesión en el cliente de Supabase
      await supabase.auth.setSession({
        access_token: result.data.access_token,
        refresh_token: result.data.refresh_token,
      });

      router.replace("/admin");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-zinc-900 text-xl font-extrabold text-white">
            TC
          </div>
          <h1 className="text-2xl font-extrabold">Panel Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">Teo Comidas</p>
        </div>

        <div className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-base focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
          />
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-zinc-900 py-3.5 text-base font-bold text-white transition-colors active:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
