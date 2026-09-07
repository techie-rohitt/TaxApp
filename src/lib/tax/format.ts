/** Standard half-up rounding to the nearest `step` (s.288A / s.288B use step = 10). */
export function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export function formatINR(value: number): string {
  return inrFormatter.format(value);
}

const groupingFormatter = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** Lakh/crore-grouped digits with no currency symbol, e.g. "1,50,000" (PRD §7.5). */
export function formatIndianGrouping(value: number): string {
  return groupingFormatter.format(value);
}

/**
 * Accepts the paste formats PRD §7.5 requires: "1,50,000", "150000", "1.5L",
 * "1.5 lakh", "₹150000". Returns a rounded, non-negative integer rupee
 * amount — money is never negative (PRD §17.1, §24.3 rule 5).
 */
export function parseIndianMoneyInput(raw: string): number {
  const cleaned = raw.trim().toLowerCase().replace(/₹/g, "").replace(/,/g, "").trim();
  if (cleaned === "") return 0;

  const lakhMatch = cleaned.match(/^([\d.]+)\s*(l|lakh|lac)$/);
  if (lakhMatch) {
    const n = parseFloat(lakhMatch[1]);
    return Number.isFinite(n) ? Math.max(0, Math.round(n * 100_000)) : 0;
  }

  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : 0;
}
