import { createHash } from "node:crypto";

/** Deterministic JSON: sorted keys, no whitespace variance. */
export function canonicalize(value: unknown): string {
  return JSON.stringify(sortKeys(value));
}

function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortKeys(obj[key]);
    }
    return sorted;
  }
  return value;
}

/** SHA-256 hex of canonicalized JSON (menus, confirmed analysis, etc.). */
export function hashCanonicalMenu(menu: unknown): string {
  return hashUtf8(canonicalize(menu));
}

export function hashUtf8(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

/** SHA-256 hex of raw file / image bytes. */
export function hashBytes(data: ArrayBuffer | Uint8Array | Buffer): string {
  const buf = Buffer.isBuffer(data)
    ? data
    : Buffer.from(new Uint8Array(data));
  return createHash("sha256").update(buf).digest("hex");
}

/** Alias for confirmed extraction / analysis records. */
export function hashAnalysis(analysis: unknown): string {
  return hashCanonicalMenu(analysis);
}
