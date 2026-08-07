import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";

export default function DinerHubPage() {
  return (
    <>
      <AppHeader backHref="/" backLabel="Home" />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 pb-16">
        <p className="font-mono text-sm text-accent">Diner</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Check what you were shown
        </h1>
        <p className="mt-3 text-ink/65">
          Scan the printed menu and your receipt, confirm the extracted values,
          then compare them to the published menu.
        </p>
        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/diner/scan"
            className="rounded-md bg-accent px-5 py-3.5 text-center font-medium text-white hover:bg-accent/90"
          >
            Start scan
          </Link>
          <Link
            href="/menu/demo"
            className="rounded-md border border-ink/15 bg-white px-5 py-3.5 text-center font-medium text-ink hover:border-ink/30"
          >
            View published menu
          </Link>
          <Link
            href="/diner/verify"
            className="rounded-md border border-ink/15 bg-white px-5 py-3.5 text-center font-medium text-ink hover:border-ink/30"
          >
            Verify file integrity
          </Link>
        </div>
      </main>
    </>
  );
}
