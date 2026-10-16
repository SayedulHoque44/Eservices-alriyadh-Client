// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  // ============================================
  // CONFIGURATION: Local Error Handling Only
  // ============================================
  // This configuration uses Sentry for local error handling but does NOT send
  // errors to Sentry's monitoring servers. All Sentry APIs (captureException, etc.)
  // will still work locally for error handling purposes.
  //
  // To re-enable Sentry monitoring:
  // 1. Uncomment the dsn line below and comment out the dsn: undefined line
  // 2. Remove or comment out the beforeSend hook
  // 3. Adjust tracesSampleRate, enableLogs, and sendDefaultPii as needed
  // ============================================

  // Original DSN (commented out - uncomment to enable Sentry monitoring):
  // dsn: "https://1931f760f50f2ce848c85658c15686af@o4510590411735040.ingest.de.sentry.io/4510590412193872",
  
  // Current: DSN disabled - errors handled locally only, not sent to Sentry
  dsn: undefined,

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  // Original: tracesSampleRate: 1,
  tracesSampleRate: 0, // Disabled - no tracing data sent
  
  // Enable logs to be sent to Sentry
  // Original: enableLogs: true,
  enableLogs: false, // Disabled - no logs sent

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/configuration/options/#sendDefaultPii
  // Original: sendDefaultPii: true,
  sendDefaultPii: false, // Disabled - no PII sent

  // Prevent all events from being sent to Sentry server
  // This hook intercepts all events and prevents them from being transmitted
  // Remove or comment out this hook to allow events to be sent (when DSN is enabled)
  beforeSend: () => null,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
