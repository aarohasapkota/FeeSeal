"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import menuFixture from "@fixtures/menu.v1.json";
import publishFixture from "@fixtures/publish.confirmed.json";
import type { CanonicalMenu, PublicMenuResponse } from "@shared/contracts";
import { AppHeader } from "@/components/AppHeader";
import { FeeDisclosureBlock } from "@/components/FeeDisclosureBlock";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCents } from "@/lib/format";

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

function groupBySection(menu: CanonicalMenu) {
  const sections = new Map<string, CanonicalMenu["items"]>();
  for (const item of menu.items) {
    const list = sections.get(item.section) ?? [];
    list.push(item);
    sections.set(item.section, list);
  }
  return sections;
}

export default function PublicMenuPage() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "demo";
  const [data, setData] = useState<PublicMenuResponse | null>(null);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/restaurants/${id}/menu`);
        if (!res.ok) throw new Error("not found");
        setData((await res.json()) as PublicMenuResponse);
      } catch {
        setData(fixtureMenu());
        setNote("Showing fixture menu.");
      }
    }
    void load();
  }, [id]);

  const sections = useMemo(
    () => (data ? groupBySection(data.menu) : null),
    [data],
  );

  if (!data || !sections) {
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
    <>
      <AppHeader backHref="/" backLabel="Home" />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 pb-16">
        <div className="flex flex-wrap items-center gap-2">
          {data.verified ? (
            <StatusBadge tone="verified">Verified</StatusBadge>
          ) : (
            <StatusBadge tone="review">Unverified</StatusBadge>
          )}
          <span className="font-mono text-xs text-ink/45">
            v{menu.version}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink">
          {menu.restaurantName}
        </h1>
        <p className="mt-2 text-sm text-ink/55">Last updated {updated}</p>
        {note ? <p className="mt-2 text-sm text-review">{note}</p> : null}

        <div className="mt-8 space-y-8">
          {[...sections.entries()].map(([section, items]) => (
            <section key={section}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
                {section}
              </h2>
              <ul className="mt-3 divide-y divide-ink/10">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline justify-between gap-4 py-2.5"
                  >
                    <div>
                      <p className="font-medium text-ink">{item.name}</p>
                      {item.dietaryTags?.length ? (
                        <p className="mt-0.5 text-xs capitalize text-ink/45">
                          {item.dietaryTags.join(" · ").replaceAll("_", " ")}
                        </p>
                      ) : null}
                    </div>
                    <p className="shrink-0 font-mono text-ink">
                      {formatCents(item.priceCents)}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10">
          <FeeDisclosureBlock disclosures={menu.feeDisclosures} />
        </div>

        <section className="mt-10 space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Share
          </h2>
          <div className="flex items-center gap-4">
            <div
              className="flex h-28 w-28 items-center justify-center border border-dashed border-ink/20 bg-white"
              aria-hidden
            >
              <div className="grid h-20 w-20 grid-cols-5 gap-0.5 opacity-40">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span
                    key={i}
                    className={`bg-ink ${i % 3 === 0 || i % 7 === 0 ? "opacity-100" : "opacity-20"}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-ink/60">
              QR placeholder — guests scan to open this verified menu.
            </p>
          </div>
        </section>

        <div className="mt-10 flex flex-col gap-3">
          <Link
            href="/diner/scan"
            className="rounded-md bg-accent px-5 py-3 text-center font-medium text-white hover:bg-accent/90"
          >
            Scan &amp; compare
          </Link>
          {data.explorerUrl ? (
            <a
              href={data.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-sm text-accent hover:underline"
            >
              On-chain record
            </a>
          ) : null}
        </div>
      </main>
    </>
  );
}
