import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/** Browser client. Uses only the publishable key; RLS governs everything it can access. */
export function createBrowserSupabaseClient() {
  const config = getSupabasePublicConfig();
  if (!config) return null;
  return createBrowserClient<Database>(config.url, config.publishableKey);
}
