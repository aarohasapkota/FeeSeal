import type { FeeDisclosure } from "@shared/contracts";
import { formatFeeKind } from "@/lib/format";

type FeeDisclosureBlockProps = {
  disclosures: FeeDisclosure[];
};

export function FeeDisclosureBlock({ disclosures }: FeeDisclosureBlockProps) {
  if (disclosures.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
          Fee disclosures
        </h2>
        <p className="text-sm text-ink/60">No fee disclosures published.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/50">
        Fee disclosures
      </h2>
      <ul className="space-y-3">
        {disclosures.map((fee, index) => (
          <li
            key={`${fee.kind}-${index}`}
            className="border-l-2 border-accent pl-3"
          >
            <p className="font-medium capitalize text-ink">
              {formatFeeKind(fee.kind)} · {fee.amountOrRate}
            </p>
            <p className="mt-0.5 text-sm text-ink/65">
              {fee.purpose || (
                <span className="text-review">Purpose not provided</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
