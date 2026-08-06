import {
  formatEffectiveDate,
  formatUsd,
  groupItemsBySection,
  type PaperMenuProps,
} from "./shared";

/** Single-column printed menu: centered masthead, section rules, price leaders. */
export function ClassicSingleMenu({
  menu,
  verified,
  className = "",
}: PaperMenuProps) {
  const sections = groupItemsBySection(menu.items);

  return (
    <article
      className={`menu-paper mx-auto w-full max-w-[42rem] bg-[#fbfaf6] px-8 py-10 text-ink shadow-[0_1px_0_rgba(15,23,42,0.06)] ${className}`}
    >
      <header className="border-b border-ink/20 pb-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
          FeeSeal menu
        </p>
        <h1 className="font-menu mt-3 text-4xl tracking-tight text-ink sm:text-5xl">
          {menu.restaurantName}
        </h1>
        <p className="mt-2 text-sm text-ink/60">
          Version {menu.version} · {formatEffectiveDate(menu.effectiveFrom)}
          {verified ? (
            <span className="ml-2 font-medium text-verified">· Verified</span>
          ) : null}
        </p>
      </header>

      <div className="mt-8 space-y-8">
        {sections.map(({ section, items }) => (
          <section key={section}>
            <h2 className="font-menu text-center text-xl tracking-wide text-ink">
              {section}
            </h2>
            <div className="mx-auto mt-1 mb-4 h-px w-16 bg-ink/25" />
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id}>
                  <div className="flex items-baseline gap-2">
                    <span className="shrink-0 text-[15px] font-medium">
                      {item.name}
                    </span>
                    <span
                      className="min-w-0 flex-1 border-b border-dotted border-ink/25"
                      aria-hidden
                    />
                    <span className="shrink-0 font-mono text-sm tabular-nums">
                      {formatUsd(item.priceCents)}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="mt-0.5 pr-16 text-sm text-ink/55">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mt-10 border-t border-ink/15 pt-5 text-center text-xs leading-relaxed text-ink/65">
        {menu.feeDisclosures.map((fee, i) => (
          <p key={`${fee.kind}-${i}`}>
            <span className="font-medium text-ink/80">
              {fee.amountOrRate} {fee.kind.replaceAll("_", " ")}
            </span>
            {fee.purpose ? ` — ${fee.purpose}` : ""}
          </p>
        ))}
        {menu.feeDisclosures.length === 0 ? (
          <p>No operations charge disclosed on this menu version.</p>
        ) : null}
      </footer>
    </article>
  );
}
