import { HRA_METRO_RATE, HRA_NON_METRO_RATE, HRA_RENT_OFFSET } from "./constants";

export interface HraExemptionInput {
  hraReceivedAnnual: number;
  /** PRD §13.2 simplification: treated as just basic (plus DA if the user folded DA into it). */
  basicPlusDaAnnual: number;
  rentPaidAnnual: number;
  /** Four-city list only for FY 2025-26 (PRD §11.2, §8.2) — a frequent source of bugs elsewhere. */
  isMetro: boolean;
}

export interface HraExemptionResult {
  exempt: number;
  /** The three limbs in order, unclamped — limb 3 can be negative; callers display it as-is so the user sees why they got nothing (E9). */
  limbs: [number, number, number];
  winningLimb: 1 | 2 | 3;
}

/** PRD §13.2 — Section 10(13A) read with Rule 2A. Old regime only; never called for the new regime (exemption is a hard zero there). */
export function hraExemption(input: HraExemptionInput): HraExemptionResult {
  if (input.hraReceivedAnnual <= 0 || input.rentPaidAnnual <= 0) {
    return { exempt: 0, limbs: [input.hraReceivedAnnual, 0, 0], winningLimb: 1 };
  }

  const limb1 = input.hraReceivedAnnual;
  const limb2 = input.basicPlusDaAnnual * (input.isMetro ? HRA_METRO_RATE : HRA_NON_METRO_RATE);
  const limb3 = input.rentPaidAnnual - input.basicPlusDaAnnual * HRA_RENT_OFFSET;

  const limbs: [number, number, number] = [limb1, limb2, limb3];
  const minValue = Math.min(limb1, limb2, limb3);
  const winningLimb = (limbs.indexOf(minValue) + 1) as 1 | 2 | 3;

  return { exempt: Math.max(0, minValue), limbs, winningLimb };
}
