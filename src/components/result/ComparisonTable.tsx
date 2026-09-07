import type { FullTaxResult } from "../../lib/tax/compute";
import type { ChapterVIAOldResult } from "../../lib/tax/deductions";
import { formatINR } from "../../lib/tax/format";
import type { RegimeCellValue } from "../preview/RegimeCell";
import { RegimeCell } from "../preview/RegimeCell";

interface Row {
  label: string;
  old: RegimeCellValue;
  new: RegimeCellValue;
  /** "cost" rows (e.g. total tax) prefer the smaller number; "benefit" rows prefer the bigger one. */
  kind?: "benefit" | "cost";
  bold?: boolean;
}

function diffText(row: Row): string {
  if (row.old === "not-allowed" && row.new === "not-allowed") return "—";
  if (row.old === "not-allowed" || row.new === "not-allowed") {
    const value = (row.old === "not-allowed" ? row.new : row.old) as number;
    if (value === 0) return "—";
    const side = row.old === "not-allowed" ? "New" : "Old";
    return `${side} is better by ${formatINR(Math.abs(value))}`;
  }
  const o = row.old as number;
  const n = row.new as number;
  if (o === n) return "—";
  if (row.kind === "cost") {
    return o < n ? `Old saves ${formatINR(n - o)}` : `New saves ${formatINR(o - n)}`;
  }
  return o > n ? `Old is better by ${formatINR(o - n)}` : `New is better by ${formatINR(n - o)}`;
}

/** PRD §10.2 — the full side-by-side comparison, with a difference column. */
export function ComparisonTable({
  oldResult,
  newResult,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
}) {
  const oldDed = oldResult.deductions as ChapterVIAOldResult;

  const rows: Row[] = [
    { label: "Gross salary", old: oldResult.grossSalary, new: newResult.grossSalary },
    { label: "Tax-free HRA", old: oldResult.hraExempt, new: 0 },
    {
      label: "Standard deduction",
      old: oldResult.standardDeduction,
      new: newResult.standardDeduction,
    },
    { label: "Professional tax", old: oldResult.professionalTaxDeducted, new: "not-allowed" },
    { label: "Income from salary", old: oldResult.salaryIncome, new: newResult.salaryIncome },
    { label: "Home loan interest", old: oldResult.houseIncome, new: "not-allowed" },
    { label: "Other income", old: oldResult.otherIncome, new: newResult.otherIncome },
    { label: "Gross total income", old: oldResult.gti, new: newResult.gti },
    { label: "80C and related deductions", old: oldDed.ded80CCE, new: "not-allowed" },
    {
      label: "Employer's NPS deduction",
      old: oldDed.ded80CCD2,
      new: newResult.deductions.ded80CCD2,
    },
    { label: "Total deductions", old: oldResult.dedTotal, new: newResult.dedTotal },
    { label: "Taxable income", old: oldResult.totalIncome, new: newResult.totalIncome },
    {
      label: "Total tax",
      old: oldResult.totalTax,
      new: newResult.totalTax,
      kind: "cost",
      bold: true,
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="mb-3 text-left text-lg font-semibold">
          Side by side, in full
        </caption>
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)]">
            <th scope="col" className="py-2 font-medium">
              &nbsp;
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Old regime
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              New regime
            </th>
            <th scope="col" className="py-2 text-right font-medium">
              Difference
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.label}
              className={
                row.bold
                  ? "border-t border-[var(--border-strong)] font-semibold"
                  : "border-t border-[var(--border)]"
              }
            >
              <th
                scope="row"
                className={`py-2 text-left font-normal ${row.bold ? "font-semibold" : "text-[var(--text-muted)]"}`}
              >
                {row.label}
              </th>
              <td className="py-2 pl-3 text-right whitespace-nowrap tabular-nums">
                <RegimeCell value={row.old} />
              </td>
              <td className="py-2 pl-3 text-right whitespace-nowrap tabular-nums">
                <RegimeCell value={row.new} />
              </td>
              <td className="py-2 pl-3 text-right whitespace-nowrap text-[var(--text-muted)]">
                {diffText(row)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
