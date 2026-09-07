import type { FullTaxResult } from "../../lib/tax/compute";
import type { ChapterVIAOldResult } from "../../lib/tax/deductions";
import { TwoColumnBlock, type TwoColumnRow } from "./TwoColumnBlock";

/** PRD §9.2 Block 4 — Chapter VI-A deductions, both regimes. */
export function DeductionsBlock({
  oldResult,
  newResult,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
}) {
  const old = oldResult.deductions as ChapterVIAOldResult;

  const rows: TwoColumnRow[] = [
    { label: "80C — PF, PPF, ELSS, insurance, tuition", old: -old.ded80CCE, new: "not-allowed" },
    { label: "80CCD(1B) — your NPS", old: -old.ded80CCD1B, new: "not-allowed" },
    {
      label: "80CCD(2) — employer's NPS",
      old: -old.ded80CCD2,
      new: -newResult.deductions.ded80CCD2,
    },
    { label: "80D — health insurance", old: -old.ded80D, new: "not-allowed" },
    { label: "80TTA / 80TTB — interest", old: -old.ded80TT, new: "not-allowed" },
    { label: "80E — education loan", old: -old.ded80E, new: "not-allowed" },
    { label: "80G — donations", old: -old.ded80G, new: "not-allowed" },
    {
      label: "80DD / 80DDB / 80U",
      old: -(old.ded80DD + old.ded80U + old.ded80DDB),
      new: "not-allowed",
    },
    {
      label: "Total deductions",
      old: -oldResult.dedTotal,
      new: -newResult.dedTotal,
      bold: true,
    },
  ];

  return <TwoColumnBlock caption="Deductions (Chapter VI-A)" rows={rows} />;
}
