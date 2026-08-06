import type {
  CanonicalMenu,
  ComparisonResult,
  ExtractionDraft,
} from "@shared/contracts";

/** Deterministic A/B/C comparison. No LLM arithmetic. */
export function compareSources(_args: {
  menu: CanonicalMenu;
  physicalMenu: ExtractionDraft;
  receipt: ExtractionDraft;
}): ComparisonResult {
  throw new Error("lib/compare not implemented — use fixtures for now");
}
