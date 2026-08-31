import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  // Rate limit estricto: 5 intentos por IP cada 15 minutos
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`login:${ip}`, {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
  });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const raw = await req.json();
    const parsed = loginSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: "Servicio no disponible" },
        { status: 503 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { success: false, error: "Email o contraseña incorrectos" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Error interno" },
      { status: 500 }
    );
  }
}
