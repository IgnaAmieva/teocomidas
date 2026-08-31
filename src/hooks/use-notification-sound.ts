"use client";

import { useCallback, useRef } from "react";

/**
 * Genera un beep de notificación usando Web Audio API.
 * No requiere archivos de audio externos.
 */
export function useNotificationSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const play = useCallback(() => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;

      // Dos tonos cortos tipo "ding-ding" para que se escuche claro
      [0, 0.25].forEach((offset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.3, ctx.currentTime + offset);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + offset + 0.2
        );

        osc.start(ctx.currentTime + offset);
        osc.stop(ctx.currentTime + offset + 0.2);
      });
    } catch {
      // Web Audio API no disponible, ignorar silenciosamente
    }
  }, []);

  return play;
}
