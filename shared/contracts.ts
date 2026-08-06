/**
 * FeeSeal shared contracts — UI and API agree on these shapes.
 * Diego consumes; Aaroha implements. Change only with both sides agreeing.
 */

export const FEESEAL_DISCLAIMER =
  "FeeSeal identifies observable differences between documents. It does not determine legal liability or provide legal advice.";

export type DietaryTag =
  | "halal"
  | "kosher"
  | "vegetarian"
  | "vegan"
  | "gluten_free";

export type FeeKind =
  | "operations_charge"
  | "automatic_gratuity"
  | "credit_card_surcharge"
  | "other";

export type FeeDisclosure = {
  kind: FeeKind;
  /** e.g. "18%" or "3.00" */
  amountOrRate: string;
  /** required — empty purpose is a finding */
  purpose: string;
};

export type MenuItem = {
  id: string;
  section: string;
  name: string;
  priceCents: number;
  dietaryTags?: DietaryTag[];
};

export type CanonicalMenu = {
  restaurantId: string;
  restaurantName: string;
  version: number;
  /** ISO date-time */
  effectiveFrom: string;
  jurisdiction: "US-FL";
  currency: "USD";
  items: MenuItem[];
  feeDisclosures: FeeDisclosure[];
  /** carve-out — flag excluded, not discrepancy */
  prixFixeNote?: string;
};

export type PublishResult = {
  menuHash: string;
  version: number;
  signature: string;
  explorerUrl: string;
  status: "confirmed" | "pending" | "failed";
};

export type ExtractedLine = {
  name: string;
  priceCents: number;
  confidence?: number;
};

export type ExtractedFee = {
  label: string;
  amountOrRate: string;
  purpose?: string;
};

export type ExtractionDraft = {
  source: "physical_menu" | "receipt";
  lines: ExtractedLine[];
  fees: ExtractedFee[];
  gratuitySeparate?: boolean;
  taxSeparate?: boolean;
  operationsChargeSeparate?: boolean;
  isPrixFixe?: boolean;
};

export type FindingSeverity = "info" | "review" | "difference";

export type FindingComparison =
  | "A_vs_B"
  | "A_vs_C"
  | "B_vs_C"
  | "receipt_layout"
  | "excluded";

export type Finding = {
  id: string;
  comparison: FindingComparison;
  severity: FindingSeverity;
  /** careful language only */
  title: string;
  detail: string;
  itemName?: string;
  expected?: string;
  observed?: string;
  /** true = green check row */
  passes?: boolean;
};

export type ComparisonResult = {
  findings: Finding[];
  /** 0–1 for demo */
  matchRate: number;
  disclaimer: string;
};

export type VerifyResult = {
  ok: boolean;
  expectedHash: string;
  actualHash: string;
  onChainMatch: boolean;
};

export type PublicMenuResponse = {
  menu: CanonicalMenu;
  menuHash: string;
  verified: boolean;
  lastUpdated: string;
  signature?: string;
  explorerUrl?: string;
};

export type CompareRequest = {
  menu: CanonicalMenu;
  physicalMenu: ExtractionDraft;
  receipt: ExtractionDraft;
};
