import type { GrossSalaryDerivation } from "../../lib/tax/solver";
import { CheckIcon } from "../icons";
import { TwoColumnBlock, type TwoColumnRow } from "./TwoColumnBlock";

/** PRD §9.2 Block 1 — income. Identical in both regimes; nothing here differs until deductions. */
export function IncomeBlock({
  grossDerivation,
  annualBonus,
  otherTaxableSalary,
  employerNPSAnnual,
  annualGross,
}: {
  grossDerivation: GrossSalaryDerivation;
  annualBonus: number;
  otherTaxableSalary: number;
  employerNPSAnnual: number;
  annualGross: number;
}) {
  const annualSalaryRecurring = annualGross - annualBonus - otherTaxableSalary - employerNPSAnnual;
  const monthlyGross = Math.round(annualGross / 12);

  const rows: TwoColumnRow[] = [
    { label: "Monthly salary (gross)", old: monthlyGross, new: monthlyGross },
    { label: "Annual salary", old: annualSalaryRecurring, new: annualSalaryRecurring },
    { label: "Bonus / variable", old: annualBonus, new: annualBonus },
    {
      label: "Employer NPS added to salary",
      old: employerNPSAnnual,
      new: employerNPSAnnual,
    },
    { label: "Gross salary", old: annualGross, new: annualGross, bold: true },
  ];

  return (
    <div>
      <TwoColumnBlock caption="Your income" rows={rows} />
      {grossDerivation === "exact" ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-[var(--new-regime)]">
          <CheckIcon width={12} height={12} /> Exact — from your entered TDS
        </p>
      ) : null}
    </div>
  );
}
