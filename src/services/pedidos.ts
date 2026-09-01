import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { CartItem, CheckoutFormData, PedidoItem, Result } from "@/lib/types";

interface CreatePedidoParams {
  form: CheckoutFormData;
  items: CartItem[];
  total: number;
}

// Usa service_role — solo llamar desde API routes server-side
export async function createPedido(
  params: CreatePedidoParams
): Promise<Result<{ id: string; numero_pedido: number }>> {
  try {
    const admin = getSupabaseAdmin();

    const pedidoItems: PedidoItem[] = params.items.map((item) => ({
      producto_id: item.producto.id,
      nombre: item.producto.nombre,
      cantidad: item.cantidad,
      precio_unitario: item.producto.precio,
    }));

    const { data, error } = await admin
      .from("pedidos")
      .insert({
        items: pedidoItems,
        total: params.total,
        modalidad: params.form.modalidad,
        metodo_pago: params.form.metodo_pago,
        horario_solicitado:
          params.form.horario === "asap" ? null : params.form.horario,
        nombre_cliente: params.form.nombre_cliente,
        color_auto:
          params.form.modalidad === "auto_car"
            ? params.form.color_auto || null
            : null,
      })
      .select("id, numero_pedido")
      .single();

    if (error || !data) {
      return {
        success: false,
        error: error?.message ?? "No se pudo crear el pedido",
      };
    }

    return {
      success: true,
      data: { id: data.id, numero_pedido: data.numero_pedido },
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error inesperado al crear pedido";
    return { success: false, error: message };
  }
}

// Usa service_role para bypasear RLS — solo llamar desde webhook server-side
export async function updatePedidoPayment(
  pedidoId: string,
  mpPaymentId: string,
  mpStatus: string
): Promise<Result<null>> {
  try {
    const admin = getSupabaseAdmin();

    const updateData: Record<string, string> = {
      mp_payment_id: mpPaymentId,
      mp_status: mpStatus,
    };

    if (mpStatus === "approved") {
      updateData.estado = "en_preparacion";
    }

    const { error } = await admin
      .from("pedidos")
      .update(updateData)
      .eq("id", pedidoId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: null };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al actualizar pedido";
    return { success: false, error: message };
  }
}
