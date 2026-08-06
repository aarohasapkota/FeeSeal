import Link from "next/link";

/**
 * Minimal shell so the app boots. Diego owns real UI — see COWORKER_HANDOFF.md.
 */
export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <p className="font-mono text-sm tracking-wide text-accent">FeeSeal</p>
      <h1 className="mt-3 max-w-lg text-center text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        The menu price is the bill price. Verified.
      </h1>
      <p className="mt-4 max-w-md text-center text-ink/70">
        Publish once. Check the printed menu and the receipt against what the
        restaurant sealed on-chain.
      </p>
      <div className="mt-10 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
        <Link
          href="/diner"
          className="flex-1 rounded-md bg-accent px-4 py-3 text-center text-sm font-medium text-white"
        >
          I&apos;m dining
        </Link>
        <Link
          href="/restaurant"
          className="flex-1 rounded-md border border-ink/15 bg-white px-4 py-3 text-center text-sm font-medium text-ink"
        >
          I&apos;m a restaurant
        </Link>
      </div>
      <p className="mt-8 max-w-md text-center text-xs text-ink/50">
        Restaurants: photograph a menu at{" "}
        <code className="font-mono">/restaurant/publish</code>. Demo public
        page: <code className="font-mono">/m/demo</code>.
      </p>
    </main>
  );
}
