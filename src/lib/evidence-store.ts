import type {
  EvidenceSealResult,
  EvidenceSource,
  SealCluster,
} from "@shared/contracts";

export type StoredEvidenceRecord = {
  recordId: string;
  restaurantId: string;
  source: EvidenceSource;
  fileHash: string;
  analysisHash: string;
  signature: string;
  explorerUrl: string;
  cluster: SealCluster;
  sealedAt: string;
};

const globalStore = globalThis as typeof globalThis & {
  __feesealEvidenceStore?: Map<string, StoredEvidenceRecord>;
};

function store(): Map<string, StoredEvidenceRecord> {
  if (!globalStore.__feesealEvidenceStore) {
    globalStore.__feesealEvidenceStore = new Map();
  }
  return globalStore.__feesealEvidenceStore;
}

export function mintEvidenceRecordId(): string {
  const suffix = Math.random().toString(16).slice(2, 8).toUpperCase();
  return `FS-${suffix}`;
}

export function saveEvidence(record: StoredEvidenceRecord): void {
  store().set(record.recordId, record);
}

export function getEvidence(
  recordId: string,
): StoredEvidenceRecord | undefined {
  return store().get(recordId);
}

export function toEvidenceSealResult(
  record: StoredEvidenceRecord,
): EvidenceSealResult {
  return {
    recordId: record.recordId,
    restaurantId: record.restaurantId,
    source: record.source,
    fileHash: record.fileHash,
    analysisHash: record.analysisHash,
    signature: record.signature,
    explorerUrl: record.explorerUrl,
    status: "confirmed",
    cluster: record.cluster,
    sealedAt: record.sealedAt,
  };
}
