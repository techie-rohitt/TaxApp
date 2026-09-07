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
      className={`grid grid-cols-[1fr_auto_auto] items-baseline gap-x-4 gap-y-1 py-1 ${bold ? "font-semibold" : "text-sm"}`}
    >
      <span className={bold ? "" : "text-[var(--text-muted)]"}>{label}</span>
      <span className="text-right tabular-nums">
        {old}
        {badge === "old" ? <span className="ml-1 text-xs text-[var(--old-regime)]">✓ lower</span> : null}
      </span>
      <span className="text-right tabular-nums">
        {newValue}
        {badge === "new" ? <span className="ml-1 text-xs text-[var(--new-regime)]">✓ lower</span> : null}
      </span>
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
