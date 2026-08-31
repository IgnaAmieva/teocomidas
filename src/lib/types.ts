export type Categoria = "desayuno" | "almuerzo" | "merienda" | "cena";

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen_url: string;
  categoria: Categoria;
  disponible: boolean;
  orden: number;
}

export interface CartItem {
  producto: Producto;
  cantidad: number;
}

// --- Pedidos ---

export type Modalidad = "retiro" | "auto_car";

export type EstadoPedido =
  | "pendiente"
  | "en_preparacion"
  | "listo"
  | "entregado";

export type MpStatus = "pending" | "approved" | "rejected";

export interface PedidoItem {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
}

export interface Pedido {
  id: string;
  created_at: string;
  items: PedidoItem[];
  total: number;
  modalidad: Modalidad;
  horario_solicitado: string | null;
  nombre_cliente: string;
  patente: string | null;
  color_auto: string | null;
  estado: EstadoPedido;
  mp_payment_id: string | null;
  mp_status: MpStatus;
}

export interface CheckoutFormData {
  modalidad: Modalidad;
  horario: "asap" | string;
  nombre_cliente: string;
  patente: string;
  color_auto: string;
}

// --- Result type genérico ---

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };
