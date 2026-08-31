"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Categoria, Modalidad, Producto } from "@/lib/types";
import {
  getCategoriaActual,
  categoriaLabels,
  categoriaEmojis,
} from "@/lib/get-categoria-actual";
import { supabase } from "@/lib/supabase";
import { mockProductos } from "@/lib/mock-productos";
import { useCartStore } from "@/lib/cart-store";
import ProductCard from "@/components/ProductCard";
import ProductModal from "@/components/ProductModal";

const categorias: Categoria[] = ["desayuno", "almuerzo", "merienda", "cena"];

function MenuContent() {
  const searchParams = useSearchParams();
  const setModalidad = useCartStore((s) => s.setModalidad);

  useEffect(() => {
    const param = searchParams.get("modalidad");
    if (param === "retiro" || param === "auto_car") {
      setModalidad(param as Modalidad);
    }
  }, [searchParams, setModalidad]);

  const [categoriaActiva, setCategoriaActiva] = useState<Categoria>(
    getCategoriaActual
  );
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Producto | null>(null);

  useEffect(() => {
    async function fetchProductos() {
      if (!supabase) {
        setProductos(mockProductos);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("productos")
          .select("*")
          .eq("disponible", true)
          .order("orden", { ascending: true });

        if (error || !data || data.length === 0) {
          setProductos(mockProductos);
        } else {
          setProductos(data as Producto[]);
        }
      } catch {
        setProductos(mockProductos);
      } finally {
        setLoading(false);
      }
    }

    fetchProductos();
  }, []);

  const productosFiltrados = productos.filter(
    (p) => p.categoria === categoriaActiva
  );

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-extrabold tracking-tight">Menú</h1>

      {/* Category tabs */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategoriaActiva(cat)}
            className={`flex-shrink-0 rounded-full px-4 py-2.5 text-sm font-bold transition-colors ${
              categoriaActiva === cat
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 active:bg-zinc-200"
            }`}
          >
            {categoriaEmojis[cat]} {categoriaLabels[cat]}
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="mt-4 space-y-3">
        {loading ? (
          <>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-[104px] animate-pulse rounded-2xl bg-zinc-200"
              />
            ))}
          </>
        ) : productosFiltrados.length === 0 ? (
          <p className="py-12 text-center text-zinc-400">
            No hay productos en esta categoría.
          </p>
        ) : (
          productosFiltrados.map((p) => (
            <ProductCard
              key={p.id}
              producto={p}
              onSelect={setSelected}
            />
          ))
        )}
      </div>

      {/* Product modal */}
      {selected && (
        <ProductModal
          producto={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 pt-6">
          <div className="h-8 w-24 animate-pulse rounded bg-zinc-200" />
          <div className="mt-4 flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-zinc-200" />
            ))}
          </div>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-zinc-200" />
            ))}
          </div>
        </div>
      }
    >
      <MenuContent />
    </Suspense>
  );
}
