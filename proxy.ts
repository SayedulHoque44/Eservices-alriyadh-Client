/**
 * Next.js 16 "proxy" (formerly middleware) – runs before every page renders.
 *
 * The site is closed to the public. Only these pages are reachable:
 *   - /admin/*            admin panel (needs the session cookie, else -> login)
 *   - /akama/{id}         public record page opened by shared links / QR codes
 *   - /card/{id}          old alias of /akama/{id}
 * Everything else (home page, /akama directory, unknown URLs) is sent to the
 * Facebook page set in lib/site.ts.
 *
 * The admin cookie check is only a convenience: every admin API route is
 * protected by the Express server, and an expired/invalid cookie is caught by
 * AdminShell (GET /api/auth/me).
 */
import { NextResponse, type NextRequest } from "next/server";
import { facebookUrl } from "@/lib/site";

// /akama/{id} or /card/{id} (one path segment, optional trailing slash)
const RECORD_PAGE = /^\/(akama|card)\/[^/]+\/?$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin panel ---------------------------------------------------------
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    // The login page itself must always be reachable
    if (pathname.startsWith("/admin/login")) return NextResponse.next();

    // No session cookie at all -> login page, remembering where to return
    if (!request.cookies.has("scs_admin_session")) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // --- Public record pages (shared links / QR codes) -----------------------
  if (RECORD_PAGE.test(pathname)) return NextResponse.next();

  // --- Everything else -> Facebook -----------------------------------------
  // Temporary (307) redirect so browsers don't cache it and a new link works at once
  return NextResponse.redirect(facebookUrl);
}

// Run for every page, but skip API calls, Next.js internals, Sentry tunnel
// and static files (anything with a file extension, e.g. /images/qr.png)
export const config = {
  matcher: ["/((?!api/|_next/|monitoring|.*\\..*).*)"],
};
