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

/** Printed-menu layout (not delivery-app card UI). */
export type MenuTemplateId =
  | "classic_single"
  | "bistro_two_column"
  | "evening_dense";

export const MENU_TEMPLATE_IDS: MenuTemplateId[] = [
  "classic_single",
  "bistro_two_column",
  "evening_dense",
];

export type MenuItem = {
  id: string;
  section: string;
  name: string;
  priceCents: number;
  description?: string;
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
  templateId: MenuTemplateId;
  /** carve-out — flag excluded, not discrepancy */
  prixFixeNote?: string;
};

/** Editable post-extract state before seal. */
export type MenuPublishDraft = {
  restaurantName: string;
  items: MenuItem[];
  feeDisclosures: FeeDisclosure[];
  templateId: MenuTemplateId;
  prixFixeNote?: string;
};

export type MenuExtractItem = {
  section: string;
  name: string;
  priceCents: number;
  description?: string;
  confidence?: number;
};

export type MenuExtractResult = {
  restaurantNameGuess?: string;
  items: MenuExtractItem[];
  feeDisclosures: FeeDisclosure[];
  source: "vision" | "fixture";
};

export type SealCluster = "devnet" | "stub";

export type PublishResult = {
  menuHash: string;
  version: number;
  signature: string;
  explorerUrl: string;
  status: "confirmed" | "pending" | "failed";
  restaurantId: string;
  publicPath: string;
  /** stub = local fake seal when QuickNode/signer env missing */
  cluster: SealCluster;
};

/**
 * Diner evidence seal — fingerprints only on-chain (not the image).
 * fileHash = SHA-256 of the captured image bytes
 * analysisHash = SHA-256 of customer-confirmed extraction JSON
 */
export type EvidenceSource = "physical_menu" | "receipt";

export type EvidenceSealRequest = {
  restaurantId: string;
  source: EvidenceSource;
  /** SHA-256 hex of image bytes; optional if multipart file provided */
  fileHash?: string;
  /** Customer-confirmed extraction / structured analysis */
  analysis: ExtractionDraft | Record<string, unknown>;
  /** Optional client-supplied record id; server mints FS-… if omitted */
  recordId?: string;
};

export type EvidenceSealResult = {
  recordId: string;
  restaurantId: string;
  source: EvidenceSource;
  fileHash: string;
  analysisHash: string;
  signature: string;
  explorerUrl: string;
  status: "confirmed" | "pending" | "failed";
  cluster: SealCluster;
  sealedAt: string;
};

export type VerifyKind = "menu" | "evidence_file" | "evidence_analysis";

export type VerifyRequest = {
  kind?: VerifyKind;
  restaurantId?: string;
  recordId?: string;
  /** Hash to check (menu hash, file hash, or analysis hash depending on kind) */
  hash?: string;
  /** Demo helper: force mismatch without supplying a wrong hash */
  tampered?: boolean;
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
  kind: VerifyKind;
  expectedHash: string;
  actualHash: string;
  /** True when expected hash matches the sealed fingerprint we stored (and stub/devnet memo). */
  onChainMatch: boolean;
  recordId?: string;
  signature?: string;
  explorerUrl?: string;
  cluster?: SealCluster;
};

export type PublicMenuResponse = {
  menu: CanonicalMenu;
  menuHash: string;
  verified: boolean;
  lastUpdated: string;
  templateId: MenuTemplateId;
  signature?: string;
  explorerUrl?: string;
};

export type CompareRequest = {
  menu: CanonicalMenu;
  physicalMenu: ExtractionDraft;
  receipt: ExtractionDraft;
};
