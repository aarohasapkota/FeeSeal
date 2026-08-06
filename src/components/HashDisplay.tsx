"use client";

import { useState } from "react";
import { truncateHash } from "@/lib/format";

type HashDisplayProps = {
  hash: string;
  label?: string;
};

export function HashDisplay({ hash, label = "Hash" }: HashDisplayProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/50">
        {label}
      </p>
      <button
        type="button"
        onClick={copy}
        title="Copy full hash"
        className="block w-full rounded border border-ink/10 bg-white px-3 py-2 text-left font-mono text-sm text-ink break-all hover:border-accent/40"
      >
        <span className="sm:hidden">{truncateHash(hash)}</span>
        <span className="hidden sm:inline">{hash}</span>
        <span className="mt-1 block text-xs text-ink/40">
          {copied ? "Copied" : "Tap to copy"}
        </span>
      </button>
    </div>
  );
}
