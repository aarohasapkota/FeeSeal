import menuExtraction from "@fixtures/extraction.menu.json";
import receiptExtraction from "@fixtures/extraction.receipt.json";
import type { ExtractionDraft } from "@shared/contracts";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let source: ExtractionDraft["source"] = "physical_menu";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const raw = form.get("source");
    if (raw === "receipt" || raw === "physical_menu") {
      source = raw;
    }
  } else {
    try {
      const json = (await request.json()) as { source?: string };
      if (json.source === "receipt" || json.source === "physical_menu") {
        source = json.source;
      }
    } catch {
      // default physical_menu
    }
  }

  // Fixture stub — real vision extract lands in lib/vision
  const draft =
    source === "receipt"
      ? (receiptExtraction as ExtractionDraft)
      : (menuExtraction as ExtractionDraft);

  return Response.json(draft);
}
