import {
  FEESEAL_DISCLAIMER,
  type CanonicalMenu,
  type ComparisonResult,
  type ExtractionDraft,
  type ExtractedFee,
  type ExtractedLine,
  type Finding,
  type MenuItem,
} from "@shared/contracts";

function normName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function namesSimilar(a: string, b: string): boolean {
  const na = normName(a);
  const nb = normName(b);
  if (!na || !nb) return false;
  if (na === nb) return true;
  return na.includes(nb) || nb.includes(na);
}

function findMenuItem(
  items: MenuItem[],
  line: ExtractedLine,
): MenuItem | undefined {
  return items.find((item) => namesSimilar(item.name, line.name));
}

function findLine(
  lines: ExtractedLine[],
  name: string,
): ExtractedLine | undefined {
  return lines.find((line) => namesSimilar(line.name, name));
}

function feeLooksLikeTax(fee: ExtractedFee): boolean {
  const label = fee.label.toLowerCase();
  return label.includes("tax") || label.includes("sales tax");
}

function feeLooksLikeGratuity(fee: ExtractedFee): boolean {
  const label = fee.label.toLowerCase();
  return (
    label.includes("gratuity") ||
    label.includes("tip") ||
    (label.includes("service") && label.includes("charge"))
  );
}

function normalizeRate(value: string): string {
  return value.replace(/\s+/g, "").toLowerCase();
}

function publishedFeeSummary(menu: CanonicalMenu): string {
  if (menu.feeDisclosures.length === 0) {
    return "no operations charge disclosed";
  }
  return menu.feeDisclosures
    .map((f) => `${f.amountOrRate} ${f.kind.replaceAll("_", " ")}`)
    .join("; ");
}

function feeMatchesDisclosure(
  fee: ExtractedFee,
  menu: CanonicalMenu,
): boolean {
  const rate = normalizeRate(fee.amountOrRate);
  return menu.feeDisclosures.some((d) => {
    const disclosed = normalizeRate(d.amountOrRate);
    return disclosed === rate || fee.label.toLowerCase().includes(d.kind.replaceAll("_", " "));
  });
}

/**
 * Deterministic A/B/C comparison. Vision extracts only; arithmetic lives here.
 * Language stays careful — never legal conclusions.
 */
export function compareSources(args: {
  menu: CanonicalMenu;
  physicalMenu: ExtractionDraft;
  receipt: ExtractionDraft;
}): ComparisonResult {
  const { menu, physicalMenu, receipt } = args;
  const findings: Finding[] = [];
  let id = 0;
  const nextId = (prefix: string) => `fnd_${prefix}_${++id}`;

  if (receipt.isPrixFixe || physicalMenu.isPrixFixe || menu.prixFixeNote) {
    findings.push({
      id: nextId("excluded"),
      comparison: "excluded",
      severity: "info",
      title: "Prix-fixe / package carve-out noted",
      detail:
        menu.prixFixeNote ||
        "A prix-fixe or package-style meal was indicated. Flagged as excluded from operations-charge comparison, not as a discrepancy.",
      passes: true,
    });
  }

  // A vs B — published vs physical menu prices
  for (const line of physicalMenu.lines) {
    const published = findMenuItem(menu.items, line);
    if (!published) {
      findings.push({
        id: nextId("ab_missing"),
        comparison: "A_vs_B",
        severity: "review",
        title: "Item on printed menu with no matching published item",
        detail: `Physical menu lists “${line.name}” at ${formatUsd(line.priceCents)}; no clear match was found on the published menu. Review recommended.`,
        itemName: line.name,
        observed: formatUsd(line.priceCents),
      });
      continue;
    }
    if (published.priceCents !== line.priceCents) {
      findings.push({
        id: nextId("ab_price"),
        comparison: "A_vs_B",
        severity: "difference",
        title: "Potential price difference on printed menu",
        detail: `Published ${published.name} is ${formatUsd(published.priceCents)}; physical menu shows ${formatUsd(line.priceCents)}. Review recommended — printed menu may be stale.`,
        itemName: published.name,
        expected: formatUsd(published.priceCents),
        observed: formatUsd(line.priceCents),
      });
    }
  }

  // A vs C — published vs receipt prices + fees
  for (const line of receipt.lines) {
    const published = findMenuItem(menu.items, line);
    if (!published) {
      findings.push({
        id: nextId("ac_missing"),
        comparison: "A_vs_C",
        severity: "review",
        title: "Item on receipt with no matching published item",
        detail: `Receipt lists “${line.name}” at ${formatUsd(line.priceCents)}; no clear match was found on the published menu. Review recommended.`,
        itemName: line.name,
        observed: formatUsd(line.priceCents),
      });
      continue;
    }
    if (published.priceCents !== line.priceCents) {
      findings.push({
        id: nextId("ac_price"),
        comparison: "A_vs_C",
        severity: "difference",
        title: "Potential price difference on bill",
        detail: `Published ${published.name} is ${formatUsd(published.priceCents)}; receipt billed ${formatUsd(line.priceCents)}. Review recommended.`,
        itemName: published.name,
        expected: formatUsd(published.priceCents),
        observed: formatUsd(line.priceCents),
      });
    }
  }

  for (const fee of receipt.fees) {
    if (feeLooksLikeTax(fee)) continue;

    const purposeMissing =
      fee.purpose !== undefined && fee.purpose.trim() === "";
    const matched = feeMatchesDisclosure(fee, menu);

    if (!matched) {
      findings.push({
        id: nextId("ac_fee"),
        comparison: "A_vs_C",
        severity: "difference",
        title: "No matching disclosure found for bill fee",
        detail: `Receipt includes ${fee.amountOrRate} “${fee.label}”. Published menu discloses: ${publishedFeeSummary(menu)}. Review recommended.`,
        itemName: fee.label,
        expected: publishedFeeSummary(menu),
        observed: `${fee.amountOrRate} ${fee.label}`,
      });
    } else if (purposeMissing) {
      findings.push({
        id: nextId("ac_purpose"),
        comparison: "A_vs_C",
        severity: "review",
        title: "Fee observed without a stated purpose",
        detail: `Receipt lists ${fee.amountOrRate} “${fee.label}” without a purpose in the extracted fields. Review recommended.`,
        itemName: fee.label,
        observed: `${fee.amountOrRate} ${fee.label}`,
      });
    }
  }

  // B vs C — physical menu vs receipt for shared items
  for (const receiptLine of receipt.lines) {
    const menuLine = findLine(physicalMenu.lines, receiptLine.name);
    if (!menuLine) continue;
    if (menuLine.priceCents !== receiptLine.priceCents) {
      findings.push({
        id: nextId("bc_price"),
        comparison: "B_vs_C",
        severity: "review",
        title: "Potential discrepancy between table menu and bill",
        detail: `Physical menu listed ${menuLine.name} at ${formatUsd(menuLine.priceCents)}; receipt billed ${formatUsd(receiptLine.priceCents)}.`,
        itemName: menuLine.name,
        expected: `${formatUsd(menuLine.priceCents)} (physical menu)`,
        observed: `${formatUsd(receiptLine.priceCents)} (receipt)`,
      });
    }
  }

  // Receipt layout checks (can pass)
  if (receipt.taxSeparate || receipt.fees.some(feeLooksLikeTax)) {
    findings.push({
      id: nextId("tax_ok"),
      comparison: "receipt_layout",
      severity: "info",
      title: "Sales tax on a separate receipt line",
      detail:
        "Receipt shows sales tax on its own line, which matches the expected layout check.",
      passes: true,
    });
  }

  if (
    receipt.operationsChargeSeparate ||
    receipt.fees.some(
      (f) =>
        !feeLooksLikeTax(f) &&
        !feeLooksLikeGratuity(f) &&
        f.label.toLowerCase().includes("operations"),
    )
  ) {
    findings.push({
      id: nextId("ops_line"),
      comparison: "receipt_layout",
      severity: "info",
      title: "Operations charge on a separate receipt line",
      detail:
        "An operations-style charge appears on its own receipt line in the extracted evidence.",
      passes: true,
    });
  }

  if (receipt.gratuitySeparate) {
    findings.push({
      id: nextId("grat_ok"),
      comparison: "receipt_layout",
      severity: "info",
      title: "Gratuity on a separate receipt line",
      detail:
        "Receipt shows gratuity on its own line, which matches the expected layout check.",
      passes: true,
    });
  }

  const actionable = findings.filter((f) => !f.passes && f.comparison !== "excluded");
  const checks = findings.length || 1;
  const passing = findings.filter((f) => f.passes).length;
  const matchRate = Math.max(
    0,
    Math.min(1, 1 - actionable.length / Math.max(checks, actionable.length + passing)),
  );

  return {
    findings,
    matchRate: Number(matchRate.toFixed(2)),
    disclaimer: FEESEAL_DISCLAIMER,
  };
}
