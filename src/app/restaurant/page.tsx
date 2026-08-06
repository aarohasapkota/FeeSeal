export default function RestaurantPlaceholder() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <p className="font-mono text-sm text-accent">Restaurant</p>
      <h1 className="mt-2 text-2xl font-semibold text-ink">Placeholder</h1>
      <p className="mt-2 text-ink/70">
        Onboarding, menu builder, and publish confirmation go here (Diego).
      </p>
      <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-ink/80">
        <li>
          <code className="font-mono">POST /api/menus/publish</code>
        </li>
        <li>
          Fixture menu: <code className="font-mono">fixtures/menu.v1.json</code>
        </li>
        <li>
          Publish stub:{" "}
          <code className="font-mono">fixtures/publish.confirmed.json</code>
        </li>
      </ul>
    </main>
  );
}
