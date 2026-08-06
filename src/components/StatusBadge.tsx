type BadgeTone =
  | "verified"
  | "review"
  | "difference"
  | "pending"
  | "failed"
  | "info"
  | "confirmed";

const toneClass: Record<BadgeTone, string> = {
  verified: "bg-verified/10 text-verified",
  confirmed: "bg-verified/10 text-verified",
  review: "bg-review/10 text-review",
  difference: "bg-difference/10 text-difference",
  pending: "bg-ink/5 text-ink/70",
  failed: "bg-difference/10 text-difference",
  info: "bg-accent/10 text-accent",
};

type StatusBadgeProps = {
  tone: BadgeTone;
  children: React.ReactNode;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium tracking-wide ${toneClass[tone]}`}
    >
      {children}
    </span>
  );
}
