"use client";

import type { Finding, FindingSeverity } from "@shared/contracts";
import { StatusBadge } from "@/components/StatusBadge";

const severityTone: Record<
  FindingSeverity,
  "difference" | "review" | "info"
> = {
  difference: "difference",
  review: "review",
  info: "info",
};

type FindingsListProps = {
  findings: Finding[];
  onMarkExplained?: (id: string) => void;
  explainedIds?: Set<string>;
};

export function FindingsList({
  findings,
  onMarkExplained,
  explainedIds,
}: FindingsListProps) {
  return (
    <ul className="space-y-4">
      {findings.map((finding) => {
        const explained = explainedIds?.has(finding.id);
        const passes = finding.passes === true;

        return (
          <li
            key={finding.id}
            className={`rounded border bg-white p-4 ${
              passes
                ? "border-verified/30"
                : finding.severity === "difference"
                  ? "border-difference/25"
                  : finding.severity === "review"
                    ? "border-review/25"
                    : "border-ink/10"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {passes ? (
                  <StatusBadge tone="verified">Passes</StatusBadge>
                ) : (
                  <StatusBadge tone={severityTone[finding.severity]}>
                    {finding.severity}
                  </StatusBadge>
                )}
                <span className="font-mono text-xs text-ink/40">
                  {finding.comparison.replaceAll("_", " ")}
                </span>
              </div>
              {onMarkExplained && !passes ? (
                <button
                  type="button"
                  onClick={() => onMarkExplained(finding.id)}
                  className="text-xs text-ink/50 underline-offset-2 hover:text-ink hover:underline"
                >
                  {explained ? "Marked explained" : "Mark explained"}
                </button>
              ) : null}
            </div>

            <h3
              className={`mt-2 font-medium ${explained ? "text-ink/45 line-through" : "text-ink"}`}
            >
              {finding.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-ink/70">
              {finding.detail}
            </p>

            {(finding.expected || finding.observed) && (
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                {finding.expected ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/45">
                      Expected
                    </dt>
                    <dd className="mt-0.5 font-medium text-ink">
                      {finding.expected}
                    </dd>
                  </div>
                ) : null}
                {finding.observed ? (
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-ink/45">
                      Observed
                    </dt>
                    <dd className="mt-0.5 font-medium text-ink">
                      {finding.observed}
                    </dd>
                  </div>
                ) : null}
              </dl>
            )}
          </li>
        );
      })}
    </ul>
  );
}
