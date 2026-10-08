import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabasePublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Cookie-less client for public, published content. It never reads the request, so it is safe
 * to call inside `"use cache"` functions and lets public pages prerender into static shells.
 * Row Level Security restricts it to published rows.
 */
export function createPublicClient(): SupabaseClient<Database> | null {
  const config = getSupabasePublicConfig();
  if (!config) return null;

  return createClient<Database>(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
