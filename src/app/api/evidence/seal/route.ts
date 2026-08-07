import type {
  EvidenceSealRequest,
  EvidenceSealResult,
  EvidenceSource,
} from "@shared/contracts";
import { hashAnalysis, hashBytes } from "@/lib/hash";
import {
  mintEvidenceRecordId,
  saveEvidence,
  toEvidenceSealResult,
} from "@/lib/evidence-store";
import { publishEvidenceMemo } from "@/lib/solana";

export const runtime = "nodejs";

function isSource(value: unknown): value is EvidenceSource {
  return value === "physical_menu" || value === "receipt";
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  let restaurantId = "";
  let source: EvidenceSource | null = null;
  let fileHash = "";
  let analysis: unknown = null;
  let recordId: string | undefined;

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    restaurantId = String(form.get("restaurantId") ?? "");
    const src = form.get("source");
    if (isSource(src)) source = src;
    const analysisRaw = form.get("analysis");
    if (typeof analysisRaw === "string") {
      try {
        analysis = JSON.parse(analysisRaw);
      } catch {
        return Response.json(
          { error: "analysis must be JSON string in multipart" },
          { status: 400 },
        );
      }
    }
    const rid = form.get("recordId");
    if (typeof rid === "string" && rid.trim()) recordId = rid.trim();

    const file = form.get("file") ?? form.get("image");
    const hashField = form.get("fileHash");
    if (file instanceof Blob && file.size > 0) {
      fileHash = hashBytes(await file.arrayBuffer());
    } else if (typeof hashField === "string" && hashField.trim()) {
      fileHash = hashField.trim().toLowerCase();
    }
  } else {
    let body: EvidenceSealRequest;
    try {
      body = (await request.json()) as EvidenceSealRequest;
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
    restaurantId = body.restaurantId ?? "";
    source = isSource(body.source) ? body.source : null;
    analysis = body.analysis;
    fileHash = (body.fileHash ?? "").trim().toLowerCase();
    recordId = body.recordId?.trim();
  }

  if (!restaurantId || !source) {
    return Response.json(
      { error: "restaurantId and source (physical_menu|receipt) are required" },
      { status: 400 },
    );
  }
  if (!fileHash || !/^[a-f0-9]{64}$/.test(fileHash)) {
    return Response.json(
      {
        error:
          "fileHash (sha256 hex) required, or multipart file/image to hash server-side",
      },
      { status: 400 },
    );
  }
  if (analysis === null || analysis === undefined) {
    return Response.json(
      { error: "analysis (confirmed extraction JSON) is required" },
      { status: 400 },
    );
  }

  const analysisHash = hashAnalysis(analysis);
  const id = recordId && recordId.startsWith("FS-")
    ? recordId
    : mintEvidenceRecordId();

  const memo = await publishEvidenceMemo({
    recordId: id,
    restaurantId,
    source,
    fileHash,
    analysisHash,
  });

  const sealedAt = new Date().toISOString();
  saveEvidence({
    recordId: id,
    restaurantId,
    source,
    fileHash,
    analysisHash,
    signature: memo.signature,
    explorerUrl: memo.explorerUrl,
    cluster: memo.cluster,
    sealedAt,
  });

  const result: EvidenceSealResult = toEvidenceSealResult({
    recordId: id,
    restaurantId,
    source,
    fileHash,
    analysisHash,
    signature: memo.signature,
    explorerUrl: memo.explorerUrl,
    cluster: memo.cluster,
    sealedAt,
  });

  return Response.json(result);
}
