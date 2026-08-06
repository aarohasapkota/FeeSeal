# FeeSeal

The menu price is the bill price. Verified.

Digital menu platform: restaurants publish prices and fee disclosures; FeeSeal seals a menu hash on Solana (Memo Program). Diners check the physical menu and receipt against the published record.

## Team split

| Person | Branch | Owns |
|---|---|---|
| Aaroha | `aaroha/backend` | API, hash, Solana, vision, compare |
| Diego | `diego/ui` | Screens, components, design |

See [COWORKER_HANDOFF.md](./COWORKER_HANDOFF.md) and [prd.md](./prd.md).

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Shared contracts & fixtures

- `shared/contracts.ts` — typed API shapes
- `fixtures/` — demo menu, extractions, findings, publish confirmation

## API (fixture-backed tonight)

| Method | Path |
|---|---|
| `GET` | `/api/restaurants/:id/menu` (`demo` or `rst_miami_coral`) |
| `POST` | `/api/menus/publish` |
| `POST` | `/api/scans/extract` |
| `POST` | `/api/scans/compare` |
| `POST` | `/api/verify` |

Real implementations land in `src/lib/{hash,solana,vision,compare}`.

## Env

Copy `.env.example` → `.env.local` when wiring QuickNode / vision.
