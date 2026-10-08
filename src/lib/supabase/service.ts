import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { publicEnv } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Privileged client using the secret key. It bypasses Row Level Security, so only use it in
 * server code paths that perform their own validation (e.g. the public submissions endpoint).
 */
export function createServiceClient(): SupabaseClient<Database> | null {
  const url = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY?.trim();
  if (!url || !secretKey) return null;

  return createClient<Database>(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
