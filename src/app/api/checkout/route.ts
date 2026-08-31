import { NextRequest, NextResponse } from "next/server";
import { createPedido } from "@/services/pedidos";
import { createPaymentPreference } from "@/services/mercadopago";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkoutBodySchema } from "@/lib/validations";
import { sanitizeString } from "@/lib/sanitize";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 checkouts por IP cada 5 minutos
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`checkout:${ip}`, {
    maxRequests: 10,
    windowMs: 5 * 60 * 1000,
  });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const raw = await req.json();

    // Validar payload completo con zod
    const parsed = checkoutBodySchema.safeParse(raw);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Datos inválidos";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    const { form, items } = parsed.data;

    // Sanitizar inputs de texto libre
    form.nombre_cliente = sanitizeString(form.nombre_cliente);
    form.color_auto = sanitizeString(form.color_auto);

    // Recalcular total con precios REALES de la base de datos
    const admin = getSupabaseAdmin();
    const productIds = items.map((i) => i.producto.id);

    const { data: dbProducts, error: dbError } = await admin
      .from("productos")
      .select("id, precio, disponible")
      .in("id", productIds);

    if (dbError || !dbProducts) {
      return NextResponse.json(
        { success: false, error: "Error al verificar productos" },
        { status: 500 }
      );
    }

    const preciosReales = new Map(
      dbProducts.map((p) => [p.id, { precio: Number(p.precio), disponible: p.disponible }])
    );

    // Verificar que todos los productos existan y estén disponibles
    for (const item of items) {
      const dbProduct = preciosReales.get(item.producto.id);
      if (!dbProduct) {
        return NextResponse.json(
          { success: false, error: `Producto "${item.producto.nombre}" no encontrado` },
          { status: 400 }
        );
      }
      if (!dbProduct.disponible) {
        return NextResponse.json(
          { success: false, error: `"${item.producto.nombre}" no está disponible` },
          { status: 400 }
        );
      }
    }

    // Total calculado con precios de la base de datos, no del cliente
    const totalServidor = items.reduce((sum, item) => {
      const precioReal = preciosReales.get(item.producto.id)!.precio;
      return sum + precioReal * item.cantidad;
    }, 0);

    // Sobreescribir precios del cliente con los reales para el pedido
    const itemsConPreciosReales = items.map((item) => ({
      ...item,
      producto: {
        ...item.producto,
        precio: preciosReales.get(item.producto.id)!.precio,
      },
    }));

    // 1. Crear pedido en Supabase
    const pedidoResult = await createPedido({
      form,
      items: itemsConPreciosReales,
      total: totalServidor,
    });

    if (!pedidoResult.success) {
      return NextResponse.json(pedidoResult, { status: 500 });
    }

    // 2. Crear preferencia de pago en Mercado Pago
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || `https://${req.headers.get("host")}`;

    const mpResult = await createPaymentPreference({
      pedidoId: pedidoResult.data.id,
      numeroPedido: pedidoResult.data.numero_pedido,
      items: itemsConPreciosReales,
      appUrl,
    });

    if (!mpResult.success) {
      return NextResponse.json(mpResult, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        pedidoId: pedidoResult.data.id,
        numeroPedido: pedidoResult.data.numero_pedido,
        initPoint: mpResult.data.initPoint,
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error interno del servidor";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
