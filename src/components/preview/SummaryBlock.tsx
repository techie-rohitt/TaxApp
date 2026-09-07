import type { FullTaxResult } from "../../lib/tax/compute";
import { formatINR } from "../../lib/tax/format";

function Row({
  label,
  old,
  newValue,
  bold,
  badge,
}: {
  label: string;
  old: string;
  newValue: string;
  bold?: boolean;
  badge?: "old" | "new";
}) {
  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto_auto] items-start gap-x-2 gap-y-1 py-1 sm:gap-x-4 ${bold ? "font-semibold" : "text-sm"}`}
    >
      <span className={bold ? "" : "text-[var(--text-muted)]"}>{label}</span>
      <span className="text-right whitespace-nowrap tabular-nums">{old}</span>
      <span className="text-right whitespace-nowrap tabular-nums">{newValue}</span>
      {badge ? (
        <span
          className={`col-span-3 -mt-0.5 text-right text-xs ${badge === "old" ? "text-[var(--old-regime)]" : "text-[var(--new-regime)]"}`}
        >
          ✓ {badge === "old" ? "old regime is lower" : "new regime is lower"}
        </span>
      ) : null}
    </div>
  );
}

/** PRD §9.2 Blocks 5 and 7 — taxable income and the bottom line. */
export function SummaryBlock({
  oldResult,
  newResult,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
}) {
  const winner = oldResult.totalTax <= newResult.totalTax ? "old" : "new";

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] p-4">
      <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 pb-1 text-xs font-medium text-[var(--text-muted)]">
        <span />
        <span className="text-right">OLD</span>
        <span className="text-right">NEW</span>
      </div>
      <Row
        label="Taxable income"
        old={formatINR(oldResult.totalIncome)}
        newValue={formatINR(newResult.totalIncome)}
      />
      <Row
        label="Total tax for the year"
        old={formatINR(oldResult.totalTax)}
        newValue={formatINR(newResult.totalTax)}
        bold
        badge={winner}
      />
      <Row
        label="Tax per month"
        old={formatINR(oldResult.monthlyTax)}
        newValue={formatINR(newResult.monthlyTax)}
      />
      <Row
        label="Take-home per month"
        old={formatINR(oldResult.monthlyTakeHome)}
        newValue={formatINR(newResult.monthlyTakeHome)}
      />
    </div>
  );
}
