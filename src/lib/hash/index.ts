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

/** SHA-256 hex of canonicalized menu (or any JSON-serializable value). */
export function hashCanonicalMenu(menu: unknown): string {
  const payload = canonicalize(menu);
  return createHash("sha256").update(payload, "utf8").digest("hex");
}
