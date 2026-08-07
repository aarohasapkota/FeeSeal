import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function RestaurantHubPage() {
  return (
    <>
      <AppHeader backHref="/" backLabel="Home" />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 pb-16">
        <p className="font-mono text-sm text-accent">Restaurant</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Seal your menu
        </h1>
        <p className="mt-3 text-ink/65">
          Preview the canonical menu, publish a hash, and share a verified
          public page guests can open on their phone.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/restaurant/publish"
            className="rounded-md bg-accent px-5 py-3.5 text-center font-medium text-white hover:bg-accent/90"
          >
            Publish menu
          </Link>
          <Link
            href="/menu/demo"
            className="rounded-md border border-ink/15 bg-white px-5 py-3.5 text-center font-medium text-ink hover:border-ink/30"
          >
            View public menu
          </Link>
        </div>
      </main>
    </>
  );
}
