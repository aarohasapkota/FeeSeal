import { FEESEAL_DISCLAIMER } from "@shared/contracts";

type DisclaimerProps = {
  className?: string;
};

export function Disclaimer({ className = "" }: DisclaimerProps) {
  return (
    <p
      className={`border-l-2 border-ink/20 pl-3 text-sm leading-relaxed text-ink/60 ${className}`}
      role="note"
    >
      {FEESEAL_DISCLAIMER}
    </p>
  );
}
