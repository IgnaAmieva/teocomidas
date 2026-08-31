/**
 * Sanitiza strings de input del usuario para prevenir XSS.
 * Escapa caracteres HTML peligrosos.
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

/**
 * Sanitiza una patente: solo letras, números y espacios.
 */
export function sanitizePatente(input: string): string {
  return input.replace(/[^a-zA-Z0-9\s-]/g, "").trim().toUpperCase();
}
