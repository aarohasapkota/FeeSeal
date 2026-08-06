import Link from "next/link";

export default function RestaurantHomePage() {
  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-6 py-16">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Restaurant
      </p>
      <h1 className="mt-3 font-menu text-4xl tracking-tight text-ink">
        Publish your menu
      </h1>
      <p className="mt-3 text-ink/70">
        Photograph the printed menu. FeeSeal extracts items and prices, you
        confirm them, then choose a paper-style page layout for guests.
      </p>
      <Link
        href="/restaurant/publish"
        className="mt-8 inline-flex items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-medium text-white"
      >
        Start with a photo
      </Link>
      <Link href="/" className="mt-4 text-center text-sm text-ink/50">
        Back to FeeSeal
      </Link>
    </main>
  );
}
