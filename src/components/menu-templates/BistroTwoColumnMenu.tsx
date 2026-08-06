import {
  formatEffectiveDate,
  formatUsd,
  groupItemsBySection,
  type PaperMenuProps,
} from "./shared";

/** Two-column bistro page on desktop; stacks on mobile — still paper-like. */
export function BistroTwoColumnMenu({
  menu,
  verified,
  className = "",
}: PaperMenuProps) {
  const sections = groupItemsBySection(menu.items);

  return (
    <article
      className={`menu-paper mx-auto w-full max-w-[56rem] bg-[#f7f5f0] px-6 py-9 text-ink sm:px-10 ${className}`}
    >
      <header className="flex flex-col items-start justify-between gap-3 border-b-2 border-ink/80 pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-menu text-4xl tracking-tight sm:text-5xl">
            {menu.restaurantName}
          </h1>
          <p className="mt-1 text-sm text-ink/55">
            Established hospitality · Miami
          </p>
        </div>
        <p className="text-right font-mono text-[11px] uppercase tracking-wider text-ink/50">
          v{menu.version} · {formatEffectiveDate(menu.effectiveFrom)}
          {verified ? (
            <span className="mt-1 block text-verified">Verified on FeeSeal</span>
          ) : null}
        </p>
      </header>

      <div className="mt-8 columns-1 gap-10 md:columns-2">
        {sections.map(({ section, items }) => (
          <section key={section} className="mb-8 break-inside-avoid">
            <h2 className="font-menu border-b border-ink/20 pb-1 text-lg uppercase tracking-[0.12em]">
              {section}
            </h2>
            <ul className="mt-3 space-y-2.5">
              {items.map((item) => (
                <li key={item.id} className="text-[15px]">
                  <div className="flex justify-between gap-4">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-mono text-sm tabular-nums">
                      {formatUsd(item.priceCents)}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="text-sm italic text-ink/50">
                      {item.description}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <footer className="mt-6 border-t border-ink/20 pt-4 text-xs text-ink/65">
        <p className="font-menu text-sm text-ink">Notices</p>
        {menu.feeDisclosures.map((fee, i) => (
          <p key={`${fee.kind}-${i}`} className="mt-1">
            {fee.amountOrRate} {fee.kind.replaceAll("_", " ")}
            {fee.purpose ? `: ${fee.purpose}` : ""}
          </p>
        ))}
      </footer>
    </article>
  );
}
