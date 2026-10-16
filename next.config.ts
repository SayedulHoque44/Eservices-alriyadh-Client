/**
 * Next.js configuration.
 *
 * Note: rewrites/redirects are fixed at BUILD time, so BACKEND_URL must be set
 * before `pnpm build` (and the app rebuilt when it changes).
 */
import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

// Express API. Browser requests to /api/* are proxied there, so the admin
// session cookie stays first-party and no CORS setup is needed.
const backendUrl = (process.env.BACKEND_URL || "http://localhost:3001").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // Don't advertise "Next.js" in response headers
  poweredByHeader: false,
  // /api/anything on this site -> BACKEND_URL/api/anything (Express)
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${backendUrl}/api/:path*` },
      // Links/QR codes made while the server used /card/{id} keep working (same page as /akama/{id})
      { source: "/card/:id", destination: "/akama/:id" },
    ];
  },
  // /admin/akama is an alias of the dashboard
  async redirects() {
    return [{ source: "/admin/akama", destination: "/admin", permanent: false }];
  },
  // Basic security headers on every page
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

// Check if Sentry is enabled (has DSN) to avoid unnecessary source map uploads
const isSentryEnabled =
  process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

// Only apply Sentry config when actually enabled
const config = isSentryEnabled
  ? withSentryConfig(nextConfig, {
      org: "sh-org-cx",
      project: "javascript-nextjs",
      // Only print logs for uploading source maps in CI
      silent: !process.env.CI,
      widenClientFileUpload: true,
      // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
      tunnelRoute: "/monitoring",
      webpack: {
        automaticVercelMonitors: true,
        treeshake: {
          removeDebugLogging: true,
        },
      },
    })
  : nextConfig;

export default config;
