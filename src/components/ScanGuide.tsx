type ScanGuideProps = {
  source: "physical_menu" | "receipt";
};

export function ScanGuide({ source }: ScanGuideProps) {
  const isMenu = source === "physical_menu";

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded border border-dashed border-accent/40 bg-gradient-to-b from-white to-accent/5">
        <div
          className="pointer-events-none absolute inset-6 rounded border-2 border-accent/50"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-8 text-center">
          <p className="font-medium text-ink">
            {isMenu ? "Frame the printed menu" : "Frame the full receipt"}
          </p>
          <p className="text-sm text-ink/60">
            Hold steady · avoid glare · fill the guide
          </p>
        </div>
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent/20"
          aria-hidden
        />
      </div>
      <ul className="space-y-1.5 text-sm text-ink/65">
        <li>Lay the document flat under even light.</li>
        <li>Tilt slightly if you see reflections on the laminate.</li>
        <li>
          {isMenu
            ? "Include prices and any printed fee notes."
            : "Include line items, fees, tax, and totals."}
        </li>
      </ul>
    </div>
  );
}
