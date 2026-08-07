# FeeSeal — Coworker Handoff (Diego / UI)

**Full-stack on `aaroha/backend`:** Diego’s UI is merged here. Ship from this branch.

**Run locally on port 8080:**

```bash
git checkout aaroha/backend && git pull
npm install
npm run dev
```

Open http://localhost:8080

**Style:** follow [CODING_STANDARDS.md](./CODING_STANDARDS.md) (Doug Lea–style rules adapted for TypeScript / Next.js / React).

---

## What the product is (one paragraph)

FeeSeal proves that the **published menu (A)**, the **physical menu photo (B)**, and the **bill/receipt photo (C)** agree. Restaurants publish prices + fee disclosures; we hash the canonical menu and commit that hash to Solana (Memo Program). Diners scan menu + receipt, extract values with a vision model, then run **deterministic** A/B/C comparison. Language must stay careful: “potential discrepancy,” never “illegal / fraud / sue.”

---

## Your lane tonight (P0 UI)

**You own all screens and UX.** Aaroha owns APIs, contracts, fixtures, and `src/lib/**`. A temporary publish wizard exists only so backend can be exercised — **replace it with your UI**; call the same endpoints and types.

### Backend ready for you (Aaroha) — wire your UI to these

Restaurant publish (photo → extract → choose paper layout → seal Source A):

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/menus/extract` | multipart field `image` → `MenuExtractResult` |
| `POST` | `/api/menus/publish` | body `CanonicalMenu` → SHA-256 + Solana Memo (`cluster: "devnet"` or `"stub"`) |
| `GET` | `/api/restaurants/:id/menu` | public record; try `demo` |

Diner evidence seal (integrity fingerprints — not the comparison itself):

| Method | Path | Notes |
|---|---|---|
| `POST` | `/api/evidence/seal` | JSON or multipart: `restaurantId`, `source`, `analysis`, + `file`/`fileHash` → `fileHash` + `analysisHash` memo |
| `GET` | `/api/evidence/:recordId` | lookup sealed evidence (`FS-…`) |
| `POST` | `/api/verify` | `kind`: `menu` \| `evidence_file` \| `evidence_analysis`; pass `hash` / file or `tampered: true` for demo mismatch |

- Types: `EvidenceSealRequest`, `EvidenceSealResult`, `VerifyResult`, `PublishResult.cluster`
- Solana: Memo Program via QuickNode when `QUICKNODE_SOLANA_RPC` + `FEESEAL_SIGNER_SECRET` set; otherwise deterministic **stub** seal (demo still works)
- On-chain = fingerprints only; full menu / photos stay off-chain
- Paper layout ids: `classic_single` \| `bistro_two_column` \| `evening_dense`
- Temporary reference only: `/restaurant/publish` — replace with your UX

### Screens you should build (demo order)

1. **Landing** — two doors: diner / restaurant
2. **Restaurant publish** — photo capture, editable extract, template picker, preview, publish confirmation (hash + explorer link)
3. **Public menu page** — verified badge, version, fee disclosure, QR placeholder; paper-style page not a delivery feed
4. **Scan capture** — framing/glare guidance (menu, then receipt); call `POST /api/scans/extract`, then `POST /api/evidence/seal` after customer confirms extraction
5. **Review extraction** — image beside **editable** extracted fields
6. **Findings** — call `POST /api/scans/compare` with A + edited B + edited C; show disclaimer from response
7. **Verification** — `POST /api/verify` with `kind: evidence_file` (original vs modified image) or `menu`

### Look (from PRD — stick to this)

| Token | Value |
|---|---|
| Ink | `#0F172A` |
| Surface | `#F8FAFC` |
| Accent | `#0F766E` |
| Verified | `#15803D` |
| Review | `#B45309` |
| Difference | `#B91C1C` |

Inter or Geist. 16px min on mobile. Monospace for hashes. Trust product, not crypto lobby / coupon app. No gavels or scales.

### Hard copy rules

Always show on Findings (and anywhere we imply compliance):

> FeeSeal identifies observable differences between documents. It does not determine legal liability or provide legal advice.

Never say: illegal fee, fraud, violation, you can sue.  
Do say: potential discrepancy, no matching disclosure found, review recommended.

---

## Branch / merge rules (avoid fights)

1. **You:** `git checkout -b diego/ui` from latest `main`.  
2. **Aaroha:** `aaroha/backend`.  
3. **Shared contract file** lives at `shared/contracts.ts` (or `packages/shared` if we scaffold a monorepo). Prefer: Aaroha lands types + fixture JSON first; you consume them. If you need a type sooner, open a tiny PR to `main` with **types + fixtures only**, then both rebase.  
4. Do **not** both create Next.js app scaffolds on different branches without agreeing first. Suggested default: **one Next.js app**, Diego owns `app/` pages & components, Aaroha owns `app/api/`, `lib/server/`, `lib/solana/`, `lib/compare/`.  
5. Before big merges: rebase onto `main`, resolve only in your owned paths.  
6. Push your branch early so the other person can peek without merging.

```bash
# Diego start
git fetch origin
git checkout main && git pull
git checkout -b diego/ui
```

---

## Suggested app ownership

| Path | Owner |
|---|---|
| `app/(marketing)/`, `app/(diner)/`, `app/(restaurant)/`, `components/` | Diego |
| `app/api/**`, `lib/solana/`, `lib/compare/`, `lib/vision/`, `lib/hash/` | Aaroha |
| `shared/contracts.ts`, `fixtures/**` | Shared — Aaroha authors, Diego consumes |
| Design tokens / `globals.css` | Diego |

---

## Contracts you should build UI against

Backend will implement these. Treat as frozen for tonight unless both agree.

### Canonical menu (Source A — off-chain payload that gets hashed)

```ts
type FeeDisclosure = {
  kind: "operations_charge" | "automatic_gratuity" | "credit_card_surcharge" | "other";
  amountOrRate: string; // e.g. "18%" or "3.00"
  purpose: string;      // required — empty purpose = finding
};

type MenuItem = {
  id: string;
  section: string;
  name: string;
  priceCents: number;
  dietaryTags?: ("halal" | "kosher" | "vegetarian" | "vegan" | "gluten_free")[];
};

type CanonicalMenu = {
  restaurantId: string;
  restaurantName: string;
  version: number;
  effectiveFrom: string; // ISO
  jurisdiction: "US-FL";
  currency: "USD";
  items: MenuItem[];
  feeDisclosures: FeeDisclosure[];
  prixFixeNote?: string; // carve-out — flag excluded, not discrepancy
};
```

### Publish response

```ts
type PublishResult = {
  menuHash: string;       // sha256 of canonical JSON (canonicalized)
  version: number;
  signature: string;      // Solana tx sig
  explorerUrl: string;
  status: "confirmed" | "pending" | "failed";
};
```

### Extraction (Sources B / C — editable before compare)

```ts
type ExtractedLine = {
  name: string;
  priceCents: number;
  confidence?: number;
};

type ExtractedFee = {
  label: string;
  amountOrRate: string;
  purpose?: string;
};

type ExtractionDraft = {
  source: "physical_menu" | "receipt";
  lines: ExtractedLine[];
  fees: ExtractedFee[];
  gratuitySeparate?: boolean;
  taxSeparate?: boolean;
  operationsChargeSeparate?: boolean;
  isPrixFixe?: boolean;
};
```

### Findings

```ts
type FindingSeverity = "info" | "review" | "difference";

type Finding = {
  id: string;
  comparison: "A_vs_B" | "A_vs_C" | "B_vs_C" | "receipt_layout" | "excluded";
  severity: FindingSeverity;
  title: string;          // careful language
  detail: string;
  itemName?: string;
  expected?: string;
  observed?: string;
  passes?: boolean;       // true = green check row
};

type ComparisonResult = {
  findings: Finding[];
  matchRate: number;      // 0–1 for demo
  disclaimer: string;     // fixed PRD disclaimer
};
```

### Verify integrity

```ts
type VerifyResult = {
  ok: boolean;
  expectedHash: string;
  actualHash: string;
  onChainMatch: boolean;
};
```

---

## Fixture files (request these from Aaroha / use stubs)

Put under `fixtures/` so UI works offline:

- `menu.v1.json` — published Source A  
- `extraction.menu.json` — OCR draft for B (slightly stale price on one item)  
- `extraction.receipt.json` — OCR draft for C (fee without disclosure + one matching item + separate tax line that **passes**)  
- `findings.demo.json` — expected A/B/C findings for the climax  
- `publish.confirmed.json` — fake tx + explorer URL for UI before chain is live  

Demo climax to design for: **three sources → three findings → one pass → one-pixel edit fails verification.**

---

## API surface (stub with MSW / Next route mocks until ready)

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/restaurants/:id/menu` | Public menu + version + verified badge data |
| `POST` | `/api/menus/publish` | Body: `CanonicalMenu` → `PublishResult` |
| `POST` | `/api/scans/extract` | multipart image + `source` → `ExtractionDraft` |
| `POST` | `/api/scans/compare` | A + edited B + edited C → `ComparisonResult` |
| `POST` | `/api/verify` | file or hash → `VerifyResult` |

Until routes exist: import fixtures directly in pages. Swap to `fetch` with the same types — no UI rewrite.

---

## What you should **not** build tonight

- Real auth / restaurant accounts  
- Map, heat map, reservations, payments, reviews, trust score UI beyond a static placeholder  
- Custom Solana program UI / wallet connect theater beyond “published / explorer link”  
- Worst-offender lists or legal-looking badges  

---

## Sync points with Aaroha

1. **Now:** agree Next.js app scaffold owner (prefer one app, split folders).  
2. **+30 min:** fixtures + `shared/contracts.ts` on `main` or Aaroha pushes types you can copy.  
3. **Midpoint:** wire Findings to live `/api/scans/compare` when ready; keep fixture fallback.  
4. **Before deploy:** one deployed URL; phone-test public menu + findings.  

---

## Deploy note

Target: one public URL that works on someone else’s phone. Prefer Vercel for the Next app. Env vars for QuickNode / vision stay on Aaroha’s side — you only need public `NEXT_PUBLIC_` explorer base URL if any.

---

## Questions — ping Aaroha, don’t guess

- Who scaffolds the Next.js repo?  
- Wallet: FeeSeal delegated key vs restaurant wallet (PRD open Q1)?  
- Vision provider for extract (affects upload size / loading UX)?  

---

*Handoff for Cursor Miami Ship Night — FeeSeal. Keep the vertical slice: publish → seal → public menu → extract → compare → verify.*
