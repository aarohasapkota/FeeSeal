import Link from "next/link";
import menuFixture from "@fixtures/menu.v1.json";
import publishFixture from "@fixtures/publish.confirmed.json";
import type { CanonicalMenu, PublicMenuResponse } from "@shared/contracts";
import { PaperMenu } from "@/components/menu-templates";
import { hashCanonicalMenu } from "@/lib/hash";
import {
  getPublishedMenu,
  toPublicMenuResponse,
} from "@/lib/menu-store";

function loadMenu(id: string): PublicMenuResponse | null {
  const stored = getPublishedMenu(id);
  if (stored) return toPublicMenuResponse(stored);

  const fixture = menuFixture as CanonicalMenu;
  if (id !== fixture.restaurantId && id !== "demo") return null;

  return {
    menu: fixture,
    menuHash: hashCanonicalMenu(fixture),
    verified: true,
    lastUpdated: fixture.effectiveFrom,
    templateId: fixture.templateId,
    signature: publishFixture.signature,
    explorerUrl: publishFixture.explorerUrl,
  };
}

export default async function PublicMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = loadMenu(id);

  if (!data) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16">
        <h1 className="font-menu text-2xl">Menu not found</h1>
        <p className="mt-2 text-sm text-ink/60">
          Publish a menu from the restaurant flow, or try{" "}
          <Link className="text-accent underline" href="/m/demo">
            /m/demo
          </Link>
          .
        </p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[radial-gradient(ellipse_at_top,_#e8eee9_0%,_var(--surface)_50%)] px-3 py-10 sm:px-6">
      <div className="mx-auto mb-6 flex max-w-[56rem] items-center justify-between gap-3 text-xs text-ink/50">
        <Link href="/" className="font-mono tracking-wide text-accent">
          FeeSeal
        </Link>
        {data.verified ? (
          <span className="font-medium text-verified">Verified menu</span>
        ) : null}
      </div>
      <PaperMenu menu={data.menu} verified={data.verified} />
      <p className="mx-auto mt-6 max-w-[42rem] break-all text-center font-mono text-[10px] text-ink/40">
        {data.menuHash}
      </p>
    </main>
  );
}
