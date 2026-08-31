import { NextRequest, NextResponse } from "next/server";
import { getPaymentInfo } from "@/services/mercadopago";
import { updatePedidoPayment } from "@/services/pedidos";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { verifyMpWebhookSignature } from "@/lib/mp-webhook-verify";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 60 webhooks por IP por minuto (MP puede enviar ráfagas)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = checkRateLimit(`webhook:${ip}`, {
    maxRequests: 60,
    windowMs: 60 * 1000,
  });
  if (!rl.allowed) return rateLimitResponse(rl.resetAt);

  try {
    const body = await req.json();

    // Solo nos interesan notificaciones de pago
    if (body.type !== "payment" || !body.data?.id) {
      return NextResponse.json({ received: true });
    }

    const dataId = String(body.data.id);

    // Verificar firma del webhook
    if (!verifyMpWebhookSignature(req, dataId)) {
      console.error("Webhook MP: firma inválida");
      return NextResponse.json(
        { error: "Firma inválida" },
        { status: 403 }
      );
    }

    // Consultar el pago REAL a la API de MP (nunca confiar en el body del webhook)
    const paymentResult = await getPaymentInfo(dataId);

    if (!paymentResult.success) {
      console.error("Error consultando pago MP:", paymentResult.error);
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 500 }
      );
    }

    const { status, externalReference, transactionAmount } = paymentResult.data;

    if (!externalReference) {
      console.error("Pago sin external_reference:", dataId);
      return NextResponse.json({ received: true });
    }

    // Verificar que el pedido exista y que el monto coincida
    const admin = getSupabaseAdmin();
    const { data: pedido, error: pedidoError } = await admin
      .from("pedidos")
      .select("id, total, mp_status")
      .eq("id", externalReference)
      .single();

    if (pedidoError || !pedido) {
      console.error("Pedido no encontrado para webhook:", externalReference);
      return NextResponse.json(
        { error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    // Validar que el monto del pago coincida con el total del pedido
    if (
      transactionAmount !== undefined &&
      Math.abs(transactionAmount - Number(pedido.total)) > 0.01
    ) {
      console.error(
        `Monto no coincide: pago=${transactionAmount}, pedido=${pedido.total}`
      );
      return NextResponse.json(
        { error: "Monto no coincide con el pedido" },
        { status: 400 }
      );
    }

    // Mapear status de MP
    let mpStatus: string;
    if (status === "approved") {
      mpStatus = "approved";
    } else if (status === "rejected" || status === "cancelled") {
      mpStatus = "rejected";
    } else {
      mpStatus = "pending";
    }

    const updateResult = await updatePedidoPayment(
      externalReference,
      dataId,
      mpStatus
    );

    if (!updateResult.success) {
      console.error("Error actualizando pedido:", updateResult.error);
      return NextResponse.json(
        { error: updateResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({ received: true, status: mpStatus });
  } catch (err) {
    console.error("Error en webhook MP:", err);
    return NextResponse.json(
      { error: "Error interno" },
      { status: 500 }
    );
  }
}
