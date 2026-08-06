import menu from "@fixtures/menu.v1.json";
import publish from "@fixtures/publish.confirmed.json";
import type { PublicMenuResponse } from "@shared/contracts";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (id !== menu.restaurantId && id !== "demo") {
    return Response.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const body: PublicMenuResponse = {
    menu: menu as PublicMenuResponse["menu"],
    menuHash: publish.menuHash,
    verified: true,
    lastUpdated: menu.effectiveFrom,
    signature: publish.signature,
    explorerUrl: publish.explorerUrl,
  };

  return Response.json(body);
}
