import type { FullTaxResult } from "./compute";

const TIE_THRESHOLD = 1_000;

/** PRD §14.1 — ties go to the new regime: same money, less paperwork. */
export function pickWinner(oldResult: FullTaxResult, newResult: FullTaxResult) {
  const diff = oldResult.totalTax - newResult.totalTax; // positive => new is cheaper
  if (Math.abs(diff) <= TIE_THRESHOLD) {
    return { winner: "new" as const, saving: Math.abs(diff), verdict: "tie" as const };
  }
  return diff > 0
    ? { winner: "new" as const, saving: diff, verdict: "clear" as const }
    : { winner: "old" as const, saving: -diff, verdict: "clear" as const };
}
