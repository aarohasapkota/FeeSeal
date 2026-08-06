import menuFixture from "@fixtures/menu.v1.json";
import publishFixture from "@fixtures/publish.confirmed.json";
import type { CanonicalMenu, PublicMenuResponse } from "@shared/contracts";
import { hashCanonicalMenu } from "@/lib/hash";
import {
  getPublishedMenu,
  toPublicMenuResponse,
} from "@/lib/menu-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const stored = getPublishedMenu(id);
  if (stored) {
    return Response.json(toPublicMenuResponse(stored));
  }

  const fixture = menuFixture as CanonicalMenu;
  if (id !== fixture.restaurantId && id !== "demo") {
    return Response.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const menuHash = hashCanonicalMenu(fixture);
  const body: PublicMenuResponse = {
    menu: fixture,
    menuHash,
    verified: true,
    lastUpdated: fixture.effectiveFrom,
    templateId: fixture.templateId,
    signature: publishFixture.signature,
    explorerUrl: publishFixture.explorerUrl,
  };

  return Response.json(body);
}
