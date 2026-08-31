import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireAuth } from "@/lib/auth-guard";
import { adminPedidoActionSchema } from "@/lib/validations";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import type { EstadoPedido } from "@/lib/types";

const ESTADO_SIGUIENTE: Record<string, EstadoPedido> = {
  pendiente: "en_preparacion",
  en_preparacion: "listo",
  listo: "entregado",
};

export async function PATCH(req: NextRequest) {
  // Rate limit: 60 acciones admin por IP por minuto
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`admin:${ip}`, {
    maxRequests: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  // Verificar autenticación en el servidor
  const authError = await requireAuth(req);
  if (authError) return authError;

  try {
    const raw = await req.json();

    // Validar payload con zod
    const parsed = adminPedidoActionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Datos inválidos" },
        { status: 400 }
      );
    }

    const { pedidoId } = parsed.data;
    const admin = getSupabaseAdmin();

    // Leer estado actual
    const { data: pedido, error: readError } = await admin
      .from("pedidos")
      .select("estado")
      .eq("id", pedidoId)
      .single();

    if (readError || !pedido) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const nuevoEstado = ESTADO_SIGUIENTE[pedido.estado];
    if (!nuevoEstado) {
      return NextResponse.json(
        { success: false, error: "El pedido ya está entregado" },
        { status: 400 }
      );
    }

    const { error: updateError } = await admin
      .from("pedidos")
      .update({ estado: nuevoEstado })
      .eq("id", pedidoId);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { estado: nuevoEstado } });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
