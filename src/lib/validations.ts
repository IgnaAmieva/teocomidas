import { z } from "zod";

export const checkoutFormSchema = z.object({
  modalidad: z.enum(["retiro", "auto_car"]),
  horario: z.string().min(1),
  nombre_cliente: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100, "El nombre es demasiado largo"),
  patente: z.string().max(10).default(""),
  color_auto: z.string().max(100).default(""),
});

export const checkoutItemSchema = z.object({
  producto: z.object({
    id: z.string().uuid(),
    nombre: z.string(),
    descripcion: z.string(),
    precio: z.number().positive(),
    imagen_url: z.string(),
    categoria: z.enum(["desayuno", "almuerzo", "merienda", "cena"]),
    disponible: z.boolean(),
    orden: z.number(),
  }),
  cantidad: z.number().int().positive().max(50),
});

export const checkoutBodySchema = z.object({
  form: checkoutFormSchema,
  items: z.array(checkoutItemSchema).min(1, "El carrito está vacío").max(30),
  total: z.number().positive(),
});

export const adminPedidoActionSchema = z.object({
  pedidoId: z.string().uuid(),
  accion: z.literal("avanzar_estado"),
});

// Validación refinada: si modalidad es auto_car, patente es obligatoria
export const checkoutFormRefined = checkoutFormSchema.refine(
  (data) => {
    if (data.modalidad === "auto_car") {
      return data.patente.trim().length > 0;
    }
    return true;
  },
  { message: "La patente es requerida para Auto Car", path: ["patente"] }
);
