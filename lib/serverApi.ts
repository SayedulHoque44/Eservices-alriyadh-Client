/**
 * Data fetching for Server Components (runs on the Next.js server, not in the browser).
 *
 * Calls the Express API directly at BACKEND_URL. Browser code uses lib/api.ts
 * instead, which goes through the /api proxy.
 */
import { cookies } from "next/headers";
import { cache } from "react";
import type { ApiResponse, PublicAkama } from "./types";

const backendUrl = (process.env.BACKEND_URL || "http://localhost:3001").replace(/\/+$/, "");

/**
 * Fetches one public record for server rendering. Never cached, so a record
 * made private disappears immediately. Returns null when it is not public.
 *
 * Used by app/akama/[id]/page.tsx. Wrapped in React `cache` so several calls
 * during the same page render only hit the API once.
 */
export const getPublicAkama = cache(async (id: string): Promise<PublicAkama | null> => {
  // Not a valid record ID -> treat as "not found" without calling the API
  if (!/^[a-f0-9]{24}$/i.test(id)) return null;
  const res = await fetch(`${backendUrl}/api/public/akama/${id}`, { cache: "no-store" });
  // 404 = private, deleted or unknown – the page shows "not available"
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Could not load record (status ${res.status})`);
  const body = (await res.json()) as ApiResponse<PublicAkama>;
  return body.data;
});

/**
 * True when the visitor is a logged-in admin. Forwards the browser's session
 * cookie to GET /api/auth/me, so an expired or fake cookie counts as logged out.
 *
 * Used by app/akama/[id]/page.tsx to show admin-only tools (the PDF button).
 */
export const isAdminLoggedIn = cache(async (): Promise<boolean> => {
  const session = (await cookies()).get("scs_admin_session");
  // No cookie at all -> not logged in, no need to ask the API
  if (!session) return false;
  try {
    const res = await fetch(`${backendUrl}/api/auth/me`, {
      headers: { Cookie: `${session.name}=${session.value}` },
      cache: "no-store",
    });
    return res.ok;
  } catch {
    // API unreachable -> treat as logged out (the record itself still shows)
    return false;
  }
});
