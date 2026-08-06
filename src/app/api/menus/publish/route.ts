import publishFixture from "@fixtures/publish.confirmed.json";
import type { CanonicalMenu, MenuTemplateId, PublishResult } from "@shared/contracts";
import { MENU_TEMPLATE_IDS } from "@shared/contracts";
import { hashCanonicalMenu } from "@/lib/hash";
import { savePublishedMenu } from "@/lib/menu-store";

export const runtime = "nodejs";

function isTemplateId(value: unknown): value is MenuTemplateId {
  return (
    typeof value === "string" &&
    (MENU_TEMPLATE_IDS as string[]).includes(value)
  );
}

export async function POST(request: Request) {
  let body: CanonicalMenu;

  try {
    body = (await request.json()) as CanonicalMenu;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.restaurantId || !body?.restaurantName || !Array.isArray(body.items)) {
    return Response.json(
      {
        error:
          "Expected CanonicalMenu with restaurantId, restaurantName, and items",
      },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.feeDisclosures)) {
    return Response.json(
      { error: "feeDisclosures array is required" },
      { status: 400 },
    );
  }

  const templateId = isTemplateId(body.templateId)
    ? body.templateId
    : "classic_single";

  const menu: CanonicalMenu = {
    ...body,
    templateId,
    jurisdiction: "US-FL",
    currency: "USD",
    version: body.version ?? 1,
    effectiveFrom: body.effectiveFrom || new Date().toISOString(),
  };

  const menuHash = hashCanonicalMenu(menu);

  // Solana memo still stubbed — real signature later via lib/solana
  const signature = publishFixture.signature;
  const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=devnet`;

  savePublishedMenu({
    menu,
    menuHash,
    signature,
    explorerUrl,
    verified: true,
  });

  const result: PublishResult = {
    menuHash,
    version: menu.version,
    signature,
    explorerUrl,
    status: "confirmed",
    restaurantId: menu.restaurantId,
    publicPath: `/m/${menu.restaurantId}`,
  };

  return Response.json(result);
}
