import menuFixture from "@fixtures/menu.v1.json";
import type { CanonicalMenu, VerifyResult } from "@shared/contracts";
import { hashCanonicalMenu } from "@/lib/hash";
import { getPublishedMenu } from "@/lib/menu-store";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  let actualHash: string | undefined;
  let restaurantId: string | undefined;
  let expectMatch = true;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const tampered = form.get("tampered");
    expectMatch = tampered !== "true" && tampered !== "1";
    const hashField = form.get("hash");
    if (typeof hashField === "string" && hashField.length > 0) {
      actualHash = hashField;
    }
    const idField = form.get("restaurantId");
    if (typeof idField === "string") restaurantId = idField;
  } else {
    try {
      const json = (await request.json()) as {
        hash?: string;
        tampered?: boolean;
        restaurantId?: string;
      };
      actualHash = json.hash;
      expectMatch = json.tampered !== true;
      restaurantId = json.restaurantId;
    } catch {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }
  }

  const stored = restaurantId ? getPublishedMenu(restaurantId) : undefined;
  const expectedHash =
    stored?.menuHash ?? hashCanonicalMenu(menuFixture as CanonicalMenu);

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
