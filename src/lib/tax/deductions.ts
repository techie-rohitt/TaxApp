import {
  LIMIT_80C,
  LIMIT_80CCD_1B,
  LIMIT_80D_PARENTS_60_PLUS,
  LIMIT_80D_PARENTS_BELOW_60,
  LIMIT_80D_PREVENTIVE,
  LIMIT_80D_SELF_60_PLUS,
  LIMIT_80D_SELF_BELOW_60,
  LIMIT_80DD_NORMAL,
  LIMIT_80DD_SEVERE,
  LIMIT_80DDB_NORMAL,
  LIMIT_80DDB_SENIOR,
  LIMIT_80TTA,
  LIMIT_80TTB,
  LIMIT_80U_NORMAL,
  LIMIT_80U_SEVERE,
  RATE_80CCD_1_SALARIED,
  RATE_80CCD_2_NEW,
  RATE_80CCD_2_OLD_GOVT,
  RATE_80CCD_2_OLD_PRIVATE,
} from "./constants";
import type { AgeBand, Disability } from "./types";

export interface ChapterVIAOldInput {
  /** Already counts towards the 80CCE basket — never asked for twice (E11). */
  employeePFAnnual: number;
  lifeInsurance: number;
  ppf: number;
  elss: number;
  tuitionFees: number;
  taxSavingFD: number;
  sukanya: number;
  nscOther: number;
  homeLoanPrincipal: number;
  stampDuty: number;
  /** Own NPS contribution (§8.7). */
  ownNPS: number;
  basicPlusDaAnnual: number;

  /** Self's age band — sets the 80D self cap (₹25,000 / ₹50,000) and the 80TTA/80TTB choice. */
  ageBand: AgeBand;
  healthPremiumSelf: number;
  healthPremiumParents: number;
  parentsAreSenior: boolean;
  preventiveCheckup: number;
  /** Only meaningful when parentsAreSenior && healthPremiumParents === 0 (E32). */
  parentsMedicalExpenditure: number;
  disabilityDependant: Disability;
  disabilitySelf: Disability;
  specifiedIllnessSpend: number;
  illnessPatientIsSenior: boolean;

  /** Employer's NPS contribution (§8.7) — already added to gross salary elsewhere; deducted again here up to the cap. */
  employerNPSAnnual: number;
  /** No UI question asks for this — always false (private-sector rate applies). */
  isGovtEmployee: boolean;

  savingsInterest: number;
  fdInterest: number;
  educationLoanInterest: number;
  donations: number;
  /** Already resolved to 1 or 0.5 by the caller (§8.8's "I'm not sure" → 0.5). */
  donationRate: number;
}

export interface ChapterVIAOldResult {
  /** Everything that competes for the shared ₹1.5L basket, before the cap. */
  raw80C: number;
  /** Own NPS allocated to the scarce, non-shared ₹50,000 slot outside 80CCE. */
  ded80CCD1B: number;
  /** The 80CCE basket itself (80C + 80CCC + 80CCD(1)), capped at ₹1.5 lakh. */
  ded80CCE: number;
  /** raw80C (plus any NPS spillover) beyond the ₹1.5L cap — bought no extra tax benefit (E10). */
  excess80C: number;
  ded80D: number;
  ded80DD: number;
  ded80U: number;
  ded80DDB: number;
  ded80CCD2: number;
  ded80TT: number;
  ded80E: number;
  ded80G: number;
  /** Sum of every deduction this function accounts for, clamped to GTI (s.80A(2), E17). */
  total: number;
}

/**
 * PRD §13.6 — the old regime's full Chapter VI-A basket. `gti` clamps the
 * total per s.80A(2) so Chapter VI-A can never create a refundable loss
 * (E17); pass `Infinity` (the default) when GTI isn't known yet, e.g. for a
 * standalone preview block shown before later steps exist.
 */
export function chapterVIAOld(
  input: ChapterVIAOldInput,
  gti: number = Infinity,
): ChapterVIAOldResult {
  const raw80C =
    input.employeePFAnnual +
    input.lifeInsurance +
    input.ppf +
    input.elss +
    input.tuitionFees +
    input.taxSavingFD +
    input.sukanya +
    input.nscOther +
    input.homeLoanPrincipal +
    input.stampDuty;

  const ded80CCD1B = Math.min(input.ownNPS, LIMIT_80CCD_1B);
  const nSpill = input.ownNPS - ded80CCD1B;
  const cap80CCD1 = input.basicPlusDaAnnual * RATE_80CCD_1_SALARIED;
  const ded80CCD1 = Math.min(nSpill, cap80CCD1);

  const combined = raw80C + ded80CCD1;
  const ded80CCE = Math.min(LIMIT_80C, combined);
  const excess80C = Math.max(0, combined - LIMIT_80C);

  // --- 80D ---
  const capSelf = input.ageBand === "below60" ? LIMIT_80D_SELF_BELOW_60 : LIMIT_80D_SELF_60_PLUS;
  const capParents = input.parentsAreSenior
    ? LIMIT_80D_PARENTS_60_PLUS
    : LIMIT_80D_PARENTS_BELOW_60;
  const preventive = Math.min(input.preventiveCheckup, LIMIT_80D_PREVENTIVE);
  // Preventive check-ups sit INSIDE the caps — apportion to the self bucket first (E31).
  const selfSide = Math.min(capSelf, input.healthPremiumSelf + preventive);
  const parentsSide = Math.min(
    capParents,
    input.healthPremiumParents + input.parentsMedicalExpenditure,
  );
  const ded80D = selfSide + parentsSide;

  // --- flat-amount deductions ---
  const ded80DD =
    input.disabilityDependant === "severe"
      ? LIMIT_80DD_SEVERE
      : input.disabilityDependant === "normal"
        ? LIMIT_80DD_NORMAL
        : 0;
  const ded80U =
    input.disabilitySelf === "severe"
      ? LIMIT_80U_SEVERE
      : input.disabilitySelf === "normal"
        ? LIMIT_80U_NORMAL
        : 0;
  const ded80DDB = Math.min(
    input.specifiedIllnessSpend,
    input.illnessPatientIsSenior ? LIMIT_80DDB_SENIOR : LIMIT_80DDB_NORMAL,
  );

  // --- 80CCD(2): employer NPS ---
  const rate80CCD2 = input.isGovtEmployee ? RATE_80CCD_2_OLD_GOVT : RATE_80CCD_2_OLD_PRIVATE;
  const ded80CCD2 = Math.min(input.employerNPSAnnual, input.basicPlusDaAnnual * rate80CCD2);

  // --- 80TTA / 80TTB (mutually exclusive, E14/E15) ---
  const ded80TT =
    input.ageBand === "below60"
      ? Math.min(input.savingsInterest, LIMIT_80TTA)
      : Math.min(input.savingsInterest + input.fdInterest, LIMIT_80TTB);

  const ded80E = input.educationLoanInterest; // no cap
  const ded80G = input.donations * input.donationRate; // qualifying-limit test out of scope (§8.8)

  const total =
    ded80CCE +
    ded80CCD1B +
    ded80CCD2 +
    ded80D +
    ded80TT +
    ded80DD +
    ded80U +
    ded80DDB +
    ded80E +
    ded80G;

  return {
    raw80C,
    ded80CCD1B,
    ded80CCE,
    excess80C,
    ded80D,
    ded80DD,
    ded80U,
    ded80DDB,
    ded80CCD2,
    ded80TT,
    ded80E,
    ded80G,
    total: Math.min(total, Math.max(0, gti)),
  };
}

export interface ChapterVIANewResult {
  ded80CCD2: number;
  total: number;
}

/**
 * PRD §13.7 — the new regime's ONLY deduction. Nothing else (not 80C, not
 * 80D, not 80TTA, not 80E, not 80G) is ever applied here.
 */
export function chapterVIANew(
  employerNPSAnnual: number,
  basicPlusDaAnnual: number,
  gti: number = Infinity,
): ChapterVIANewResult {
  const ded80CCD2 = Math.min(employerNPSAnnual, basicPlusDaAnnual * RATE_80CCD_2_NEW);
  return { ded80CCD2, total: Math.min(ded80CCD2, Math.max(0, gti)) };
}
