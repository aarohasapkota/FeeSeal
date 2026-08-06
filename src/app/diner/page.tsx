export default function DinerPlaceholder() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <p className="font-mono text-sm text-accent">Diner</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Placeholder</h1>
      <p className="mt-2 text-ink/70">
        Scan, review extraction, findings, and verify screens go here (Diego).
      </p>
      <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-ink/80">
        <li>
          <code className="font-mono">GET /api/restaurants/demo/menu</code>
        </li>
        <li>
          <code className="font-mono">POST /api/scans/extract</code>
        </li>
        <li>
          <code className="font-mono">POST /api/scans/compare</code>
        </li>
        <li>
          <code className="font-mono">POST /api/verify</code>
        </li>
      </ul>
    </main>
  );
}
