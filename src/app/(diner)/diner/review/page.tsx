"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import type { ExtractionDraft } from "@shared/contracts";
import { AppHeader } from "@/components/AppHeader";
import { ExtractionEditor } from "@/components/ExtractionEditor";
import { saveDemoState, useDemoState } from "@/lib/demo-state";

function ReviewInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get("source");
  const source: ExtractionDraft["source"] =
    sourceParam === "receipt" ? "receipt" : "physical_menu";
  const demo = useDemoState();

  const stored =
    source === "physical_menu" ? demo.physicalMenu : demo.receipt;
  const imageUrl =
    source === "physical_menu"
      ? demo.menuImageDataUrl
      : demo.receiptImageDataUrl;

  const [override, setOverride] = useState<ExtractionDraft | null>(null);
  // Reset local edits when switching B → C
  const draftKey = source;
  const [activeKey, setActiveKey] = useState(draftKey);
  if (activeKey !== draftKey) {
    setActiveKey(draftKey);
    setOverride(null);
  }
  const draft = override ?? stored;

  useEffect(() => {
    if (!stored) router.replace("/diner/scan");
  }, [stored, router]);

  const title = useMemo(
    () =>
      source === "physical_menu"
        ? "Review menu extraction"
        : "Review receipt extraction",
    [source],
  );

  if (!stored || !draft) {
    return (
      <main className="mx-auto max-w-lg px-6 py-16 text-ink/60">
        {stored ? "Loading…" : "Redirecting to scan…"}
      </main>
    );
  }

  function confirm() {
    if (source === "physical_menu") {
      saveDemoState({ physicalMenu: draft });
      setOverride(null);
      router.push("/diner/review?source=receipt");
    } else {
      saveDemoState({ receipt: draft });
      router.push("/diner/findings");
    }
  }

  return (
    <>
      <AppHeader backHref="/diner/scan" backLabel="Scan" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 pb-16">
        <p className="font-mono text-sm text-accent">
          Review · {source === "physical_menu" ? "Source B" : "Source C"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-ink/65">
          Correct anything the model misread before comparing. Edits stay local
          until you confirm.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt="Captured document"
                className="w-full rounded border border-ink/10 object-cover"
              />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center rounded border border-dashed border-ink/15 bg-white text-sm text-ink/50">
                No image preview
              </div>
            )}
          </div>
          <ExtractionEditor
            draft={draft}
            onChange={(next) => setOverride(next)}
          />
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={confirm}
            className="flex-1 rounded-md bg-accent px-5 py-3.5 font-medium text-white hover:bg-accent/90"
          >
            {source === "physical_menu"
              ? "Confirm menu · review receipt"
              : "Confirm receipt · compare"}
          </button>
        </div>
      </main>
    </>
  );
}

export default function ReviewExtractionPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-lg px-6 py-16 text-ink/60">Loading…</main>
      }
    >
      <ReviewInner />
    </Suspense>
  );
}
