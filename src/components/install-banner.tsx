"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type BannerMode = "android" | "ios" | null;

function detectMode(): BannerMode {
  if (typeof window === "undefined") return null;

  // Already installed as standalone
  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  if (isStandalone) return null;

  const ua = navigator.userAgent;

  // iOS Safari (not Chrome/Firefox on iOS — they also can't install)
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !("MSStream" in window);
  if (isIOS) return "ios";

  // Android or desktop Chrome/Edge that support beforeinstallprompt
  return "android";
}

export default function InstallBanner() {
  const [mode, setMode] = useState<BannerMode>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosTooltip, setShowIosTooltip] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [promptReady, setPromptReady] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed this session
    if (sessionStorage.getItem("install-banner-dismissed")) {
      setDismissed(true);
      return;
    }

    setMode(detectMode());

    function handlePrompt(e: Event) {
      e.preventDefault();
      deferredPromptRef.current = e as BeforeInstallPromptEvent;
      setPromptReady(true);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);

    // Hide if app gets installed
    function handleInstalled() {
      setMode(null);
    }
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    sessionStorage.setItem("install-banner-dismissed", "1");
  }, []);

  async function handleInstallClick() {
    const prompt = deferredPromptRef.current;
    if (!prompt) return;

    await prompt.prompt();
    const result = await prompt.userChoice;
    if (result.outcome === "accepted") {
      setMode(null);
    }
    deferredPromptRef.current = null;
    setPromptReady(false);
  }

  if (dismissed || !mode) return null;

  // Android: only show once the prompt event has been captured
  if (mode === "android" && !promptReady) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 mx-auto w-full max-w-lg px-4">
      <div className="relative rounded-2xl border border-zinc-200 bg-white p-4 shadow-lg">
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 active:bg-zinc-100"
          aria-label="Cerrar"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>

        {mode === "android" ? (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-extrabold text-white">
              TC
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold">Instalá Teo Comidas</p>
              <p className="text-xs text-zinc-500">
                Accedé más rápido desde tu pantalla de inicio
              </p>
            </div>
            <button
              onClick={handleInstallClick}
              className="flex-shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white active:bg-zinc-700"
            >
              Instalar
            </button>
          </div>
        ) : (
          /* iOS */
          <div>
            <div className="flex items-center gap-3 pr-6">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-extrabold text-white">
                TC
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Instalá Teo Comidas</p>
                <p className="text-xs text-zinc-500">
                  Agregá la app a tu pantalla de inicio
                </p>
              </div>
              <button
                onClick={() => setShowIosTooltip((v) => !v)}
                className="flex-shrink-0 rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-bold text-white active:bg-zinc-700"
              >
                Cómo
              </button>
            </div>

            {showIosTooltip && (
              <div className="mt-3 rounded-xl bg-zinc-50 p-3">
                <ol className="space-y-2 text-sm text-zinc-700">
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                      1
                    </span>
                    <span>
                      Tocá el botón{" "}
                      <span className="inline-block rounded border border-zinc-300 bg-white px-1.5 py-0.5 text-xs font-bold">
                        {/* Share icon */}
                        <svg
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="inline h-3.5 w-3.5 align-text-bottom"
                        >
                          <path d="M13.75 7h-1.5V4.56l-2.72 2.72a.75.75 0 01-1.06-1.06L11.19 3.5H8.75a.75.75 0 010-1.5h5a.75.75 0 01.75.75v4.25z" />
                          <path d="M3.5 9.75a.75.75 0 01.75-.75h2a.75.75 0 010 1.5H5v6h10v-6h-1.25a.75.75 0 010-1.5h2a.75.75 0 01.75.75v7a.75.75 0 01-.75.75h-12a.75.75 0 01-.75-.75v-7z" />
                        </svg>{" "}
                        Compartir
                      </span>{" "}
                      en la barra de Safari
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-bold text-white">
                      2
                    </span>
                    <span>
                      Elegí{" "}
                      <span className="font-bold">
                        &quot;Agregar a pantalla de inicio&quot;
                      </span>
                    </span>
                  </li>
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Type for the beforeinstallprompt event (not in standard lib)
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}
