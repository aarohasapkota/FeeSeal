import type { CanonicalMenu, MenuItem } from "@shared/contracts";

export function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export function groupItemsBySection(
  items: MenuItem[],
): { section: string; items: MenuItem[] }[] {
  const order: string[] = [];
  const map = new Map<string, MenuItem[]>();
  for (const item of items) {
    const section = item.section || "Menu";
    if (!map.has(section)) {
      map.set(section, []);
      order.push(section);
    }
    map.get(section)!.push(item);
  }
  return order.map((section) => ({ section, items: map.get(section)! }));
}

export function formatEffectiveDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export type PaperMenuProps = {
  menu: CanonicalMenu;
  verified?: boolean;
  className?: string;
};
