import type { SlabRow } from "./types";

interface SlabDef {
  upTo: number;
  rate: number;
}

/**
 * PRD §13.9. Every slab row is returned, including ones with zero income in
 * them — the UI must always render the whole ladder, not just the reached
 * part of it.
 */
export function slabTax(taxableIncome: number, slabs: readonly SlabDef[]): SlabRow[] {
  const rows: SlabRow[] = [];
  let lower = 0;
  for (const s of slabs) {
    const upper = Math.min(taxableIncome, s.upTo);
    const incomeInSlab = Math.max(0, upper - lower);
    rows.push({
      from: lower,
      to: s.upTo,
      rate: s.rate,
      incomeInSlab,
      taxInSlab: incomeInSlab * s.rate,
    });
    lower = s.upTo;
  }
  return rows;
}
