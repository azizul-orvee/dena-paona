import { NextResponse, type NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

/**
 * Fast first gate for the app: no session cookie, straight to /login with a
 * way back. This only checks the cookie exists — the real check (is the
 * session valid and unexpired?) happens server-side in the /app layout and in
 * every server action via `requireUser()`.
 */
export function proxy(request: NextRequest) {
  if (getSessionCookie(request)) return NextResponse.next();

  const login = new URL("/login", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname !== "/app") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/app/:path*"],
};
