import Link from "next/link";

type AppHeaderProps = {
  backHref?: string;
  backLabel?: string;
};

export function AppHeader({ backHref, backLabel = "Back" }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4">
      <Link
        href="/"
        className="font-mono text-sm tracking-wide text-accent hover:opacity-80"
      >
        FeeSeal
      </Link>
      {backHref ? (
        <Link href={backHref} className="text-sm text-ink/60 hover:text-ink">
          {backLabel}
        </Link>
      ) : null}
    </header>
  );
}
