import type { CanonicalMenu, PublicMenuResponse } from "@shared/contracts";

export type StoredMenuRecord = {
  menu: CanonicalMenu;
  menuHash: string;
  signature: string;
  explorerUrl: string;
  verified: boolean;
};

const globalStore = globalThis as typeof globalThis & {
  __feesealMenuStore?: Map<string, StoredMenuRecord>;
};

function store(): Map<string, StoredMenuRecord> {
  if (!globalStore.__feesealMenuStore) {
    globalStore.__feesealMenuStore = new Map();
  }
  return globalStore.__feesealMenuStore;
}

export function savePublishedMenu(record: StoredMenuRecord): void {
  store().set(record.menu.restaurantId, record);
}

export function getPublishedMenu(id: string): StoredMenuRecord | undefined {
  return store().get(id);
}

export function toPublicMenuResponse(
  record: StoredMenuRecord,
): PublicMenuResponse {
  return {
    menu: record.menu,
    menuHash: record.menuHash,
    verified: record.verified,
    lastUpdated: record.menu.effectiveFrom,
    templateId: record.menu.templateId,
    signature: record.signature,
    explorerUrl: record.explorerUrl,
  };
}
