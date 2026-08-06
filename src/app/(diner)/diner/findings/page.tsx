"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import findingsFixture from "@fixtures/findings.demo.json";
import menuFixture from "@fixtures/menu.v1.json";
import extractionMenu from "@fixtures/extraction.menu.json";
import extractionReceipt from "@fixtures/extraction.receipt.json";
import type {
  CanonicalMenu,
  ComparisonResult,
  ExtractionDraft,
  FindingComparison,
} from "@shared/contracts";
import { FEESEAL_DISCLAIMER } from "@shared/contracts";
import { AppHeader } from "@/components/AppHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { FindingsList } from "@/components/FindingsList";
import { StatusBadge } from "@/components/StatusBadge";
import { formatCents } from "@/lib/format";
import { saveDemoState, useDemoState } from "@/lib/demo-state";

const COLUMN_LABEL: Record<FindingComparison, string> = {
  A_vs_B: "A vs B",
  A_vs_C: "A vs C",
  B_vs_C: "B vs C",
  receipt_layout: "Receipt",
  excluded: "Excluded",
};

export default function FindingsPage() {
  const demo = useDemoState();
  const menu = (demo.menu ?? menuFixture) as CanonicalMenu;
  const physical = (demo.physicalMenu ?? extractionMenu) as ExtractionDraft;
  const receipt = (demo.receipt ?? extractionReceipt) as ExtractionDraft;

  const [result, setResult] = useState<ComparisonResult | null>(
    demo.comparison,
  );
  const [explained, setExplained] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<string | null>(null);
  const [loading, setLoading] = useState(!demo.comparison);

  useEffect(() => {
    if (demo.comparison) return;

    let cancelled = false;

    async function run() {
      try {
        const res = await fetch("/api/scans/compare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            menu,
            physicalMenu: physical,
            receipt,
          }),
        });
        if (!res.ok) throw new Error("compare failed");
        const data = (await res.json()) as ComparisonResult;
        if (cancelled) return;
        setResult(data);
        saveDemoState({
          menu,
          physicalMenu: physical,
          receipt,
          comparison: data,
        });
      } catch {
        if (cancelled) return;
        const fallback: ComparisonResult = {
          ...(findingsFixture as ComparisonResult),
          disclaimer: FEESEAL_DISCLAIMER,
        };
        setResult(fallback);
        setNote("API unavailable — showing fixture findings.");
        saveDemoState({ comparison: fallback });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
    // Compare once per mount with current drafts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const byColumn = useMemo(() => {
    if (!result) return null;
    const groups: Partial<Record<FindingComparison, typeof result.findings>> =
      {};
    for (const finding of result.findings) {
      const list = groups[finding.comparison] ?? [];
      list.push(finding);
      groups[finding.comparison] = list;
    }
    return groups;
  }, [result]);

  function toggleExplained(id: string) {
    setExplained((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (loading || !result) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-ink/60">
        Comparing sources…
      </main>
    );
  }

  const matchPct = Math.round(result.matchRate * 100);
  const passCount = result.findings.filter((f) => f.passes).length;

  return (
    <>
      <AppHeader backHref="/diner/review?source=receipt" backLabel="Review" />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 pb-16">
        <p className="font-mono text-sm text-accent">Findings</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Three-source comparison
        </h1>
        <p className="mt-2 text-ink/65">
          Published menu (A), physical menu (B), and receipt (C). Language stays
          careful — differences are observable, not legal conclusions.
        </p>

        {note ? <p className="mt-4 text-sm text-review">{note}</p> : null}

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <StatusBadge tone={matchPct >= 80 ? "verified" : "review"}>
            {matchPct}% match rate
          </StatusBadge>
          <StatusBadge tone="verified">{passCount} passing check</StatusBadge>
        </div>

        <Disclaimer className="mt-6" />

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <SourceColumn
            label="A · Published"
            title={menu.restaurantName}
            rows={menu.items.map(
              (i) => `${i.name} · ${formatCents(i.priceCents)}`,
            )}
            fees={menu.feeDisclosures.map(
              (f) => `${f.kind.replaceAll("_", " ")} ${f.amountOrRate}`,
            )}
          />
          <SourceColumn
            label="B · Physical menu"
            title="Extracted"
            rows={physical.lines.map(
              (i) => `${i.name} · ${formatCents(i.priceCents)}`,
            )}
            fees={physical.fees.map((f) => `${f.label} ${f.amountOrRate}`)}
          />
          <SourceColumn
            label="C · Receipt"
            title="Extracted"
            rows={receipt.lines.map(
              (i) => `${i.name} · ${formatCents(i.priceCents)}`,
            )}
            fees={receipt.fees.map((f) => `${f.label} ${f.amountOrRate}`)}
          />
        </div>

        <section className="mt-12 space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Itemized findings
          </h2>
          {byColumn
            ? (
                Object.entries(byColumn) as [
                  FindingComparison,
                  NonNullable<typeof result.findings>,
                ][]
              ).map(([key, findings]) => (
                <div key={key} className="space-y-3">
                  <h3 className="font-mono text-xs uppercase tracking-wide text-ink/45">
                    {COLUMN_LABEL[key]}
                  </h3>
                  <FindingsList
                    findings={findings}
                    explainedIds={explained}
                    onMarkExplained={toggleExplained}
                  />
                </div>
              ))
            : null}
        </section>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/diner/verify"
            className="flex-1 rounded-md bg-accent px-5 py-3.5 text-center font-medium text-white hover:bg-accent/90"
          >
            Verify file integrity
          </Link>
          <Link
            href="/menu/demo"
            className="flex-1 rounded-md border border-ink/15 bg-white px-5 py-3.5 text-center font-medium text-ink hover:border-ink/30"
          >
            Back to public menu
          </Link>
        </div>

        <Disclaimer className="mt-10" />
      </main>
    </>
  );
}

function SourceColumn({
  label,
  title,
  rows,
  fees,
}: {
  label: string;
  title: string;
  rows: string[];
  fees: string[];
}) {
  return (
    <div className="rounded border border-ink/10 bg-white p-4">
      <p className="font-mono text-xs uppercase tracking-wide text-accent">
        {label}
      </p>
      <p className="mt-1 font-medium text-ink">{title}</p>
      <ul className="mt-3 space-y-1.5 text-sm text-ink/75">
        {rows.map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
      {fees.length > 0 ? (
        <ul className="mt-3 space-y-1 border-t border-ink/10 pt-3 text-sm text-ink/60">
          {fees.map((fee) => (
            <li key={fee} className="capitalize">
              {fee}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
