import { createHmac } from "crypto";
import { NextRequest } from "next/server";

/**
 * Verifica la firma del webhook de Mercado Pago según la documentación oficial.
 * https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 *
 * MP envía el header x-signature con formato:
 *   ts=<timestamp>,v1=<hmac_sha256>
 *
 * El template para firmar es:
 *   id:<data.id>;request-id:<x-request-id>;ts:<timestamp>;
 */
export function verifyMpWebhookSignature(
  req: NextRequest,
  dataId: string
): boolean {
  const webhookSecret = process.env.MP_WEBHOOK_SECRET;

  // Si no hay secret configurado, loguear warning pero permitir
  // (para desarrollo/test sin webhook secret)
  if (!webhookSecret) {
    console.warn(
      "MP_WEBHOOK_SECRET no configurado — omitiendo verificación de firma del webhook"
    );
    return true;
  }

  const xSignature = req.headers.get("x-signature");
  const xRequestId = req.headers.get("x-request-id");

  if (!xSignature || !xRequestId) {
    return false;
  }

  // Parsear ts y v1 del header x-signature
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, ...rest] = part.trim().split("=");
      return [key, rest.join("=")];
    })
  );

  const ts = parts.ts;
  const hash = parts.v1;

  if (!ts || !hash) {
    return false;
  }

  // Construir el template de firma según la doc de MP
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  const expectedHash = createHmac("sha256", webhookSecret)
    .update(manifest)
    .digest("hex");

  return hash === expectedHash;
}
