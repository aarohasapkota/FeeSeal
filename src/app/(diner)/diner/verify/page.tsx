"use client";

import { useRef, useState } from "react";
import publishFixture from "@fixtures/publish.confirmed.json";
import type { VerifyResult } from "@shared/contracts";
import { AppHeader } from "@/components/AppHeader";
import { Disclaimer } from "@/components/Disclaimer";
import { HashDisplay } from "@/components/HashDisplay";
import { StatusBadge } from "@/components/StatusBadge";

export default function VerifyPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [tampered, setTampered] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function verify(file?: File | null) {
    setBusy(true);
    setNote(null);
    try {
      const form = new FormData();
      form.set("kind", "menu");
      form.set("restaurantId", "rst_miami_coral");
      form.set("tampered", tampered ? "true" : "false");
      if (file) form.set("file", file);
      const res = await fetch("/api/verify", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error("verify failed");
      setResult((await res.json()) as VerifyResult);
    } catch {
      const expected = publishFixture.menuHash;
      const actual = tampered
        ? "0000000000000000000000000000000000000000000000000000000000000000"
        : expected;
      setResult({
        ok: !tampered && actual === expected,
        kind: "menu",
        expectedHash: expected,
        actualHash: actual,
        onChainMatch: !tampered,
        cluster: "stub",
      });
      setNote("API unavailable — showing fixture verify result.");
    } finally {
      setBusy(false);
    }
  }

  function onFile(file: File | null) {
    if (!file) return;
    setFileName(file.name);
    void verify(file);
  }

  return (
    <>
      <AppHeader backHref="/diner/findings" backLabel="Findings" />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 pb-16">
        <p className="font-mono text-sm text-accent">Verification</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Check file integrity
        </h1>
        <p className="mt-2 text-ink/65">
          Upload the sealed menu file. A one-pixel edit changes the hash and
          fails the match.
        </p>

        <label className="mt-8 flex cursor-pointer items-start gap-3 rounded border border-ink/10 bg-white p-4">
          <input
            type="checkbox"
            checked={tampered}
            onChange={(e) => {
              setTampered(e.target.checked);
              setResult(null);
            }}
            className="mt-1 accent-accent"
          />
          <span>
            <span className="block font-medium text-ink">
              Simulate modified file
            </span>
            <span className="mt-0.5 block text-sm text-ink/60">
              Demo climax: treat the upload as a one-pixel edit so hashes
              diverge.
            </span>
          </span>
        </label>

        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
        />

        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="rounded-md bg-accent px-5 py-3.5 font-medium text-white hover:bg-accent/90 disabled:opacity-50"
          >
            {busy ? "Checking…" : "Upload file to verify"}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setFileName(tampered ? "menu.v1.modified.json" : "menu.v1.json");
              void verify();
            }}
            className="rounded-md border border-ink/15 bg-white px-5 py-3.5 font-medium text-ink hover:border-ink/30 disabled:opacity-50"
          >
            Run demo verify
          </button>
        </div>

        {fileName ? (
          <p className="mt-4 text-sm text-ink/55">File: {fileName}</p>
        ) : null}
        {note ? <p className="mt-2 text-sm text-review">{note}</p> : null}

        {result ? (
          <section className="mt-8 space-y-4 rounded border border-ink/10 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              {result.ok ? (
                <StatusBadge tone="verified">Match</StatusBadge>
              ) : (
                <StatusBadge tone="difference">Mismatch</StatusBadge>
              )}
              <StatusBadge
                tone={result.onChainMatch ? "verified" : "difference"}
              >
                {result.onChainMatch
                  ? "On-chain match"
                  : "On-chain mismatch"}
              </StatusBadge>
            </div>
            <HashDisplay hash={result.expectedHash} label="Expected hash" />
            <HashDisplay hash={result.actualHash} label="Actual hash" />
            <p className="text-sm text-ink/65">
              {result.ok
                ? "The file matches the sealed menu hash."
                : "Potential discrepancy — the file hash does not match the sealed record. Review recommended."}
            </p>
          </section>
        ) : null}

        <Disclaimer className="mt-10" />
      </main>
    </>
  );
}
