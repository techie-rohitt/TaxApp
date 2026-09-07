import type { RentBenefitResult } from "../../lib/tax/derive";
import { formatINR } from "../../lib/tax/format";

/** PRD §9.2 — the dedicated rent-benefit block shown while step 4 is in view. */
export function RentBenefitBlock({
  rentBenefit,
  isMetro,
}: {
  rentBenefit: RentBenefitResult;
  isMetro: boolean;
}) {
  if (!rentBenefit.applicable) return null;

  const { limbs, winningLimb, exempt } = rentBenefit.exemption;
  const rows: { n: 1 | 2 | 3; label: string; value: number }[] = [
    { n: 1, label: "HRA you receive", value: limbs[0] },
    {
      n: 2,
      label: `${isMetro ? "50" : "40"}% of your basic (${isMetro ? "metro" : "non-metro"})`,
      value: limbs[1],
    },
    { n: 3, label: "Rent paid − 10% of basic", value: limbs[2] },
  ];

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] p-4">
      <p className="mb-2 text-sm font-semibold">Your rent benefit (old regime only)</p>
      <div className="flex flex-col gap-1 text-sm">
        {rows.map((row) => (
          <div key={row.n} className="flex items-baseline justify-between gap-4">
            <span className="text-[var(--text-muted)]">
              {row.n}. {row.label}
            </span>
            <span className="shrink-0 tabular-nums">
              {formatINR(row.value)}
              {row.n === winningLimb ? (
                <span className="ml-1 text-xs text-[var(--accent-text)]">← lowest, so this is used</span>
              ) : null}
            </span>
          </div>
        ))}
        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-[var(--border-strong)] pt-1.5 font-semibold">
          <span>Tax-free HRA</span>
          <span className="tabular-nums">{formatINR(exempt)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 text-[var(--text-muted)]">
          <span>Taxable HRA</span>
          <span className="tabular-nums">{formatINR(rentBenefit.taxableHRA)}</span>
        </div>
      </div>
    </div>
  );
}
