import type { PublishResult } from "@shared/contracts";

/** Solana Memo Program publish via QuickNode. Implement for real seal. */
export async function publishMenuMemo(_args: {
  menuHash: string;
  restaurantId: string;
  version: number;
}): Promise<PublishResult> {
  throw new Error("lib/solana not implemented — use fixtures for now");
}
