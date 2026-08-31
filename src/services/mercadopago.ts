import { MercadoPagoConfig, Preference, Payment } from "mercadopago";
import { getServerEnv } from "@/lib/env";
import type { CartItem, Result } from "@/lib/types";

function getClient() {
  const { MP_ACCESS_TOKEN } = getServerEnv();
  return new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN });
}

interface CreatePreferenceParams {
  pedidoId: string;
  items: CartItem[];
  appUrl: string;
}

interface PreferenceResult {
  preferenceId: string;
  initPoint: string;
}

export async function createPaymentPreference(
  params: CreatePreferenceParams
): Promise<Result<PreferenceResult>> {
  try {
    const client = getClient();
    const preference = new Preference(client);

    const result = await preference.create({
      body: {
        items: params.items.map((item) => ({
          id: item.producto.id,
          title: item.producto.nombre,
          quantity: item.cantidad,
          unit_price: item.producto.precio,
          currency_id: "ARS",
        })),
        back_urls: {
          success: `${params.appUrl}/pedido-confirmado?pedido_id=${params.pedidoId}`,
          failure: `${params.appUrl}/pedido-confirmado?pedido_id=${params.pedidoId}`,
          pending: `${params.appUrl}/pedido-confirmado?pedido_id=${params.pedidoId}`,
        },
        auto_return: "approved",
        external_reference: params.pedidoId,
        notification_url: `${params.appUrl}/api/mp-webhook`,
      },
    });

    if (!result.id || !result.init_point) {
      return { success: false, error: "No se pudo crear la preferencia de pago" };
    }

    return {
      success: true,
      data: {
        preferenceId: result.id,
        initPoint: result.init_point,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al crear preferencia de MP";
    return { success: false, error: message };
  }
}

export async function getPaymentInfo(
  paymentId: string
): Promise<
  Result<{
    status: string;
    externalReference: string | undefined;
    transactionAmount: number | undefined;
  }>
> {
  try {
    const client = getClient();
    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });

    return {
      success: true,
      data: {
        status: result.status ?? "unknown",
        externalReference: result.external_reference,
        transactionAmount: result.transaction_amount ?? undefined,
      },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al consultar pago";
    return { success: false, error: message };
  }
}
