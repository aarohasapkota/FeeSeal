import Link from "next/link";

/**
 * Landing — two doors: diner / restaurant.
 * Brand-first trust product hero.
 */
export default function HomePage() {
  return (
    <main className="relative flex flex-1 flex-col">
      <div className="flex flex-1 flex-col justify-center px-6 py-16 sm:px-10">
        <p className="animate-fade font-mono text-sm tracking-[0.2em] text-accent">
          FEESEAL
        </p>
        <h1 className="animate-rise mt-5 max-w-xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
          The menu price is the bill price.
        </h1>
        <p className="animate-rise-delay mt-4 max-w-md text-lg text-ink/65">
          Publish once. Check the printed menu and the receipt against what the
          restaurant sealed.
        </p>
        <div className="animate-rise-delay-2 mt-10 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <Link
            href="/diner"
            className="flex-1 rounded-md bg-accent px-5 py-3.5 text-center text-base font-medium text-white transition hover:bg-accent/90"
          >
            I&apos;m dining
          </Link>
          <Link
            href="/restaurant"
            className="flex-1 rounded-md border border-ink/15 bg-white/80 px-5 py-3.5 text-center text-base font-medium text-ink backdrop-blur transition hover:border-ink/30"
          >
            I&apos;m a restaurant
          </Link>
        </div>
      </div>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-accent/[0.06] to-transparent"
        aria-hidden
      />
    </main>
  );
}
