"use client";

import { useState } from "react";
import Link from "next/link";
import menuFixture from "@fixtures/menu.v1.json";
import publishFixture from "@fixtures/publish.confirmed.json";
import type { CanonicalMenu, PublishResult } from "@shared/contracts";
import { AppHeader } from "@/components/AppHeader";
import { HashDisplay } from "@/components/HashDisplay";
import { StatusBadge } from "@/components/StatusBadge";

export default function PublishConfirmationPage() {
  const menu = menuFixture as CanonicalMenu;
  const [result, setResult] = useState<PublishResult | null>(
    publishFixture as PublishResult,
  );
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLivePublish, setHasLivePublish] = useState(false);

  async function publish() {
    setPublishing(true);
    setError(null);
    try {
      const res = await fetch("/api/menus/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(menu),
      });
      if (!res.ok) throw new Error("Publish request failed");
      const data = (await res.json()) as PublishResult;
      setResult(data);
      setHasLivePublish(true);
    } catch {
      setResult(publishFixture as PublishResult);
      setError("API unavailable — showing fixture confirmation.");
    } finally {
      setPublishing(false);
    }
  }

  const status = result?.status ?? "pending";
  const statusTone =
    status === "confirmed"
      ? "confirmed"
      : status === "failed"
        ? "failed"
        : "pending";

  return (
    <>
      <AppHeader backHref="/restaurant" backLabel="Restaurant" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 pb-16">
        <p className="font-mono text-sm text-accent">Publish</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Menu sealed
        </h1>
        <p className="mt-2 text-ink/65">
          {menu.restaurantName} · version {menu.version}
        </p>

        {error ? (
          <p className="mt-4 text-sm text-review">{error}</p>
        ) : null}
        {!hasLivePublish && !error ? (
          <p className="mt-4 text-sm text-ink/50">
            Showing fixture confirmation. Publish to hit the live stub API.
          </p>
        ) : null}

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <StatusBadge tone={statusTone}>
            {publishing ? "publishing…" : status}
          </StatusBadge>
          {result?.explorerUrl ? (
            <a
              href={result.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-accent hover:underline"
            >
              View on Solana Explorer
            </a>
          ) : null}
        </div>

        {result ? (
          <div className="mt-6 space-y-4">
            <HashDisplay hash={result.menuHash} label="Menu hash" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/45">
                  Version
                </p>
                <p className="mt-1 font-mono font-medium text-ink">
                  {result.version}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/45">
                  Signature
                </p>
                <p className="mt-1 truncate font-mono text-ink/80">
                  {result.signature}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Canonical JSON
          </h2>
          <pre className="max-h-72 overflow-auto rounded border border-ink/10 bg-white p-4 font-mono text-xs leading-relaxed text-ink/80">
            {JSON.stringify(menu, null, 2)}
          </pre>
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/menu/${menu.restaurantId}`}
            className="flex-1 rounded-md bg-accent px-5 py-3 text-center font-medium text-white hover:bg-accent/90"
          >
            Open public menu
          </Link>
          <button
            type="button"
            onClick={() => void publish()}
            disabled={publishing}
            className="flex-1 rounded-md border border-ink/15 bg-white px-5 py-3 font-medium text-ink hover:border-ink/30 disabled:opacity-50"
          >
            {hasLivePublish ? "Publish again" : "Publish to chain stub"}
          </button>
        </div>
      </main>
    </>
  );
}
