"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import menuFixture from "@fixtures/menu.v1.json";
import extractionMenu from "@fixtures/extraction.menu.json";
import extractionReceipt from "@fixtures/extraction.receipt.json";
import type { CanonicalMenu, ExtractionDraft } from "@shared/contracts";
import { AppHeader } from "@/components/AppHeader";
import { ScanGuide } from "@/components/ScanGuide";
import { saveDemoState, useDemoState } from "@/lib/demo-state";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function ScanCapturePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const demo = useDemoState();
  const step: "physical_menu" | "receipt" =
    demo.scanStep === "receipt" && demo.physicalMenu
      ? "receipt"
      : "physical_menu";
  const [busy, setBusy] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const preview =
    localPreview ??
    (step === "receipt" ? demo.receiptImageDataUrl : demo.menuImageDataUrl);

  async function extract(source: ExtractionDraft["source"], file?: File) {
    setBusy(true);
    setError(null);
    try {
      let draft: ExtractionDraft;
      if (file) {
        const form = new FormData();
        form.set("source", source);
        form.set("image", file);
        const res = await fetch("/api/scans/extract", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("extract failed");
        draft = (await res.json()) as ExtractionDraft;
      } else {
        const res = await fetch("/api/scans/extract", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ source }),
        });
        if (!res.ok) throw new Error("extract failed");
        draft = (await res.json()) as ExtractionDraft;
      }
      return draft;
    } catch {
      setError("Using fixture extraction for demo.");
      return (
        source === "receipt" ? extractionReceipt : extractionMenu
      ) as ExtractionDraft;
    } finally {
      setBusy(false);
    }
  }

  async function onFileChange(file: File | null) {
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setLocalPreview(dataUrl);
    const draft = await extract(step, file);
    const menu = (demo.menu ?? menuFixture) as CanonicalMenu;

    if (step === "physical_menu") {
      saveDemoState({
        menu,
        restaurantId: menu.restaurantId,
        physicalMenu: draft,
        menuImageDataUrl: dataUrl,
        scanStep: "receipt",
        comparison: null,
      });
      setLocalPreview(null);
      router.push("/diner/review?source=physical_menu");
    } else {
      saveDemoState({
        receipt: draft,
        receiptImageDataUrl: dataUrl,
        scanStep: "receipt",
        comparison: null,
      });
      router.push("/diner/review?source=receipt");
    }
  }

  async function runDemoCapture() {
    const draft = await extract(step);
    const menu = (demo.menu ?? menuFixture) as CanonicalMenu;
    const placeholder =
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="560" fill="%23f8fafc"><rect width="100%" height="100%" fill="%23f8fafc"/><rect x="24" y="24" width="352" height="512" fill="none" stroke="%230f766e" stroke-dasharray="8 6"/><text x="50%" y="50%" text-anchor="middle" fill="%230f172a" font-family="sans-serif" font-size="18">${step === "physical_menu" ? "Demo menu photo" : "Demo receipt photo"}</text></svg>`,
      );

    if (step === "physical_menu") {
      saveDemoState({
        menu,
        restaurantId: menu.restaurantId,
        physicalMenu: draft,
        menuImageDataUrl: placeholder,
        scanStep: "receipt",
        comparison: null,
      });
      setLocalPreview(null);
      router.push("/diner/review?source=physical_menu");
    } else {
      saveDemoState({
        receipt: draft,
        receiptImageDataUrl: placeholder,
        comparison: null,
      });
      router.push("/diner/review?source=receipt");
    }
  }

  return (
    <>
      <AppHeader backHref="/diner" backLabel="Diner" />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 pb-16">
        <p className="font-mono text-sm text-accent">
          Scan · {step === "physical_menu" ? "1 of 2 · Menu" : "2 of 2 · Receipt"}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          {step === "physical_menu" ? "Capture the menu" : "Capture the receipt"}
        </h1>
        <p className="mt-2 text-ink/65">
          Photos stay on this device for the demo. You&apos;ll confirm extracted
          fields before any comparison.
        </p>

        <div className="mt-8">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Capture preview"
              className="aspect-[3/4] w-full rounded border border-ink/10 object-cover"
            />
          ) : (
            <ScanGuide source={step} />
          )}
        </div>

        {error ? <p className="mt-4 text-sm text-review">{error}</p> : null}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => void onFileChange(e.target.files?.[0] ?? null)}
        />

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-accent px-5 py-3.5 font-medium text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {busy ? "Extracting…" : "Take or upload photo"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void runDemoCapture()}
            className="rounded-md border border-ink/15 bg-white px-5 py-3.5 font-medium text-ink hover:border-ink/30 disabled:opacity-50"
          >
            Use demo capture
          </button>
        </div>
      </main>
    </>
  );
}
