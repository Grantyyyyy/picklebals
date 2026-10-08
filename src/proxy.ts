import { NextResponse, type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/proxy";

const LOGIN_PATH = "/admin/login";

/**
 * Runs only for /admin routes: refreshes the Supabase session cookie and performs an optimistic
 * redirect. Real authorization happens on the server in `requireAdmin()`.
 */
export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await updateSession(request);
  const isLoginPage = request.nextUrl.pathname === LOGIN_PATH;

  if (!isSignedIn && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.search = "";
    return NextResponse.redirect(url);
  }
  if (isSignedIn && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    url.search = "";
    return NextResponse.redirect(url);
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
