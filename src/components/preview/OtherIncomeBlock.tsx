import type { FullTaxResult } from "../../lib/tax/compute";
import type { Computed } from "../../lib/tax/types";
import { TwoColumnBlock, type TwoColumnRow } from "./TwoColumnBlock";

/** PRD §9.2 Block 3 — other income and house property. */
export function OtherIncomeBlock({
  computed,
  oldResult,
  newResult,
}: {
  computed: Computed;
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
}) {
  const rows: TwoColumnRow[] = [
    { label: "Savings interest", old: computed.savingsInterest, new: computed.savingsInterest },
    { label: "FD / RD interest", old: computed.fdInterest, new: computed.fdInterest },
    { label: "Other income", old: computed.otherIncome, new: computed.otherIncome },
    {
      label: "Home loan interest (house you live in)",
      old: oldResult.houseIncome,
      new: "not-allowed",
    },
    { label: "Gross total income", old: oldResult.gti, new: newResult.gti, bold: true },
  ];

  return <TwoColumnBlock caption="Other income and house property" rows={rows} />;
}
