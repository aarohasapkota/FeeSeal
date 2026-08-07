import { getEvidence, toEvidenceSealResult } from "@/lib/evidence-store";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const record = getEvidence(id);
  if (!record) {
    return Response.json({ error: "Evidence seal not found" }, { status: 404 });
  }
  return Response.json(toEvidenceSealResult(record));
}
