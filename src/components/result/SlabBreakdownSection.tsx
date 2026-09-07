import type { FullTaxResult } from "../../lib/tax/compute";
import type { SlabRow } from "../../lib/tax/types";
import { formatINR } from "../../lib/tax/format";
import { SlabTables } from "../preview/SlabTables";

function topReachedSlab(rows: SlabRow[]): SlabRow | undefined {
  return [...rows].reverse().find((r) => r.incomeInSlab > 0);
}

/** PRD §10.3 — narrates which bracket each regime's income actually reaches. */
function narrative(oldResult: FullTaxResult, newResult: FullTaxResult): string {
  const oldTop = topReachedSlab(oldResult.slabRows);
  const newTop = topReachedSlab(newResult.slabRows);
  if (!oldTop && !newTop) return "Neither regime reaches a taxable bracket for you.";
  if (!oldTop) {
    return `In the old regime none of your income is taxed. In the new regime, ${formatINR(newTop!.incomeInSlab)} falls in the ${(newTop!.rate * 100).toFixed(0)}% bracket.`;
  }
  if (!newTop) {
    return `In the old regime, ${formatINR(oldTop.incomeInSlab)} of your income falls in the ${(oldTop.rate * 100).toFixed(0)}% bracket. In the new regime none of your income is taxed.`;
  }
  if (oldTop.rate === newTop.rate) {
    return `Both regimes tax your last rupee at the same ${(oldTop.rate * 100).toFixed(0)}% rate.`;
  }
  const [higher, higherLabel, lower, lowerLabel] =
    oldTop.rate > newTop.rate
      ? [oldTop, "old", newTop, "new"]
      : [newTop, "new", oldTop, "old"];
  return `In the ${higherLabel} regime, ${formatINR(higher.incomeInSlab)} of your income falls in the ${(higher.rate * 100).toFixed(0)}% bracket. In the ${lowerLabel} regime, nothing does — the top rate you reach there is only ${(lower.rate * 100).toFixed(0)}%.`;
}

export function SlabBreakdownSection({
  oldResult,
  newResult,
  ageLabel,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
  ageLabel: string;
}) {
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Slab by slab</h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{narrative(oldResult, newResult)}</p>
      <SlabTables oldResult={oldResult} newResult={newResult} ageLabel={ageLabel} sideBySide />
    </div>
  );
}
