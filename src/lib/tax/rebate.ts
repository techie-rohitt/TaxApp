import { REBATE_87A_NEW, REBATE_87A_OLD } from "./constants";
import type { Regime, RebateResult } from "./types";

/**
 * PRD §13.10. Three points this must get right:
 * 1. No marginal relief in the old regime — 87A there is strictly all-or-nothing at ₹5,00,000.
 * 2. Marginal relief is computed on tax BEFORE cess; cess is charged after, on the relieved figure.
 * 3. Relief applies only between total income of ₹12,00,000 and ~₹12,70,588 (NEW_MARGINAL_RELIEF_BREAKEVEN).
 */
export function applyRebate(
  regime: Regime,
  totalIncome: number,
  taxBeforeRebate: number,
): RebateResult {
  if (regime === "old") {
    const rebate =
      totalIncome <= REBATE_87A_OLD.incomeLimit
        ? Math.min(taxBeforeRebate, REBATE_87A_OLD.maxRebate)
        : 0;
    return { rebate, marginalRelief: 0, taxAfter: taxBeforeRebate - rebate };
  }

  // NEW REGIME
  if (totalIncome <= REBATE_87A_NEW.incomeLimit) {
    const rebate = Math.min(taxBeforeRebate, REBATE_87A_NEW.maxRebate);
    return { rebate, marginalRelief: 0, taxAfter: taxBeforeRebate - rebate };
  }

  // Above ₹12,00,000 → no rebate, but marginal relief may apply.
  const excess = totalIncome - REBATE_87A_NEW.marginalReliefThreshold;
  const relief = Math.max(0, taxBeforeRebate - excess);
  return { rebate: 0, marginalRelief: relief, taxAfter: taxBeforeRebate - relief };
}
