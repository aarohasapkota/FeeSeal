# FeeSeal Coding Standards

Adapted from [Doug Lea’s Draft Java Coding Standard](https://gee.cs.oswego.edu/dl/html/javaCodingStd.html) (public domain) for this repo’s stack: **TypeScript**, **React**, **Next.js (App Router)**, JSON fixtures, and Solana helper libs.

Use these as checklists in review and clean-up. **Do not require 100% conformance** when a rule blocks a clear, correct solution — break rules deliberately and document why.

---

## Contents

1. [Structure and documentation](#1-structure-and-documentation)
2. [Naming conventions](#2-naming-conventions)
3. [Recommendations](#3-recommendations)
4. [FeeSeal-specific rules](#4-feeseal-specific-rules)
5. [Source](#5-source)

---

## 1. Structure and documentation

### Modules and folders

Create a folder (or module) for each self-contained area of related functionality. Match existing layout:

| Area | Path | Owner |
|---|---|---|
| UI pages / components | `src/app/**`, `src/components/**` | Diego |
| HTTP API | `src/app/api/**` | Aaroha |
| Domain libs | `src/lib/{hash,solana,vision,compare}/**` | Aaroha |
| Shared types | `shared/contracts.ts` | Shared (Aaroha authors) |
| Demo data | `fixtures/**` | Shared |

Prefer a short `README` or file-top comment when a folder’s purpose is not obvious from its name.

### Program files

- **One primary export per file** when practical (one React component, one route handler module, one focused lib).
- Co-locate tiny private helpers in the same file only when they cannot reasonably be reused elsewhere.
- Prefer `route.ts` for App Router handlers; keep handler thin — call into `src/lib/**` for real work.

Begin non-trivial files with a short header when useful:

```ts
/**
 * Canonical menu hashing for publish + verify.
 * Deterministic: same CanonicalMenu → same SHA-256 hex.
 */
```

Order at the top of a TypeScript file:

1. `"use client"` / `"use server"` (if required)
2. Imports (external → aliases `@/` / `@shared` / `@fixtures` → relative)
3. Types / constants
4. Implementation
5. Default export last (React pages/components)

### Types, interfaces, and classes

Document public types and exported functions with TSDoc (`/** ... */`), not Java-style javadoc tags unless useful.

For exported APIs, describe:

- Purpose and invariants
- Preconditions / invalid inputs
- Return shape
- Errors thrown or HTTP status codes returned

```ts
/**
 * Compare published menu (A) to physical-menu and receipt extractions (B, C).
 * Arithmetic is deterministic — do not call a model here.
 *
 * @returns ComparisonResult including the fixed FeeSeal disclaimer
 */
export function compareSources(args: {
  menu: CanonicalMenu;
  physicalMenu: ExtractionDraft;
  receipt: ExtractionDraft;
}): ComparisonResult;
```

Prefer **`type` / `interface` in `shared/contracts.ts`** for anything that crosses the UI↔API boundary. Do not redefine the same shape in a page.

### Members and locals

- Document non-obvious fields on public types (units, nullability, legal language constraints).
- Use `/* ... */` for multi-step strategy comments.
- Use `//` sparingly for non-obvious intent; prefer clearer names over comments on obvious code.

```ts
const INVALID_INDEX = -1;
let index = INVALID_INDEX;
```

### Layout

Stay consistent with the repo formatter / ESLint:

- 2-space indent (Prettier / Next defaults)
- Braces on the same line as the statement that opens them
- No trailing whitespace; files end with a newline

Run `npm run lint` before pushing.

---

## 2. Naming conventions

Mapped from Lea’s Java rules to TypeScript / React / Next.js.

| Kind | Convention | Examples |
|---|---|---|
| Packages / folders | `lowercase`, kebab only when needed for routes | `src/lib/compare`, `app/api/scans` |
| Files | Match main export; React components `PascalCase.tsx` | `CompareFindings.tsx`, `route.ts`, `index.ts` |
| Types / interfaces | `PascalCase` | `CanonicalMenu`, `Finding` |
| Error classes | End with `Error` | `MenuHashError` |
| React components | `PascalCase` | `FindingsScreen` |
| Constants | `UPPER_SNAKE_CASE` | `FEESEAL_DISCLAIMER` |
| Variables / params | `camelCase` | `menuHash`, `priceCents` |
| Functions / methods | `camelCase` | `hashCanonicalMenu`, `compareSources` |
| Factory for type `X` | `createX` / `newX` | `createExtractionDraft` |
| Converter to type `X` | `toX` | `toPublicMenuResponse` |
| Boolean | Prefer `is` / `has` / `can` | `isPrixFixe`, `hasMatchingDisclosure` |
| Next route segments | lowercase | `/api/menus/publish` |
| Env vars | `UPPER_SNAKE_CASE` | `QUICKNODE_SOLANA_RPC` |
| CSS variables | kebab after `--` | `--accent`, `--difference` |

Money is **integer cents** (`priceCents`), never floating dollars in domain logic.

Do **not** use Lea’s trailing-underscore / `fVar` / `myVar` styles — stick to plain `camelCase`.

---

## 3. Recommendations

Lea’s rules of thumb, rewritten for this stack.

### Imports and dependencies

- Prefer precise imports. Avoid `import *` except for narrow cases (e.g. test utilities).
- Use path aliases: `@/` (src), `@shared/contracts`, `@fixtures/...`.
- Remove unused imports (ESLint will help).

### Testing and demos

- Prefer small pure functions in `src/lib/**` that can be unit-tested without spinning up Next.
- Keep `fixtures/**` aligned with `shared/contracts.ts` so UI and API demos stay honest.
- When adding a lib, a minimal demo path or fixture-backed API stub is enough for ship night.

### Types over classes

- Prefer functions + plain data (`CanonicalMenu`, `Finding`) over class hierarchies.
- Use interfaces/types for contracts; use classes only when identity or encapsulation clearly helps (rare here).
- Prefer explicit required fields over “optional everything.”

### Encapsulation

- Do not export mutable module-level state without a clear owner.
- API routes validate input at the boundary; libs may assume already-validated domain objects **or** re-validate — pick one and document it.
- Prefer `readonly` / `as const` for fixed tables and disclaimer strings.

### Numbers and money

- Prefer integers for money and rates-as-basis-points when doing arithmetic; format for display only at the edge.
- Avoid `float`/`number` dollars for comparison logic.

### Immutability and locals

- Prefer `const`; use `let` only when reassignment is required.
- Declare locals at the point you know their initial value.
- Do not reuse a local for a second unrelated meaning — declare a new one.
- Prefer spreading / mapping to new objects over mutating shared fixtures.

### Control flow and equality

- Avoid assignments inside `if` / `while` conditions.
- Use `===` / `!==`, never `==` / `!=`.
- Narrow with `typeof`, tagged unions, and type guards instead of unchecked casts.
- If you ignore a return value on purpose, make that obvious (void operator or explicit unused binding).

### Errors

- Catch errors you can handle; map the rest to clear HTTP responses (`400` validation, `404` missing, `500` unexpected).
- Do not swallow errors silently.
- Prefer typed error messages safe for logs; never put secrets in client-facing errors.

### Async and concurrency

- Mark async work with `async`/`await`; do not mix bare promise chains without reason.
- Document any shared in-memory store and its concurrency assumptions (hackathon stores are single-process).
- Do not block the event loop with heavy sync work on large images — stream or bound size at upload.

### Overloading and APIs

- Avoid confusing overload-by-type patterns; prefer distinct function names or a discriminated union argument.
- Keep functions focused: one job each (hash ≠ publish ≠ compare).
- Separate pure “read/compare” from “write/publish” side effects.

### Optimization

- Document fragile optimizations.
- Default to clarity; optimize when measured or when the demo path requires it (e.g. chain latency retries).

### Conformance

- These are guidelines. Break them when they fight correctness, deadline, or clarity — and leave a one-line note when non-obvious.

---

## 4. FeeSeal-specific rules

### Contracts

- UI and API **must** share shapes from `shared/contracts.ts`.
- Changing a contract requires a quick sync between Aaroha and Diego (same PR or paired update to fixtures).

### Comparison and language

- Vision/LLM may **extract** only. Comparison and arithmetic stay in TypeScript (`src/lib/compare`).
- User-facing finding copy: “potential discrepancy,” “no matching disclosure found,” “review recommended.”
- Never: “illegal,” “fraud,” “violation,” “you can sue.”
- Findings always include `FEESEAL_DISCLAIMER` (or the PRD equivalent string).

### Chain boundary

- On-chain: hash, restaurant key, version, timestamp, effective-from, jurisdiction, fee flags, dietary tags — not photos, PII, or full item text blobs beyond what’s required by the memo design.
- Label demo payments / settlement as **devnet / demo**.

### Ownership (merge hygiene)

- Diego: pages, components, styling.
- Aaroha: `app/api`, `src/lib/**`, Solana/vision/hash/compare.
- Do not both rewrite `shared/contracts.ts` without coordinating.

### Secrets

- Never commit `.env.local` or private keys.
- Use `.env.example` for names only.

---

## 5. Source

Structure, naming, and recommendation spirit adapted from:

> Doug Lea, *Draft Java Coding Standard*  
> https://gee.cs.oswego.edu/dl/html/javaCodingStd.html  
> Released to the public domain.

Java-only topics (e.g. `synchronized`, `Serializable`, `wait`/`notify`, javadoc `@exception`) were replaced with TypeScript / React / Next.js equivalents appropriate to FeeSeal.
