import type { CanonicalMenu, MenuTemplateId } from "@shared/contracts";
import { BistroTwoColumnMenu } from "./BistroTwoColumnMenu";
import { ClassicSingleMenu } from "./ClassicSingleMenu";
import { EveningDenseMenu } from "./EveningDenseMenu";

export const TEMPLATE_META: {
  id: MenuTemplateId;
  name: string;
  blurb: string;
}[] = [
  {
    id: "classic_single",
    name: "Classic single",
    blurb: "Centered masthead, dotted price leaders — like a one-page PDF.",
  },
  {
    id: "bistro_two_column",
    name: "Bistro columns",
    blurb: "Two columns on a wide page; still a printed card, not a feed.",
  },
  {
    id: "evening_dense",
    name: "Evening dense",
    blurb: "Compact type so more of the menu fits on one screen.",
  },
];

export function PaperMenu({
  menu,
  verified = false,
  className,
}: {
  menu: CanonicalMenu;
  verified?: boolean;
  className?: string;
}) {
  switch (menu.templateId) {
    case "bistro_two_column":
      return (
        <BistroTwoColumnMenu
          menu={menu}
          verified={verified}
          className={className}
        />
      );
    case "evening_dense":
      return (
        <EveningDenseMenu
          menu={menu}
          verified={verified}
          className={className}
        />
      );
    case "classic_single":
    default:
      return (
        <ClassicSingleMenu
          menu={menu}
          verified={verified}
          className={className}
        />
      );
  }
}
