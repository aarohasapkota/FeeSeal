import {
  formatEffectiveDate,
  formatUsd,
  groupItemsBySection,
  type PaperMenuProps,
} from "./shared";

/** Dense evening menu — more items above the fold, compact type. */
export function EveningDenseMenu({
  menu,
  verified,
  className = "",
}: PaperMenuProps) {
  const sections = groupItemsBySection(menu.items);

  return (
    <article
      className={`menu-paper mx-auto w-full max-w-[40rem] border border-ink/10 bg-[#f4f1ea] px-5 py-6 text-ink sm:px-7 ${className}`}
    >
      <header className="text-center">
        <div className="mx-auto h-px w-full bg-ink/30" />
        <h1 className="font-menu my-2 text-3xl tracking-[0.04em] sm:text-4xl">
          {menu.restaurantName}
        </h1>
        <div className="mx-auto h-px w-full bg-ink/30" />
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink/50">
          Evening card · v{menu.version} ·{" "}
          {formatEffectiveDate(menu.effectiveFrom)}
          {verified ? " · Verified" : ""}
        </p>
      </header>

      <div className="mt-5 space-y-4">
        {sections.map(({ section, items }) => (
          <section key={section}>
            <h2 className="mb-1.5 font-menu text-sm uppercase tracking-[0.18em] text-accent">
              {section}
            </h2>
            <ul>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="grid grid-cols-[1fr_auto] gap-x-3 border-b border-ink/8 py-1.5 text-[13px] leading-snug"
                >
                  <div>
                    <span className="font-medium">{item.name}</span>
                    {item.description ? (
                      <span className="text-ink/45"> — {item.description}</span>
                    ) : null}
                  </div>
                  <span className="font-mono text-[12px] tabular-nums">
                    {formatUsd(item.priceCents)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mt-5 border-t border-ink/25 pt-3 text-[11px] leading-relaxed text-ink/60">
        {menu.feeDisclosures.map((fee, i) => (
          <p key={`${fee.kind}-${i}`}>
            {fee.amountOrRate} {fee.kind.replaceAll("_", " ")}
            {fee.purpose ? ` · ${fee.purpose}` : ""}
          </p>
        ))}
      </footer>
    </article>
  );
}
