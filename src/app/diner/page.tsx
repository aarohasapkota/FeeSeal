import Link from "next/link";

/** Placeholder for Diego — APIs below are ready. */
export default function DinerPlaceholder() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <p className="font-mono text-sm text-accent">Diner</p>
      <h1 className="mt-2 font-menu text-2xl font-semibold text-ink">
        UI lane (Diego)
      </h1>
      <p className="mt-2 text-ink/70">
        Build scan → review → findings → verify against these backend routes.
      </p>
      <ul className="mt-6 list-disc space-y-2 pl-5 text-sm text-ink/80">
        <li>
          <code className="font-mono">GET /api/restaurants/demo/menu</code> —
          Source A
        </li>
        <li>
          <code className="font-mono">POST /api/scans/extract</code> — image +
          source
        </li>
        <li>
          <code className="font-mono">POST /api/evidence/seal</code> — seal
          fileHash + analysisHash
        </li>
        <li>
          <code className="font-mono">POST /api/scans/compare</code> —
          deterministic A/B/C
        </li>
        <li>
          <code className="font-mono">POST /api/verify</code> — menu or evidence
          fingerprints
        </li>
      </ul>
      <Link href="/" className="mt-8 inline-block text-sm text-accent">
        Back
      </Link>
    </main>
  );
}
