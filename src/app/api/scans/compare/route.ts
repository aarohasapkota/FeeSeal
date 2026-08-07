import type { CompareRequest, ComparisonResult } from "@shared/contracts";
import { compareSources } from "@/lib/compare";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: CompareRequest;

  try {
    body = (await request.json()) as CompareRequest;
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body?.menu || !body?.physicalMenu || !body?.receipt) {
    return Response.json(
      { error: "Expected menu, physicalMenu, and receipt" },
      { status: 400 },
    );
  }

  const result: ComparisonResult = compareSources({
    menu: body.menu,
    physicalMenu: body.physicalMenu,
    receipt: body.receipt,
  });

  return Response.json(result);
}
