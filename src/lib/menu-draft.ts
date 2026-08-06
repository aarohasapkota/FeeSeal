import type {
  CanonicalMenu,
  FeeDisclosure,
  FeeKind,
  MenuExtractResult,
  MenuItem,
  MenuPublishDraft,
  MenuTemplateId,
} from "@shared/contracts";

export function slugifyRestaurantId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  return `rst_${base || "restaurant"}`;
}

export function itemsFromExtract(result: MenuExtractResult): MenuItem[] {
  return result.items.map((item, index) => ({
    id: `itm_${index}_${item.name.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 24)}`,
    section: item.section || "Menu",
    name: item.name,
    priceCents: item.priceCents,
    description: item.description,
  }));
}

export function emptyFee(): FeeDisclosure {
  return {
    kind: "operations_charge",
    amountOrRate: "",
    purpose: "",
  };
}

export function draftToCanonical(
  draft: MenuPublishDraft,
  restaurantId: string,
  version = 1,
): CanonicalMenu {
  return {
    restaurantId,
    restaurantName: draft.restaurantName.trim(),
    version,
    effectiveFrom: new Date().toISOString(),
    jurisdiction: "US-FL",
    currency: "USD",
    items: draft.items,
    feeDisclosures: draft.feeDisclosures.filter(
      (f) => f.amountOrRate.trim().length > 0,
    ),
    templateId: draft.templateId,
    prixFixeNote: draft.prixFixeNote,
  };
}

export const FEE_KIND_OPTIONS: { value: FeeKind; label: string }[] = [
  { value: "operations_charge", label: "Operations charge" },
  { value: "automatic_gratuity", label: "Automatic gratuity" },
  { value: "credit_card_surcharge", label: "Credit card surcharge" },
  { value: "other", label: "Other" },
];

export function dollarsToCents(value: string): number {
  const n = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function centsToDollarsInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function defaultTemplate(): MenuTemplateId {
  return "classic_single";
}
