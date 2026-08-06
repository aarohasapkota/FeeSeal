import findings from "@fixtures/findings.demo.json";
import type { CompareRequest, ComparisonResult } from "@shared/contracts";
import { FEESEAL_DISCLAIMER } from "@shared/contracts";

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

  // Fixture stub — real deterministic compare lands in lib/compare
  const result: ComparisonResult = {
    ...(findings as ComparisonResult),
    disclaimer: FEESEAL_DISCLAIMER,
  };

  return Response.json(result);
}
