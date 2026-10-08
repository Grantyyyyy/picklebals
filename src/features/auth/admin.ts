import "server-only";

import { redirect } from "next/navigation";

import { createSessionClient } from "@/lib/supabase/server";

export type AdminUser = { id: string; email: string | null };

export type AdminAccess =
  | { status: "unconfigured" }
  | { status: "forbidden"; email: string | null }
  | { status: "admin"; user: AdminUser };

/**
 * Verifies the current request belongs to a signed-in administrator. Reads cookies, so callers
 * must render inside `<Suspense>`. Signed-out users are redirected to the login page.
 */
export async function requireAdmin(): Promise<AdminAccess> {
  const supabase = await createSessionClient();
  if (!supabase) return { status: "unconfigured" };

  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) redirect("/admin/login");

  const email = typeof claims.email === "string" ? claims.email : null;
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");
  if (rpcError) throw new Error(`Failed to verify admin access: ${rpcError.message}`);
  if (!isAdmin) return { status: "forbidden", email };

  return { status: "admin", user: { id: claims.sub, email } };
}
