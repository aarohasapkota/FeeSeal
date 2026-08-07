# FeeSeal

The menu price is the bill price. Verified.

## Run on localhost:8080 (Diego)

```bash
git fetch origin
git checkout aaroha/backend
git pull origin aaroha/backend
npm install
cp .env.example .env.local   # optional — works without keys (Solana stub)
npm run dev
```

Open **http://localhost:8080**

Production-style local serve:

```bash
npm run build
npm start
```

Also listens on `0.0.0.0:8080` so a phone on the same Wi‑Fi can use `http://<your-lan-ip>:8080`.

### Demo path
1. `/` → Restaurant → Publish & seal → public menu  
2. `/diner` → scan (demo capture) → review → findings → verify (toggle tampered for mismatch)

## Env

Copy `.env.example` → `.env.local`. Defaults assume `http://localhost:8080`.

Optional for live Solana Devnet Memo:
- `QUICKNODE_SOLANA_RPC`
- `FEESEAL_SIGNER_SECRET`

Optional for live vision extract:
- `OPENAI_API_KEY`

Without those, fixtures + stub seals still run the full demo.

## Docs

[prd.md](./prd.md) · [COWORKER_HANDOFF.md](./COWORKER_HANDOFF.md) · [CODING_STANDARDS.md](./CODING_STANDARDS.md)

## API

| Method | Path |
|---|---|
| `GET` | `/api/restaurants/:id/menu` |
| `POST` | `/api/menus/extract` |
| `POST` | `/api/menus/publish` |
| `POST` | `/api/evidence/seal` |
| `GET` | `/api/evidence/:recordId` |
| `POST` | `/api/scans/extract` |
| `POST` | `/api/scans/compare` |
| `POST` | `/api/verify` |
