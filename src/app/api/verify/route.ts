import publish from "@fixtures/publish.confirmed.json";
import type { VerifyResult } from "@shared/contracts";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let actualHash: string | undefined;
  let expectMatch = true;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const tampered = form.get("tampered");
    expectMatch = tampered !== "true" && tampered !== "1";
    const hashField = form.get("hash");
    if (typeof hashField === "string" && hashField.length > 0) {
      actualHash = hashField;
    }
  } else {
    try {
      const json = (await request.json()) as {
        hash?: string;
        tampered?: boolean;
      };
      actualHash = json.hash;
      expectMatch = json.tampered !== true;
    } catch {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }
  }

  const expectedHash = publish.menuHash;
  const resolvedActual =
    actualHash ??
    (expectMatch
      ? expectedHash
      : "0000000000000000000000000000000000000000000000000000000000000000");

  const ok = resolvedActual === expectedHash && expectMatch;

  const result: VerifyResult = {
    ok,
    expectedHash,
    actualHash: resolvedActual,
    onChainMatch: ok,
  };

  return Response.json(result);
}
