"use client"; // Error components must be Client Components
/**
 * Shown when a page crashes while rendering. "Try again" re-renders the page.
 */

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold text-ink">Something went wrong</h1>
      <p className="mt-3 text-ink-soft">Please try again. If the problem continues, contact us on WhatsApp.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex h-11 items-center rounded-full bg-brand-600 px-6 font-medium text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </main>
  );
}
