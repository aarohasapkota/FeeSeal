"use client";

import type { ExtractedFee, ExtractedLine, ExtractionDraft } from "@shared/contracts";
import { formatCents } from "@/lib/format";

type ExtractionEditorProps = {
  draft: ExtractionDraft;
  onChange: (next: ExtractionDraft) => void;
};

export function ExtractionEditor({ draft, onChange }: ExtractionEditorProps) {
  function updateLine(index: number, patch: Partial<ExtractedLine>) {
    const lines = draft.lines.map((line, i) =>
      i === index ? { ...line, ...patch } : line,
    );
    onChange({ ...draft, lines });
  }

  function updateFee(index: number, patch: Partial<ExtractedFee>) {
    const fees = draft.fees.map((fee, i) =>
      i === index ? { ...fee, ...patch } : fee,
    );
    onChange({ ...draft, fees });
  }

  function removeLine(index: number) {
    onChange({ ...draft, lines: draft.lines.filter((_, i) => i !== index) });
  }

  function addLine() {
    onChange({
      ...draft,
      lines: [...draft.lines, { name: "", priceCents: 0 }],
    });
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
            Line items
          </h2>
          <button
            type="button"
            onClick={addLine}
            className="text-sm text-accent hover:underline"
          >
            Add line
          </button>
        </div>
        <ul className="space-y-3">
          {draft.lines.map((line, index) => (
            <li
              key={`line-${index}`}
              className="grid grid-cols-[1fr_7rem_auto] gap-2 sm:grid-cols-[1fr_8rem_auto]"
            >
              <input
                aria-label={`Item name ${index + 1}`}
                value={line.name}
                onChange={(e) => updateLine(index, { name: e.target.value })}
                className="rounded border border-ink/15 bg-white px-3 py-2 text-ink outline-none focus:border-accent"
                placeholder="Item name"
              />
              <input
                aria-label={`Price ${index + 1}`}
                type="number"
                step="0.01"
                min="0"
                value={(line.priceCents / 100).toFixed(2)}
                onChange={(e) => {
                  const dollars = Number.parseFloat(e.target.value);
                  updateLine(index, {
                    priceCents: Number.isFinite(dollars)
                      ? Math.round(dollars * 100)
                      : 0,
                  });
                }}
                className="rounded border border-ink/15 bg-white px-3 py-2 font-mono text-ink outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="px-2 text-sm text-ink/40 hover:text-difference"
                aria-label={`Remove ${line.name || `line ${index + 1}`}`}
              >
                ×
              </button>
              {typeof line.confidence === "number" ? (
                <p className="col-span-full text-xs text-ink/40">
                  Model confidence {(line.confidence * 100).toFixed(0)}% · shown
                  as {formatCents(line.priceCents)}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Fees
        </h2>
        {draft.fees.length === 0 ? (
          <p className="text-sm text-ink/60">No fees extracted.</p>
        ) : (
          <ul className="space-y-3">
            {draft.fees.map((fee, index) => (
              <li key={`fee-${index}`} className="space-y-2 rounded border border-ink/10 bg-white p-3">
                <input
                  aria-label={`Fee label ${index + 1}`}
                  value={fee.label}
                  onChange={(e) => updateFee(index, { label: e.target.value })}
                  className="w-full rounded border border-ink/15 px-3 py-2 outline-none focus:border-accent"
                  placeholder="Fee label"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    aria-label={`Fee amount ${index + 1}`}
                    value={fee.amountOrRate}
                    onChange={(e) =>
                      updateFee(index, { amountOrRate: e.target.value })
                    }
                    className="rounded border border-ink/15 px-3 py-2 font-mono outline-none focus:border-accent"
                    placeholder="18% or 3.00"
                  />
                  <input
                    aria-label={`Fee purpose ${index + 1}`}
                    value={fee.purpose ?? ""}
                    onChange={(e) =>
                      updateFee(index, { purpose: e.target.value })
                    }
                    className="rounded border border-ink/15 px-3 py-2 outline-none focus:border-accent"
                    placeholder="Purpose"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
