import extractFixture from "@fixtures/menu.extract.from_photo.json";
import type {
  ExtractionDraft,
  FeeDisclosure,
  FeeKind,
  MenuExtractItem,
  MenuExtractResult,
} from "@shared/contracts";

const FEE_KINDS: FeeKind[] = [
  "operations_charge",
  "automatic_gratuity",
  "credit_card_surcharge",
  "other",
];

function fixtureMenuExtract(): MenuExtractResult {
  return {
    ...(extractFixture as MenuExtractResult),
    source: "fixture",
  };
}

function parsePriceToCents(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (raw >= 100 && Number.isInteger(raw)) return raw;
    return Math.round(raw * 100);
  }
  if (typeof raw !== "string") return null;
  const cleaned = raw.replace(/[^0-9.]/g, "");
  if (!cleaned) return null;
  const dollars = Number.parseFloat(cleaned);
  if (!Number.isFinite(dollars)) return null;
  return Math.round(dollars * 100);
}

function normalizeFee(raw: unknown): FeeDisclosure | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const kindRaw = String(obj.kind ?? "other");
  const kind = FEE_KINDS.includes(kindRaw as FeeKind)
    ? (kindRaw as FeeKind)
    : "other";
  const amountOrRate = String(obj.amountOrRate ?? obj.amount ?? "").trim();
  if (!amountOrRate) return null;
  return {
    kind,
    amountOrRate,
    purpose: String(obj.purpose ?? "").trim(),
  };
}

function normalizeExtractPayload(parsed: unknown): MenuExtractResult | null {
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;
  const itemsRaw = Array.isArray(obj.items) ? obj.items : null;
  if (!itemsRaw || itemsRaw.length === 0) return null;

  const items: MenuExtractItem[] = [];
  for (const row of itemsRaw) {
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const name = String(r.name ?? "").trim();
    const section = String(r.section ?? "Menu").trim() || "Menu";
    const priceCents = parsePriceToCents(r.priceCents ?? r.price);
    if (!name || priceCents === null) continue;
    items.push({
      section,
      name,
      priceCents,
      description:
        typeof r.description === "string" && r.description.trim()
          ? r.description.trim()
          : undefined,
      confidence:
        typeof r.confidence === "number" ? r.confidence : undefined,
    });
  }

  if (items.length === 0) return null;

  const feesRaw = Array.isArray(obj.feeDisclosures)
    ? obj.feeDisclosures
    : [];
  const feeDisclosures = feesRaw
    .map(normalizeFee)
    .filter((f): f is FeeDisclosure => f !== null);

  return {
    restaurantNameGuess:
      typeof obj.restaurantNameGuess === "string"
        ? obj.restaurantNameGuess.trim()
        : undefined,
    items,
    feeDisclosures,
    source: "vision",
  };
}

async function blobToDataUrl(image: Blob): Promise<string> {
  const buffer = Buffer.from(await image.arrayBuffer());
  const mime = image.type || "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

/**
 * Restaurant publish path: photo → sections, items, prices, fee disclosures.
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise fixture.
 */
export async function extractMenuFromPhoto(args: {
  image: Blob;
}): Promise<MenuExtractResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fixtureMenuExtract();
  }

  try {
    const dataUrl = await blobToDataUrl(args.image);
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "Extract a restaurant menu from the image. Return JSON only with keys: restaurantNameGuess (string|null), items (array of {section, name, priceCents integer USD cents, description optional, confidence 0-1}), feeDisclosures (array of {kind: operations_charge|automatic_gratuity|credit_card_surcharge|other, amountOrRate string, purpose string}). Prices must be integer cents. If a fee has no purpose, use empty string.",
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Extract all menu items with sections and prices, plus any operations charges or service fees disclosed on the menu.",
              },
              {
                type: "image_url",
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      console.error("OpenAI menu extract failed", await response.text());
      return fixtureMenuExtract();
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return fixtureMenuExtract();

    const normalized = normalizeExtractPayload(JSON.parse(content));
    return normalized ?? fixtureMenuExtract();
  } catch (err) {
    console.error("extractMenuFromPhoto error", err);
    return fixtureMenuExtract();
  }
}

/** Diner scan path — extraction only; comparison stays in lib/compare. */
export async function extractFromImage(args: {
  image: Blob;
  source: ExtractionDraft["source"];
}): Promise<ExtractionDraft> {
  const menu = await extractMenuFromPhoto({ image: args.image });
  return {
    source: args.source,
    lines: menu.items.map((item) => ({
      name: item.name,
      priceCents: item.priceCents,
      confidence: item.confidence,
    })),
    fees: menu.feeDisclosures.map((fee) => ({
      label: fee.kind.replaceAll("_", " "),
      amountOrRate: fee.amountOrRate,
      purpose: fee.purpose,
    })),
  };
}
