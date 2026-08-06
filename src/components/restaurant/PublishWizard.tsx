"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import type {
  FeeDisclosure,
  FeeKind,
  MenuExtractResult,
  MenuItem,
  MenuPublishDraft,
  MenuTemplateId,
  PublishResult,
} from "@shared/contracts";
import { PaperMenu, TEMPLATE_META } from "@/components/menu-templates";
import {
  centsToDollarsInput,
  dollarsToCents,
  draftToCanonical,
  emptyFee,
  FEE_KIND_OPTIONS,
  itemsFromExtract,
  slugifyRestaurantId,
} from "@/lib/menu-draft";

type Step = "capture" | "review" | "template" | "preview" | "done";

type Props = {
  initialName?: string;
};

export function PublishWizard({ initialName = "" }: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [restaurantName, setRestaurantName] = useState(initialName);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [fees, setFees] = useState<FeeDisclosure[]>([emptyFee()]);
  const [templateId, setTemplateId] =
    useState<MenuTemplateId>("classic_single");
  const [extractSource, setExtractSource] = useState<"vision" | "fixture" | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishResult | null>(
    null,
  );
  const [pending, startTransition] = useTransition();

  const draft: MenuPublishDraft = {
    restaurantName,
    items,
    feeDisclosures: fees,
    templateId,
  };

  const restaurantId = slugifyRestaurantId(restaurantName || "restaurant");
  const previewMenu = draftToCanonical(draft, restaurantId);

  async function runExtract(file: File) {
    setError(null);
    const form = new FormData();
    form.append("image", file);
    const res = await fetch("/api/menus/extract", {
      method: "POST",
      body: form,
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error || "Extraction failed");
    }
    const data = (await res.json()) as MenuExtractResult;
    setItems(itemsFromExtract(data));
    setFees(
      data.feeDisclosures.length > 0 ? data.feeDisclosures : [emptyFee()],
    );
    if (data.restaurantNameGuess && !restaurantName.trim()) {
      setRestaurantName(data.restaurantNameGuess);
    }
    setExtractSource(data.source);
    setStep("review");
  }

  function onFileChange(file: File | null) {
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    startTransition(() => {
      void runExtract(file).catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Extraction failed");
      });
    });
  }

  function updateItem(index: number, patch: Partial<MenuItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      {
        id: `itm_new_${Date.now()}`,
        section: "Menu",
        name: "",
        priceCents: 0,
      },
    ]);
  }

  function updateFee(index: number, patch: Partial<FeeDisclosure>) {
    setFees((prev) =>
      prev.map((fee, i) => (i === index ? { ...fee, ...patch } : fee)),
    );
  }

  async function publish() {
    setError(null);
    if (!restaurantName.trim()) {
      setError("Restaurant name is required");
      return;
    }
    if (items.length === 0 || items.some((i) => !i.name.trim())) {
      setError("Add at least one named menu item");
      return;
    }

    const menu = draftToCanonical(draft, restaurantId);
    const res = await fetch("/api/menus/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(menu),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: string;
      } | null;
      throw new Error(body?.error || "Publish failed");
    }
    const result = (await res.json()) as PublishResult;
    setPublishResult(result);
    setStep("done");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
        Restaurant publish
      </p>
      <h1 className="mt-2 font-menu text-3xl text-ink sm:text-4xl">
        Photograph your menu
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink/65">
        We extract items and prices, you confirm them, then pick a printed-page
        layout — not a delivery-app feed.
      </p>

      <ol className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-ink/50">
        {(
          [
            ["capture", "1. Photo"],
            ["review", "2. Review"],
            ["template", "3. Layout"],
            ["preview", "4. Preview"],
            ["done", "5. Sealed"],
          ] as const
        ).map(([id, label]) => (
          <li
            key={id}
            className={
              step === id ? "text-accent" : stepOrder(step) > stepOrder(id) ? "text-ink/80" : ""
            }
          >
            {label}
          </li>
        ))}
      </ol>

      {error ? (
        <p className="mt-4 rounded-md border border-difference/30 bg-difference/5 px-3 py-2 text-sm text-difference">
          {error}
        </p>
      ) : null}

      {step === "capture" ? (
        <section className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-ink">
            Restaurant name
            <input
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-ink"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
              placeholder="Coral & Key"
            />
          </label>

          <div className="rounded-md border border-dashed border-ink/25 bg-white/60 px-4 py-10 text-center">
            <p className="text-sm text-ink/70">
              Take a photo or upload a clear image of your printed menu.
            </p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="mt-4 block w-full text-sm"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
            {pending ? (
              <p className="mt-3 text-sm text-accent">Reading menu…</p>
            ) : null}
          </div>

          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt="Uploaded menu"
              className="mx-auto max-h-64 rounded-md border border-ink/10 object-contain"
            />
          ) : null}
        </section>
      ) : null}

      {step === "review" ? (
        <section className="mt-8 space-y-6">
          {extractSource === "fixture" ? (
            <p className="text-xs text-review">
              Using demo extract (no OPENAI_API_KEY). Edit freely before
              publishing.
            </p>
          ) : extractSource === "vision" ? (
            <p className="text-xs text-verified">Extracted with vision model.</p>
          ) : null}

          <label className="block text-sm font-medium">
            Restaurant name
            <input
              className="mt-1 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
              value={restaurantName}
              onChange={(e) => setRestaurantName(e.target.value)}
            />
          </label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Items</h2>
              <button
                type="button"
                className="text-sm text-accent"
                onClick={addItem}
              >
                Add item
              </button>
            </div>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="grid gap-2 rounded-md border border-ink/10 bg-white p-3 sm:grid-cols-12"
              >
                <input
                  className="rounded border border-ink/10 px-2 py-1.5 text-sm sm:col-span-3"
                  placeholder="Section"
                  value={item.section}
                  onChange={(e) =>
                    updateItem(index, { section: e.target.value })
                  }
                />
                <input
                  className="rounded border border-ink/10 px-2 py-1.5 text-sm sm:col-span-4"
                  placeholder="Name"
                  value={item.name}
                  onChange={(e) => updateItem(index, { name: e.target.value })}
                />
                <input
                  className="rounded border border-ink/10 px-2 py-1.5 text-sm sm:col-span-3"
                  placeholder="Description"
                  value={item.description ?? ""}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                />
                <input
                  className="rounded border border-ink/10 px-2 py-1.5 font-mono text-sm sm:col-span-1"
                  inputMode="decimal"
                  value={centsToDollarsInput(item.priceCents)}
                  onChange={(e) =>
                    updateItem(index, {
                      priceCents: dollarsToCents(e.target.value),
                    })
                  }
                />
                <button
                  type="button"
                  className="text-xs text-difference sm:col-span-1"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Fee disclosures</h2>
              <button
                type="button"
                className="text-sm text-accent"
                onClick={() => setFees((prev) => [...prev, emptyFee()])}
              >
                Add fee
              </button>
            </div>
            {fees.map((fee, index) => (
              <div
                key={index}
                className="grid gap-2 rounded-md border border-ink/10 bg-white p-3 sm:grid-cols-3"
              >
                <select
                  className="rounded border border-ink/10 px-2 py-1.5 text-sm"
                  value={fee.kind}
                  onChange={(e) =>
                    updateFee(index, { kind: e.target.value as FeeKind })
                  }
                >
                  {FEE_KIND_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <input
                  className="rounded border border-ink/10 px-2 py-1.5 text-sm"
                  placeholder="Amount or rate (e.g. 3%)"
                  value={fee.amountOrRate}
                  onChange={(e) =>
                    updateFee(index, { amountOrRate: e.target.value })
                  }
                />
                <input
                  className="rounded border border-ink/10 px-2 py-1.5 text-sm"
                  placeholder="Purpose"
                  value={fee.purpose}
                  onChange={(e) =>
                    updateFee(index, { purpose: e.target.value })
                  }
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-md border border-ink/15 px-4 py-2 text-sm"
              onClick={() => setStep("capture")}
            >
              Back
            </button>
            <button
              type="button"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
              onClick={() => setStep("template")}
            >
              Choose layout
            </button>
          </div>
        </section>
      ) : null}

      {step === "template" ? (
        <section className="mt-8 space-y-4">
          <p className="text-sm text-ink/65">
            Pick a paper-style page. Guests should see the full menu at a glance
            — like a PDF, not a scroll of food cards.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATE_META.map((meta) => (
              <button
                key={meta.id}
                type="button"
                onClick={() => setTemplateId(meta.id)}
                className={`rounded-md border p-4 text-left ${
                  templateId === meta.id
                    ? "border-accent bg-accent/5"
                    : "border-ink/10 bg-white"
                }`}
              >
                <p className="font-menu text-lg">{meta.name}</p>
                <p className="mt-1 text-xs text-ink/60">{meta.blurb}</p>
              </button>
            ))}
          </div>
          <div className="origin-top scale-[0.55] sm:scale-[0.65]">
            <PaperMenu menu={{ ...previewMenu, templateId }} />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-md border border-ink/15 px-4 py-2 text-sm"
              onClick={() => setStep("review")}
            >
              Back
            </button>
            <button
              type="button"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
              onClick={() => setStep("preview")}
            >
              Full preview
            </button>
          </div>
        </section>
      ) : null}

      {step === "preview" ? (
        <section className="mt-8 space-y-6">
          <PaperMenu menu={previewMenu} />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="rounded-md border border-ink/15 px-4 py-2 text-sm"
              onClick={() => setStep("template")}
            >
              Back
            </button>
            <button
              type="button"
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
              disabled={pending}
              onClick={() =>
                startTransition(() => {
                  void publish().catch((err: unknown) => {
                    setError(
                      err instanceof Error ? err.message : "Publish failed",
                    );
                  });
                })
              }
            >
              {pending ? "Publishing…" : "Publish menu"}
            </button>
          </div>
        </section>
      ) : null}

      {step === "done" && publishResult ? (
        <section className="mt-8 space-y-4">
          <p className="text-sm font-medium text-verified">Menu sealed (demo)</p>
          <dl className="space-y-2 rounded-md border border-ink/10 bg-white p-4 font-mono text-xs break-all">
            <div>
              <dt className="text-ink/50">Hash</dt>
              <dd>{publishResult.menuHash}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Signature</dt>
              <dd>{publishResult.signature}</dd>
            </div>
            <div>
              <dt className="text-ink/50">Explorer</dt>
              <dd>
                <a
                  className="text-accent underline"
                  href={publishResult.explorerUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {publishResult.explorerUrl}
                </a>
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3">
            <a
              href={publishResult.publicPath}
              className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white"
            >
              Open public menu
            </a>
            <button
              type="button"
              className="rounded-md border border-ink/15 px-4 py-2 text-sm"
              onClick={() => router.push("/restaurant")}
            >
              Start over
            </button>
          </div>
          <PaperMenu menu={previewMenu} verified />
        </section>
      ) : null}
    </div>
  );
}

function stepOrder(step: Step): number {
  const order: Step[] = ["capture", "review", "template", "preview", "done"];
  return order.indexOf(step);
}
