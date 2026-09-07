import { computeFullTax } from "./compute";
import type { Computed, Regime } from "./types";

/**
 * PRD §21.1 — derived numerically (bump gross by ₹10,000, compare tax) so
 * marginal relief and rebate cliffs are automatically handled, rather than
 * read off the slab table where they'd be wrong right at a cliff edge.
 */
export function marginalRate(regime: Regime, computed: Computed): number {
  const base = computeFullTax(regime, computed).totalTax;
  const bumped = computeFullTax(regime, {
    ...computed,
    annualGross: computed.annualGross + 10_000,
  }).totalTax;
  return (bumped - base) / 10_000;
}
