# FeeSeal

The menu price is the bill price. Verified.

Digital menu platform: restaurants publish prices and fee disclosures; FeeSeal seals a menu hash on Solana (Memo Program). Diners check the physical menu and receipt against the published record.

## Team split

| Person | Branch | Owns |
|---|---|---|
| Aaroha | `aaroha/backend` | API, hash, Solana, vision, compare |
| Diego | `diego/ui` | Screens, components, design |

See [COWORKER_HANDOFF.md](./COWORKER_HANDOFF.md), [prd.md](./prd.md), and [CODING_STANDARDS.md](./CODING_STANDARDS.md).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Shared contracts & fixtures

- `shared/contracts.ts` — typed API shapes
- `fixtures/` — demo menu, extractions, findings, publish confirmation

## API (fixture-backed / partial real)

| Method | Path |
|---|---|
| `GET` | `/api/restaurants/:id/menu` (`demo`, `rst_miami_coral`, or published id) |
| `POST` | `/api/menus/extract` (multipart `image`) |
| `POST` | `/api/menus/publish` (SHA-256 + Solana Memo; `cluster` stub\|devnet) |
| `POST` | `/api/evidence/seal` (diner fileHash + analysisHash memo) |
| `GET` | `/api/evidence/:recordId` |
| `POST` | `/api/scans/extract` |
| `POST` | `/api/scans/compare` (deterministic A/B/C in `src/lib/compare`) |
| `POST` | `/api/verify` (`kind`: menu \| evidence_file \| evidence_analysis) |

Restaurant UI is Diego’s. Backend publish + evidence seal + compare APIs are ready; temporary `/restaurant/publish` is only for exercising them. Public API shape for menus: `/m/[id]` once UI lands (demo data via `GET /api/restaurants/demo/menu`).

`src/lib/solana` uses QuickNode + Memo Program when env is set; otherwise deterministic stub seals. Hash, vision (with fixture fallback), and compare are implemented.

## Env

Copy `.env.example` → `.env.local` when wiring QuickNode / vision.
