import type { FullTaxResult } from "../../lib/tax/compute";
import { TwoColumnBlock, type TwoColumnRow } from "./TwoColumnBlock";

/** PRD §9.2 Block 2 — exemptions and salary deductions. */
export function ExemptionsBlock({
  oldResult,
  newResult,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
}) {
  const rows: TwoColumnRow[] = [
    { label: "Less: Tax-free HRA", old: -oldResult.hraExempt, new: "not-allowed" },
    { label: "Less: LTA", old: -oldResult.ltaExempt, new: "not-allowed" },
    {
      label: "Less: Standard deduction",
      old: -oldResult.standardDeduction,
      new: -newResult.standardDeduction,
    },
    {
      label: "Less: Professional tax",
      old: -oldResult.professionalTaxDeducted,
      new: "not-allowed",
    },
    {
      label: "Income from salary",
      old: oldResult.salaryIncome,
      new: newResult.salaryIncome,
      bold: true,
    },
  ];

  return <TwoColumnBlock caption="Exemptions and salary deductions" rows={rows} />;
}
