import type { ExtractionDraft } from "@shared/contracts";

/** Vision extraction only — comparison stays in lib/compare. */
export async function extractFromImage(_args: {
  image: Blob;
  source: ExtractionDraft["source"];
}): Promise<ExtractionDraft> {
  throw new Error("lib/vision not implemented — use fixtures for now");
}
