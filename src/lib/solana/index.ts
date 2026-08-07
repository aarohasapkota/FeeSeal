import { createHash } from "node:crypto";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import type { SealCluster } from "@shared/contracts";

/** Solana Memo Program (SPL). */
export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

export type MemoPublishResult = {
  signature: string;
  explorerUrl: string;
  cluster: SealCluster;
  status: "confirmed" | "failed";
};

function explorerUrlFor(signature: string, cluster: SealCluster): string {
  const base =
    process.env.NEXT_PUBLIC_EXPLORER_BASE || "https://explorer.solana.com";
  if (cluster === "stub") {
    return `${base}/tx/${signature}?cluster=devnet#stub`;
  }
  const q =
    process.env.NEXT_PUBLIC_SOLANA_CLUSTER === "mainnet-beta"
      ? ""
      : "?cluster=devnet";
  return `${base}/tx/${signature}${q}`;
}

function stubMemo(memo: string): MemoPublishResult {
  const signature = createHash("sha256")
    .update(`feeseal-stub:${memo}`)
    .digest("hex");
  return {
    signature,
    explorerUrl: explorerUrlFor(signature, "stub"),
    cluster: "stub",
    status: "confirmed",
  };
}

function loadSigner(): Keypair | null {
  const secret = process.env.FEESEAL_SIGNER_SECRET?.trim();
  if (!secret) return null;

  try {
    if (secret.startsWith("[")) {
      const nums = JSON.parse(secret) as number[];
      return Keypair.fromSecretKey(Uint8Array.from(nums));
    }
    return Keypair.fromSecretKey(bs58.decode(secret));
  } catch (err) {
    console.error("Invalid FEESEAL_SIGNER_SECRET", err);
    return null;
  }
}

function createMemoIx(memo: string, payer: PublicKey): TransactionInstruction {
  return new TransactionInstruction({
    keys: [{ pubkey: payer, isSigner: true, isWritable: true }],
    programId: MEMO_PROGRAM_ID,
    data: Buffer.from(memo, "utf8"),
  });
}

export function isSolanaConfigured(): boolean {
  return Boolean(
    process.env.QUICKNODE_SOLANA_RPC?.trim() &&
      process.env.FEESEAL_SIGNER_SECRET?.trim(),
  );
}

/**
 * Publish a short memo string via Solana Memo Program (QuickNode RPC).
 * Falls back to a deterministic stub seal when env is missing or RPC fails.
 */
export async function publishMemo(memo: string): Promise<MemoPublishResult> {
  const rpc = process.env.QUICKNODE_SOLANA_RPC?.trim();
  const signer = loadSigner();

  if (!rpc || !signer) {
    return stubMemo(memo);
  }

  // Memo program practical limit is well under this; keep headroom.
  if (Buffer.byteLength(memo, "utf8") > 500) {
    throw new Error("Memo payload too large (>500 bytes)");
  }

  try {
    const connection = new Connection(rpc, "confirmed");
    const tx = new Transaction().add(createMemoIx(memo, signer.publicKey));
    const signature = await sendAndConfirmTransaction(
      connection,
      tx,
      [signer],
      { commitment: "confirmed" },
    );
    return {
      signature,
      explorerUrl: explorerUrlFor(signature, "devnet"),
      cluster: "devnet",
      status: "confirmed",
    };
  } catch (err) {
    console.error("Solana memo publish failed; using stub", err);
    return stubMemo(memo);
  }
}

/** Compact memo for restaurant Source A menu seal. */
export function buildMenuMemoPayload(args: {
  restaurantId: string;
  version: number;
  menuHash: string;
}): string {
  return JSON.stringify({
    v: 1,
    app: "FeeSeal",
    kind: "menu",
    rid: args.restaurantId,
    ver: args.version,
    hash: args.menuHash,
  });
}

/** Compact memo for diner evidence seal (file + analysis fingerprints). */
export function buildEvidenceMemoPayload(args: {
  recordId: string;
  restaurantId: string;
  source: string;
  fileHash: string;
  analysisHash: string;
}): string {
  return JSON.stringify({
    v: 1,
    app: "FeeSeal",
    kind: "evidence",
    id: args.recordId,
    rid: args.restaurantId,
    src: args.source,
    fh: args.fileHash,
    ah: args.analysisHash,
  });
}

export async function publishMenuMemo(args: {
  menuHash: string;
  restaurantId: string;
  version: number;
}): Promise<MemoPublishResult> {
  const memo = buildMenuMemoPayload(args);
  return publishMemo(memo);
}

export async function publishEvidenceMemo(args: {
  recordId: string;
  restaurantId: string;
  source: string;
  fileHash: string;
  analysisHash: string;
}): Promise<MemoPublishResult> {
  const memo = buildEvidenceMemoPayload(args);
  return publishMemo(memo);
}
