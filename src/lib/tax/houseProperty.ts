import { LIMIT_24B_SELF_OCCUPIED, LIMIT_HP_LOSS_SETOFF } from "./constants";
import type { PropertyUse, Regime } from "./types";

export interface HousePropertyInput {
  hasHomeLoan: boolean;
  propertyUse: PropertyUse | "";
  homeLoanInterestAnnual: number;
}

/**
 * PRD §13.4 — self-occupied home loan interest only (let-out and
 * under-construction properties are out of scope, §3.2). Returns a negative
 * number (a loss) or 0; never called for a positive figure.
 */
export function houseProperty(regime: Regime, input: HousePropertyInput): number {
  if (!input.hasHomeLoan || input.propertyUse !== "selfOccupied") return 0;
  if (regime === "new") return 0; // s.115BAC bars it entirely

  const interest = Math.min(input.homeLoanInterestAnnual, LIMIT_24B_SELF_OCCUPIED);
  return -Math.min(interest, LIMIT_HP_LOSS_SETOFF);
}
