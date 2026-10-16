// Shown for private, deleted or unknown records (when page.tsx calls notFound()).
// Reveals nothing about the record – the same page for every case.
export default function AkamaNotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-xl font-semibold text-ink">This record is not available</h1>
      <p className="mt-2 text-sm text-ink-soft">The link may be wrong, or the record is no longer shared publicly.</p>
    </main>
  );
}
