import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env";

/**
 * Cliente Supabase con service_role key — bypasea RLS.
 * Solo usar en server-side (API routes, server actions, webhooks).
 */
export function getSupabaseAdmin() {
  const { SUPABASE_SERVICE_ROLE_KEY } = getServerEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL no está configurada");
  }

  return createClient(url, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
