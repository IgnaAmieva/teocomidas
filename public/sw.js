// Service worker mínimo para cumplir el requisito de instalabilidad PWA.
// No implementa cache offline todavía — se agrega cuando sea necesario.

const CACHE_NAME = "teocomidas-v1";

self.addEventListener("install", (event) => {
  // Activar inmediatamente sin esperar que se cierre la pestaña anterior
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Tomar control de todas las pestañas abiertas
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  // Network-first: intentar red, si falla devolver cache
  // Por ahora solo pasa todo a la red (sin offline support)
  event.respondWith(fetch(event.request));
});
