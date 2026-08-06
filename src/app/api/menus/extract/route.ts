import type { MenuExtractResult } from "@shared/contracts";
import { extractMenuFromPhoto } from "@/lib/vision";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (!contentType.includes("multipart/form-data")) {
    return Response.json(
      { error: "Expected multipart/form-data with an image field" },
      { status: 400 },
    );
  }

  const form = await request.formData();
  const image = form.get("image");

  if (!(image instanceof Blob) || image.size === 0) {
    return Response.json(
      { error: "Missing image file in form field 'image'" },
      { status: 400 },
    );
  }

  const result: MenuExtractResult = await extractMenuFromPhoto({ image });
  return Response.json(result);
}
