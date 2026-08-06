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

export type MenuSheetLayout = "letter" | "scroll";

export type MenuPageDensity = "desktop" | "tablet" | "phone";

function sectionsFromMenu(menu: CanonicalMenu): MenuSection[] {
  const sectionOrder: string[] = [];
  const bySection = new Map<string, MenuItem[]>();

  for (const item of menu.items) {
    if (!bySection.has(item.section)) {
      sectionOrder.push(item.section);
      bySection.set(item.section, []);
    }
    bySection.get(item.section)!.push(item);
  }

  return sectionOrder.map((title) => ({
    title,
    items: bySection.get(title) ?? [],
  }));
}

function finalizePages(
  chunks: MenuSection[][],
  menu: CanonicalMenu,
): MenuPageModel[] {
  if (chunks.length === 0) {
    return [
      {
        sections: [],
        showMasthead: true,
        showDisclosures: true,
        showFooter: true,
      },
    ];
  }

  return chunks.map((sections, index) => {
    const isFirst = index === 0;
    const isLast = index === chunks.length - 1;
    return {
      sections,
      showMasthead: isFirst,
      showDisclosures:
        isLast &&
        (menu.feeDisclosures.length > 0 || Boolean(menu.prixFixeNote)),
      showFooter: isLast,
    };
  });
}

/**
 * Pack sections into pages. Never splits a section across pages.
 * Density controls how many items fit before starting a new sheet.
 */
export function buildMenuPages(
  menu: CanonicalMenu,
  density: MenuPageDensity = "desktop",
): MenuPageModel[] {
  const allSections = sectionsFromMenu(menu);

  if (density === "desktop") {
    const page1Titles = new Set(["Cocktails", "Starters"]);
    const page1 = allSections.filter((s) => page1Titles.has(s.title));
    const page2 = allSections.filter((s) => !page1Titles.has(s.title));

    if (page1.length > 0 && page2.length > 0) {
      return finalizePages([page1, page2], menu);
    }

    const mid = Math.ceil(allSections.length / 2);
    return finalizePages(
      [allSections.slice(0, mid), allSections.slice(mid)],
      menu,
    );
  }

  const maxItems = density === "phone" ? 6 : 10;
  const chunks: MenuSection[][] = [];
  let current: MenuSection[] = [];
  let count = 0;

  for (const section of allSections) {
    const sectionSize = Math.max(section.items.length, 1);
    const wouldExceed =
      current.length > 0 && count + sectionSize > maxItems;

    if (wouldExceed) {
      chunks.push(current);
      current = [];
      count = 0;
    }

    current.push(section);
    count += sectionSize;
  }

  if (current.length > 0) chunks.push(current);
  return finalizePages(chunks, menu);
}

function DietaryNote({ tags }: { tags?: MenuItem["dietaryTags"] }) {
  if (!tags?.length) return null;
  return (
    <p className="mt-0.5 text-[0.7rem] italic tracking-wide text-ink/45 sm:text-[0.72rem]">
      {tags.map((t) => t.replaceAll("_", " ")).join(" · ")}
    </p>
  );
}

function MenuItemLine({ item }: { item: MenuItem }) {
  return (
    <li className="py-2 sm:py-1.5">
      <div className="menu-item-row">
        <span className="min-w-0 break-words text-[1rem] leading-snug text-ink sm:text-[0.95rem]">
          {item.name}
        </span>
        <span className="menu-item-dots" aria-hidden />
        <span className="shrink-0 font-mono text-[0.95rem] tabular-nums text-ink sm:text-[0.9rem]">
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
    <div className="mt-8 border-t border-ink/15 pt-5 sm:mt-auto">
      <p className="text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] text-ink/55">
        Notices
      </p>
      <ul className="mt-3 space-y-2.5 text-center text-[0.85rem] leading-relaxed text-ink/70 sm:text-[0.78rem]">
        {disclosures.map((fee, i) => (
          <li key={`${fee.kind}-${i}`} className="break-words px-1">
            <span className="capitalize">{formatFeeKind(fee.kind)}</span>
            {" · "}
            {fee.amountOrRate}
            {fee.purpose ? ` — ${fee.purpose}` : null}
          </li>
        ))}
        {prixFixeNote ? (
          <li className="break-words px-1 italic">{prixFixeNote}</li>
        ) : null}
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
  layout = "letter",
}: {
  menu: CanonicalMenu;
  page: MenuPageModel;
  pageNumber: number;
  totalPages: number;
  verified: boolean;
  version: number;
  updatedLabel: string;
  layout?: MenuSheetLayout;
}) {
  const isScroll = layout === "scroll";

  return (
    <article
      className={
        isScroll
          ? "menu-sheet menu-sheet-scroll relative flex w-full flex-col px-5 py-6 sm:px-7 sm:py-8"
          : "menu-sheet relative flex h-full w-full flex-col overflow-hidden px-[8%] py-[7%]"
      }
      aria-label={`${menu.restaurantName} menu page ${pageNumber}`}
    >
      {page.showMasthead ? (
        <header className="mb-6 text-center sm:mb-7">
          <p className="font-sans text-[0.65rem] font-medium uppercase tracking-[0.28em] text-accent">
            {verified ? "FeeSeal verified" : "FeeSeal"}
          </p>
          <h1 className="mt-3 break-words text-[1.75rem] font-bold tracking-tight text-ink sm:text-[2.35rem]">
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
        <header className="mb-5 flex items-baseline justify-between gap-3 border-b border-ink/10 pb-3 sm:mb-6">
          <p className="min-w-0 break-words text-sm font-bold tracking-wide text-ink">
            {menu.restaurantName}
          </p>
          <p className="shrink-0 font-sans text-[0.65rem] uppercase tracking-[0.14em] text-ink/40">
            Continued
          </p>
        </header>
      )}

      <div
        className={
          isScroll
            ? "flex flex-col gap-6 sm:gap-7"
            : "flex min-h-0 flex-1 flex-col gap-7"
        }
      >
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
        <footer className="mt-8 flex items-end justify-between gap-4 border-t border-ink/10 pt-4 sm:mt-6">
          <div className="flex min-w-0 items-end gap-3">
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
            <p className="min-w-0 font-sans text-[0.7rem] leading-snug text-ink/50 sm:max-w-[10rem] sm:text-[0.65rem]">
              Scan for the sealed digital record of this menu.
            </p>
          </div>
          <p className="shrink-0 font-sans text-[0.65rem] tabular-nums text-ink/40">
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
