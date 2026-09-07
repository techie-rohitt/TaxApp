import type { FullTaxResult } from "../../lib/tax/compute";
import { formatINR } from "../../lib/tax/format";

function SlabTable({ label, result }: { label: string; result: FullTaxResult }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm font-semibold">{label}</caption>
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)]">
            <th scope="col" className="py-1 font-medium">
              Slab
            </th>
            <th scope="col" className="py-1 text-right font-medium">
              Rate
            </th>
            <th scope="col" className="py-1 text-right font-medium">
              Income here
            </th>
            <th scope="col" className="py-1 text-right font-medium">
              Tax
            </th>
          </tr>
        </thead>
        <tbody>
          {result.slabRows.map((row) => (
            <tr key={row.from} className="border-t border-[var(--border)]">
              <td className="py-1 pr-2 whitespace-nowrap tabular-nums">
                {row.to === Infinity
                  ? `Above ${formatINR(row.from)}`
                  : `${formatINR(row.from)} – ${formatINR(row.to)}`}
              </td>
              <td className="py-1 pl-2 text-right whitespace-nowrap tabular-nums">
                {(row.rate * 100).toFixed(0)}%
              </td>
              <td className="py-1 pl-2 text-right whitespace-nowrap tabular-nums">
                {formatINR(row.incomeInSlab)}
              </td>
              <td className="py-1 pl-2 text-right whitespace-nowrap tabular-nums">
                {formatINR(row.taxInSlab)}
              </td>
            </tr>
          ))}
          <tr className="border-t border-[var(--border)]">
            <td colSpan={3} className="py-1 text-[var(--text-muted)]">
              Tax before rebate
            </td>
            <td className="py-1 text-right whitespace-nowrap tabular-nums">{formatINR(result.taxBeforeRebate)}</td>
          </tr>
          {result.rebate > 0 ? (
            <tr>
              <td colSpan={3} className="py-1 text-[var(--text-muted)]">
                Less: Rebate u/s 87A
              </td>
              <td className="py-1 text-right whitespace-nowrap tabular-nums">−{formatINR(result.rebate)}</td>
            </tr>
          ) : null}
          {result.marginalRelief > 0 ? (
            <tr>
              <td colSpan={3} className="py-1 text-[var(--text-muted)]">
                Less: Marginal relief
              </td>
              <td className="py-1 text-right whitespace-nowrap tabular-nums">
                −{formatINR(result.marginalRelief)}
              </td>
            </tr>
          ) : null}
          <tr>
            <td colSpan={3} className="py-1 text-[var(--text-muted)]">
              Health &amp; Education Cess @ 4%
            </td>
            <td className="py-1 text-right whitespace-nowrap tabular-nums">{formatINR(result.cess)}</td>
          </tr>
          <tr className="border-t border-[var(--border-strong)] font-semibold">
            <td colSpan={3} className="py-1.5">
              TOTAL TAX
            </td>
            <td className="py-1.5 text-right whitespace-nowrap tabular-nums">{formatINR(result.totalTax)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/**
 * PRD §9.2 Block 6 / §10.3 — slab-by-slab tables, both regimes, every row
 * rendered. Stacked by default (the preview sidebar is too narrow for side
 * by side); pass `sideBySide` for the full-width result page.
 */
export function SlabTables({
  oldResult,
  newResult,
  ageLabel,
  sideBySide = false,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
  ageLabel: string;
  sideBySide?: boolean;
}) {
  return (
    <div className={sideBySide ? "grid gap-8 md:grid-cols-2" : "flex flex-col gap-6"}>
      <SlabTable label={`OLD REGIME — ${ageLabel}`} result={oldResult} />
      <SlabTable label="NEW REGIME" result={newResult} />
    </div>
  );
}
