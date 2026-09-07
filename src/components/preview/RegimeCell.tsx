import { formatINR } from "../../lib/tax/format";

/** A row value in a two-column (old/new) comparison table: a signed rupee amount, or "not-allowed" for the new regime's disallowed items. */
export type RegimeCellValue = number | "not-allowed";

export function RegimeCell({ value }: { value: RegimeCellValue }) {
  if (value === "not-allowed") {
    return (
      <span className="text-xs text-[var(--text-faint)] line-through" title="Not allowed in this regime">
        Not allowed
      </span>
    );
  }
  if (value === 0) return <>—</>;
  return <>{value < 0 ? `−${formatINR(Math.abs(value))}` : formatINR(value)}</>;
}
