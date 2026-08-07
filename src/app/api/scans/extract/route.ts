import menuExtraction from "@fixtures/extraction.menu.json";
import receiptExtraction from "@fixtures/extraction.receipt.json";
import type { ExtractionDraft } from "@shared/contracts";
import { extractFromImage } from "@/lib/vision";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let source: ExtractionDraft["source"] = "physical_menu";
  let image: Blob | null = null;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const raw = form.get("source");
    if (raw === "receipt" || raw === "physical_menu") {
      source = raw;
    }
    const file = form.get("image") ?? form.get("file");
    if (file instanceof Blob && file.size > 0) {
      image = file;
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

  if (image) {
    const draft = await extractFromImage({ image, source });
    // Force the requested source on the draft
    return Response.json({ ...draft, source });
  }

  // No image — return fixtures so Diego can wire UI offline
  const draft =
    source === "receipt"
      ? (receiptExtraction as ExtractionDraft)
      : (menuExtraction as ExtractionDraft);

  return Response.json(draft);
}
