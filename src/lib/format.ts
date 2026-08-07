/** Display helpers for cents and fee labels. */

export function formatCents(priceCents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceCents / 100);
}

export function formatFeeKind(kind: string): string {
  return kind.replaceAll("_", " ");
}

export function truncateHash(hash: string, edge = 8): string {
  if (hash.length <= edge * 2 + 1) return hash;
  return `${hash.slice(0, edge)}…${hash.slice(-edge)}`;
}
