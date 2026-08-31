/**
 * Rate limiter in-memory simple para API routes.
 * En producción con múltiples instancias, reemplazar por Upstash Redis.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Limpiar entradas expiradas cada 5 minutos
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (entry.resetAt < now) store.delete(key);
  });
}, 5 * 60 * 1000);

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    const resetAt = now + options.windowMs;
    store.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: options.maxRequests - 1, resetAt };
  }

  entry.count++;

  if (entry.count > options.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return {
    allowed: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function rateLimitResponse(resetAt: number) {
  return new Response(
    JSON.stringify({ success: false, error: "Demasiadas solicitudes, esperá un momento" }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  );
}
