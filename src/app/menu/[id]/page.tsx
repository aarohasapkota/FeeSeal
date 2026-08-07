"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import menuFixture from "@fixtures/menu.v1.json";
import publishFixture from "@fixtures/publish.confirmed.json";
import type { CanonicalMenu, PublicMenuResponse } from "@shared/contracts";
import { AppHeader } from "@/components/AppHeader";
import { MenuViewer } from "@/components/MenuViewer";
import { StatusBadge } from "@/components/StatusBadge";

function fixtureMenu(): PublicMenuResponse {
  const menu = menuFixture as CanonicalMenu;
  return {
    menu,
    menuHash: publishFixture.menuHash,
    verified: true,
    lastUpdated: menu.effectiveFrom,
    signature: publishFixture.signature,
    explorerUrl: publishFixture.explorerUrl,
  };
}

export default function PublicMenuPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "demo";
  const [data, setData] = useState<PublicMenuResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/restaurants/${id}/menu`);
        if (!res.ok) throw new Error("not found");
        setData((await res.json()) as PublicMenuResponse);
      } catch {
        setData(fixtureMenu());
      }
    }
    void load();
  }, [id]);

  if (!data) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-ink/60">
        Loading menu…
      </main>
    );
  }

  const { menu } = data;
  const updated = new Date(data.lastUpdated).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AppHeader backHref="/" backLabel="Home" />

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-2">
          {data.verified ? (
            <StatusBadge tone="verified">Verified</StatusBadge>
          ) : (
            <StatusBadge tone="review">Unverified</StatusBadge>
          )}
          <span className="font-mono text-xs text-ink/45">v{menu.version}</span>
          {data.explorerUrl ? (
            <a
              href={data.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-accent hover:underline"
            >
              On-chain record
            </a>
          ) : null}
        </div>
        <Link
          href="/diner/scan"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          Scan &amp; compare
        </Link>
      </div>

      <MenuViewer
        menu={menu}
        verified={data.verified}
        updatedLabel={updated}
        proofHref={data.explorerUrl ?? "/diner/verify"}
      />
    </div>
  );
}
