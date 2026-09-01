import { z } from "zod";

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY es requerido"),
  MP_ACCESS_TOKEN: z.string().optional().default(""),
  MP_WEBHOOK_SECRET: z.string().optional().default(""),
});

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().or(z.literal("")),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional().or(z.literal("")),
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.literal("")),
});

// Validar env del servidor solo cuando se necesita (lazy)
let _serverEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getServerEnv() {
  if (!_serverEnv) {
    const parsed = serverEnvSchema.safeParse(process.env);
    if (!parsed.success) {
      throw new Error(
        `Variables de entorno del servidor inválidas:\n${parsed.error.issues.map((i) => `  - ${i.path}: ${i.message}`).join("\n")}`
      );
    }
    _serverEnv = parsed.data;
  }
  return _serverEnv;
}

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY:
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "",
});
