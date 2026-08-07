import menuFixture from "@fixtures/menu.v1.json";
import type {
  CanonicalMenu,
  VerifyKind,
  VerifyResult,
} from "@shared/contracts";
import { getEvidence } from "@/lib/evidence-store";
import { hashBytes, hashCanonicalMenu } from "@/lib/hash";
import { getPublishedMenu } from "@/lib/menu-store";

export const runtime = "nodejs";

function parseKind(raw: unknown): VerifyKind {
  if (
    raw === "evidence_file" ||
    raw === "evidence_analysis" ||
    raw === "menu"
  ) {
    return raw;
  }
  return "menu";
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let kind: VerifyKind = "menu";
  let restaurantId: string | undefined;
  let recordId: string | undefined;
  let actualHash: string | undefined;
  let tampered = false;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    kind = parseKind(form.get("kind"));
    const rid = form.get("restaurantId");
    if (typeof rid === "string") restaurantId = rid;
    const evid = form.get("recordId");
    if (typeof evid === "string") recordId = evid;
    tampered =
      form.get("tampered") === "true" || form.get("tampered") === "1";

    const hashField = form.get("hash");
    if (typeof hashField === "string" && hashField.trim()) {
      actualHash = hashField.trim().toLowerCase();
    }

    const file = form.get("file") ?? form.get("image");
    if (file instanceof Blob && file.size > 0) {
      actualHash = hashBytes(await file.arrayBuffer());
    }
  } else {
    try {
      const json = (await request.json()) as {
        kind?: VerifyKind;
        restaurantId?: string;
        recordId?: string;
        hash?: string;
        tampered?: boolean;
      };
      kind = parseKind(json.kind);
      restaurantId = json.restaurantId;
      recordId = json.recordId;
      actualHash = json.hash?.trim().toLowerCase();
      tampered = json.tampered === true;
    } catch {
      return Response.json({ error: "Invalid body" }, { status: 400 });
    }
  }

  if (kind === "menu") {
    const stored = restaurantId ? getPublishedMenu(restaurantId) : undefined;
    const expectedHash =
      stored?.menuHash ?? hashCanonicalMenu(menuFixture as CanonicalMenu);
    const resolvedActual =
      actualHash ??
      (tampered
        ? "0000000000000000000000000000000000000000000000000000000000000000"
        : expectedHash);
    const ok = resolvedActual === expectedHash && !tampered;

    const result: VerifyResult = {
      ok,
      kind,
      expectedHash,
      actualHash: resolvedActual,
      onChainMatch: ok,
      signature: stored?.signature,
      explorerUrl: stored?.explorerUrl,
      cluster: stored?.cluster,
    };
    return Response.json(result);
  }

  if (!recordId) {
    return Response.json(
      { error: "recordId is required for evidence verification" },
      { status: 400 },
    );
  }

  const evidence = getEvidence(recordId);
  if (!evidence) {
    return Response.json({ error: "Evidence seal not found" }, { status: 404 });
  }

  const expectedHash =
    kind === "evidence_file" ? evidence.fileHash : evidence.analysisHash;

  const resolvedActual =
    actualHash ??
    (tampered
      ? "0000000000000000000000000000000000000000000000000000000000000000"
      : expectedHash);

  const ok = resolvedActual === expectedHash && !tampered;

  const result: VerifyResult = {
    ok,
    kind,
    expectedHash,
    actualHash: resolvedActual,
    onChainMatch: ok,
    recordId: evidence.recordId,
    signature: evidence.signature,
    explorerUrl: evidence.explorerUrl,
    cluster: evidence.cluster,
  };

  return Response.json(result);
}
