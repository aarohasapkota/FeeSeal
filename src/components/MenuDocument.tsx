import type { CanonicalMenu, FeeDisclosure, MenuItem } from "@shared/contracts";
import { formatCents, formatFeeKind } from "@/lib/format";

export type MenuSection = {
  title: string;
  items: MenuItem[];
};

export type MenuPageModel = {
  sections: MenuSection[];
  showMasthead: boolean;
  showDisclosures: boolean;
  showFooter: boolean;
};

export function buildMenuPages(menu: CanonicalMenu): MenuPageModel[] {
  const sectionOrder: string[] = [];
  const bySection = new Map<string, MenuItem[]>();

  for (const item of menu.items) {
    if (!bySection.has(item.section)) {
      sectionOrder.push(item.section);
      bySection.set(item.section, []);
    }
    bySection.get(item.section)!.push(item);
  }

  const allSections: MenuSection[] = sectionOrder.map((title) => ({
    title,
    items: bySection.get(title) ?? [],
  }));

  // Page 1: cocktails + starters (+ early mains if short)
  // Page 2: remaining mains + dessert + disclosures
  const page1Titles = new Set(["Cocktails", "Starters"]);
  const page1 = allSections.filter((s) => page1Titles.has(s.title));
  const page2 = allSections.filter((s) => !page1Titles.has(s.title));

  // Fallback if sections don't match expected names
  if (page1.length === 0 || page2.length === 0) {
    const mid = Math.ceil(allSections.length / 2);
    return [
      {
        sections: allSections.slice(0, mid),
        showMasthead: true,
        showDisclosures: false,
        showFooter: false,
      },
      {
        sections: allSections.slice(mid),
        showMasthead: false,
        showDisclosures: true,
        showFooter: true,
      },
    ];
  }

  return [
    {
      sections: page1,
      showMasthead: true,
      showDisclosures: false,
      showFooter: false,
    },
    {
      sections: page2,
      showMasthead: false,
      showDisclosures: true,
      showFooter: true,
    },
  ];
}

function DietaryNote({ tags }: { tags?: MenuItem["dietaryTags"] }) {
  if (!tags?.length) return null;
  return (
    <p className="mt-0.5 text-[0.7rem] italic tracking-wide text-ink/45">
      {tags.map((t) => t.replaceAll("_", " ")).join(" · ")}
    </p>
  );
}

function MenuItemLine({ item }: { item: MenuItem }) {
  return (
    <li className="py-1.5">
      <div className="menu-item-row">
        <span className="text-[0.95rem] leading-snug text-ink">{item.name}</span>
        <span className="menu-item-dots" aria-hidden />
        <span className="font-mono text-[0.9rem] tabular-nums text-ink">
          {formatCents(item.priceCents)}
        </span>
      </div>
      <DietaryNote tags={item.dietaryTags} />
    </li>
  );
}

function Disclosures({
  disclosures,
  prixFixeNote,
}: {
  disclosures: FeeDisclosure[];
  prixFixeNote?: string;
}) {
  return (
    <div className="mt-auto border-t border-ink/15 pt-5">
      <p className="text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ink/55">
        Notices
      </p>
      <ul className="mt-3 space-y-2 text-center text-[0.78rem] leading-relaxed text-ink/70">
        {disclosures.map((fee, i) => (
          <li key={`${fee.kind}-${i}`}>
            <span className="capitalize">{formatFeeKind(fee.kind)}</span>
            {" · "}
            {fee.amountOrRate}
            {fee.purpose ? ` — ${fee.purpose}` : null}
          </li>
        ))}
        {prixFixeNote ? <li className="italic">{prixFixeNote}</li> : null}
      </ul>
    </div>
  );
}

export function MenuSheet({
  menu,
  page,
  pageNumber,
  totalPages,
  verified,
  version,
  updatedLabel,
}: {
  menu: CanonicalMenu;
  page: MenuPageModel;
  pageNumber: number;
  totalPages: number;
  verified: boolean;
  version: number;
  updatedLabel: string;
}) {
  return (
    <article
      className="menu-sheet relative flex h-full w-full flex-col overflow-hidden px-[8%] py-[7%]"
      aria-label={`${menu.restaurantName} menu page ${pageNumber}`}
    >
      {page.showMasthead ? (
        <header className="mb-7 text-center">
          <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.28em] text-accent">
            {verified ? "FeeSeal verified" : "FeeSeal"}
          </p>
          <h1 className="mt-3 text-[2rem] font-bold tracking-tight text-ink sm:text-[2.35rem]">
            {menu.restaurantName}
          </h1>
          <div className="mx-auto mt-3 h-px w-16 bg-accent/70" />
          <p className="mt-3 font-sans text-[0.7rem] uppercase tracking-[0.16em] text-ink/45">
            Dinner · {menu.jurisdiction} · v{version}
          </p>
          <p className="mt-1 font-sans text-[0.7rem] text-ink/40">
            Updated {updatedLabel}
          </p>
        </header>
      ) : (
        <header className="mb-6 flex items-baseline justify-between border-b border-ink/10 pb-3">
          <p className="text-sm font-bold tracking-wide text-ink">
            {menu.restaurantName}
          </p>
          <p className="font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink/40">
            Continued
          </p>
        </header>
      )}

      <div className="flex flex-1 flex-col gap-7">
        {page.sections.map((section) => (
          <section key={section.title}>
            <h2 className="mb-3 text-center text-[0.78rem] font-bold uppercase tracking-[0.22em] text-accent">
              {section.title}
            </h2>
            <ul>
              {section.items.map((item) => (
                <MenuItemLine key={item.id} item={item} />
              ))}
            </ul>
          </section>
        ))}

        {page.showDisclosures ? (
          <Disclosures
            disclosures={menu.feeDisclosures}
            prixFixeNote={menu.prixFixeNote}
          />
        ) : null}
      </div>

      {page.showFooter ? (
        <footer className="mt-6 flex items-end justify-between gap-4 border-t border-ink/10 pt-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center border border-ink/20"
              aria-hidden
            >
              <div className="grid h-10 w-10 grid-cols-5 gap-px opacity-50">
                {Array.from({ length: 25 }).map((_, i) => (
                  <span
                    key={i}
                    className={`bg-ink ${i % 3 === 0 || i % 7 === 0 ? "opacity-100" : "opacity-25"}`}
                  />
                ))}
              </div>
            </div>
            <p className="max-w-[10rem] font-sans text-[0.65rem] leading-snug text-ink/50">
              Scan for the sealed digital record of this menu.
            </p>
          </div>
          <p className="font-sans text-[0.65rem] tabular-nums text-ink/40">
            {pageNumber} / {totalPages}
          </p>
        </footer>
      ) : (
        <p className="mt-6 text-right font-sans text-[0.65rem] tabular-nums text-ink/35">
          {pageNumber} / {totalPages}
        </p>
      )}
    </article>
  );
}
