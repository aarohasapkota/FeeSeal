import publish from "@fixtures/publish.confirmed.json";
import type { CanonicalMenu, PublishResult } from "@shared/contracts";

export async function POST(request: Request) {
  let body: CanonicalMenu;

  try {
    body = (await request.json()) as CanonicalMenu;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.restaurantId || !Array.isArray(body.items)) {
    return Response.json(
      { error: "Expected CanonicalMenu with restaurantId and items" },
      { status: 400 },
    );
  }

  // Fixture stub — real Solana memo publish lands in lib/solana
  const result: PublishResult = {
    ...publish,
    version: body.version ?? publish.version,
    status: "confirmed",
  } as PublishResult;

  return Response.json(result);
}
