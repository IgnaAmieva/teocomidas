"use client";

import { useCallback, useRef, useState } from "react";
import type { Pedido } from "@/lib/types";
import OrderCard from "./order-card";

const PEEK_THRESHOLD = 120; // px to lock card in "peeked" position

export default function OrderStack({
  pedidos,
  onAvanzar,
}: {
  pedidos: Pedido[];
  onAvanzar: (id: string) => Promise<void>;
}) {
  if (pedidos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-4xl">📭</p>
        <p className="mt-3 text-lg font-bold text-zinc-400">
          No hay pedidos acá ahora
        </p>
      </div>
    );
  }

  return <StackContent pedidos={pedidos} onAvanzar={onAvanzar} />;
}

function StackContent({
  pedidos,
  onAvanzar,
}: {
  pedidos: Pedido[];
  onAvanzar: (id: string) => Promise<void>;
}) {
  // FIFO: oldest first (front of stack)
  const sorted = [...pedidos].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const topPedido = sorted[0];
  const secondPedido = sorted.length > 1 ? sorted[1] : null;
  const behindCount = Math.min(sorted.length - 1, 3);

  // Drag state
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPeeked, setIsPeeked] = useState(false);
  const dragStartY = useRef(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const resetCard = useCallback(() => {
    setIsPeeked(false);
    setDragY(0);
  }, []);

  function handlePointerDown(e: React.PointerEvent) {
    if (isPeeked || sorted.length < 2) return;
    // Don't drag if touching a button
    if ((e.target as HTMLElement).closest("button")) return;

    dragStartY.current = e.clientY;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    // Only allow dragging down
    if (delta > 0) {
      setDragY(delta);
    }
  }

  function handlePointerUp() {
    if (!isDragging) return;
    setIsDragging(false);

    if (dragY >= PEEK_THRESHOLD) {
      // Lock in peeked position
      setIsPeeked(true);
      setDragY(0);
    } else {
      // Snap back
      setDragY(0);
    }
  }

  // When peeked, the top card slides down revealing the one behind.
  // The peeked offset = enough to show the second card fully
  const peekedOffset = isPeeked ? 420 : 0;
  const currentOffset = isDragging ? dragY : peekedOffset;

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-6">
      <div
        className="relative"
        style={{ marginTop: `${behindCount * 10 + 16}px` }}
      >
        {/* Behind cards — decorative peek upward */}
        {Array.from({ length: behindCount }).map((_, i) => {
          const peekUp = (i + 1) * 10;
          const scale = 1 - (i + 1) * 0.04;
          return (
            <div
              key={`behind-${i}`}
              className="pointer-events-none absolute inset-x-0 top-0 rounded-2xl border-2 border-zinc-300 bg-zinc-100"
              style={{
                transform: `translateY(-${peekUp}px) scale(${scale})`,
                zIndex: behindCount - i,
                height: "60px",
              }}
            />
          );
        })}

        {/* Second card — revealed when peeking */}
        {secondPedido && (isPeeked || isDragging) && (
          <div
            className="absolute inset-x-0 top-0"
            style={{ zIndex: behindCount }}
          >
            <OrderCard pedido={secondPedido} onAvanzar={onAvanzar} />
          </div>
        )}

        {/* Top card — draggable */}
        <div
          ref={cardRef}
          className={`relative touch-pan-x ${
            !isDragging ? "transition-transform duration-300 ease-out" : ""
          }`}
          style={{
            zIndex: behindCount + 1,
            transform: `translateY(${currentOffset}px)`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <OrderCard pedido={topPedido} onAvanzar={onAvanzar} />

          {/* Drag hint — only if there are more cards behind */}
          {sorted.length > 1 && !isPeeked && (
            <p className="mt-2 text-center text-xs text-zinc-400">
              Arrastrá hacia abajo para espiar
            </p>
          )}
        </div>

        {/* Return overlay when peeked */}
        {isPeeked && (
          <button
            onClick={resetCard}
            className="fixed inset-0 z-50 cursor-pointer bg-black/0"
            aria-label="Volver a acomodar"
          />
        )}

        {/* Floating return button when peeked */}
        {isPeeked && (
          <div
            className="relative mt-2 flex justify-center"
            style={{ zIndex: behindCount + 2 }}
          >
            <button
              onClick={resetCard}
              className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white shadow-lg active:bg-zinc-700"
            >
              Volver a la pila
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
