import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Verifica que la request tenga una sesión válida de Supabase Auth.
 * Extrae el token del header Authorization (Bearer) o de la cookie.
 * Retorna null si está autenticado, o un NextResponse 401 si no.
 */
export async function requireAuth(
  req: NextRequest
): Promise<NextResponse | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { success: false, error: "Servicio no disponible" },
      { status: 503 }
    );
  }

  // Buscar token en Authorization header o en cookies de Supabase
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  // Fallback: buscar en cookies (supabase-auth-token o sb-*-auth-token)
  const cookieToken = extractTokenFromCookies(req);

  const accessToken = token || cookieToken;

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: "No autorizado" },
      { status: 401 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (error || !user) {
    return NextResponse.json(
      { success: false, error: "Sesión inválida o expirada" },
      { status: 401 }
    );
  }

  return null;
}

function extractTokenFromCookies(req: NextRequest): string | null {
  // Supabase stores auth in sb-<project-ref>-auth-token cookie
  for (const [name, value] of req.cookies.getAll().map((c) => [c.name, c.value])) {
    if (name.includes("auth-token")) {
      // The cookie value is a JSON array: ["access_token", "refresh_token"]
      try {
        const parsed = JSON.parse(decodeURIComponent(value));
        if (Array.isArray(parsed) && parsed[0]) return parsed[0];
        if (typeof parsed === "string") return parsed;
      } catch {
        // Not JSON, try as raw token
        if (value.startsWith("ey")) return value;
      }
    }
  }
  return null;
}
