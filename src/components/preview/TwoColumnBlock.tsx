import { RegimeCell, type RegimeCellValue } from "./RegimeCell";

export interface TwoColumnRow {
  label: string;
  old: RegimeCellValue;
  new: RegimeCellValue;
  bold?: boolean;
}

/** Shared renderer for PRD §9.2's Blocks 1-4 — every one is this same old/new row shape. */
export function TwoColumnBlock({ caption, rows }: { caption: string; rows: TwoColumnRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <caption className="mb-2 text-left text-sm font-semibold">{caption}</caption>
        <thead>
          <tr className="text-left text-xs text-[var(--text-muted)]">
            <th scope="col" className="py-1 font-medium">
              Row
            </th>
            <th scope="col" className="py-1 text-right font-medium">
              Old regime
            </th>
            <th scope="col" className="py-1 text-right font-medium">
              New regime
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
              <td className={`py-1.5 ${row.bold ? "" : "text-[var(--text-muted)]"}`}>
                {row.label}
              </td>
              <td className="py-1.5 text-right tabular-nums">
                <RegimeCell value={row.old} />
              </td>
              <td className="py-1.5 text-right tabular-nums">
                <RegimeCell value={row.new} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
