export type AgeBand = "below60" | "senior" | "superSenior";
export type Regime = "old" | "new";

/**
 * Phase 2 engine input: salary-only. No HRA, no house property, no Chapter
 * VI-A yet — those terms are hard-zeroed in `computeTax` until later phases
 * build them out. This is a deliberate subset of the full `Computed` shape
 * from PRD §15, which later phases grow into.
 */
export interface SalaryOnlyInput {
  annualGrossSalary: number;
  ageBand: AgeBand;
  professionalTaxAnnual: number;
}

export interface SlabRow {
  from: number;
  to: number; // Infinity for the top slab
  rate: number;
  incomeInSlab: number;
  taxInSlab: number;
}

export interface RebateResult {
  rebate: number;
  marginalRelief: number;
  taxAfter: number;
}

export interface TaxResult {
  regime: Regime;
  grossSalary: number;
  standardDeduction: number;
  professionalTaxDeducted: number;
  salaryIncome: number;
  totalIncome: number;
  slabRows: SlabRow[];
  taxBeforeRebate: number;
  rebate: number;
  marginalRelief: number;
  cess: number;
  totalTax: number;
}

export type TdsKnowledge = "known" | "unknownAmount" | "none" | "unsure";

/**
 * PRD §15. This is the single wizard-wide input shape and grows one step at a
 * time — each phase that builds a wizard step adds that step's fields here.
 * Right now it holds only Step 1 (§8.1); Step 2 onward are added as their
 * phases land.
 */
export type CityType = "metro" | "other";
export type PfCappingChoice = "capped1800" | "twelvePercent" | "dontKnow";

export interface WizardInputs {
  // Step 1 — §8.1
  monthlyInHand: number;
  tdsKnowledge: TdsKnowledge | "";
  monthlyTDS: number;
  employerRegime: Regime | "unknown";
  annualBonus: number;
  otherTaxableSalary: number;

  // Step 2 — §8.2
  ageBand: AgeBand;
  cityType: CityType | "";
  paysProfessionalTax: boolean | "unsure" | "";
  professionalTaxMonthly: number;

  // Step 3 — §8.3
  pfDeducted: boolean | "unsure" | "";
  /** 0 means "left blank" — nobody's real known PF deduction is ₹0 (PRD §8.3 3.2b is gated on this). */
  pfMonthly: number;
  pfCappingChoice: PfCappingChoice | "";
  basicKnown: boolean | "";
  /** 0 means "not entered". */
  basicMonthly: number;
  basicSharePercent: number;

  // Step 4 — §8.4
  paysRent: boolean | "";
  monthlyRent: number;
  /** "" = unanswered, only meaningful when paysRent === true. */
  rentPaidWholeYear: boolean | "";
  monthsRentPaid: number;
  hasHRAComponent: HasHRAComponent | "";
  /** Used only when hasHRAComponent === "yesKnown". */
  monthlyHRA: number;

  // Step 5 — §8.5 (all annual; the 80CCE/80C basket)
  lifeInsurance: number;
  ppf: number;
  elss: number;
  tuitionFees: number;
  taxSavingFD: number;
  sukanya: number;
  /** Plain input until Step 7 (Phase 9) exists and auto-links it. */
  homeLoanPrincipal: number;
  stampDuty: number;
  nscOther: number;

  // Step 6 — §8.6
  healthPremiumSelf: number;
  healthPremiumParents: number;
  /** "" = unanswered, only meaningful when healthPremiumParents > 0. */
  parentsAreSenior: boolean | "";
  preventiveCheckup: number;
  /** Shown only when parentsAreSenior === true and healthPremiumParents === 0 (E32). */
  parentsMedicalExpenditure: number;
  disabilityDependant: Disability;
  disabilitySelf: Disability;
  specifiedIllnessSpend: number;
  illnessPatientIsSenior: boolean;

  // Step 7 — §8.7
  hasHomeLoan: boolean | "";
  propertyUse: PropertyUse | "";
  homeLoanInterestAnnual: number;
  hasNPS: boolean | "";
  /** Own NPS contribution — feeds 80CCD(1B)/80CCE. */
  ownNPS: number;
  employerContributesNPS: boolean | "unsure" | "";
  employerNPSMonthly: number;
  /** Not asked in the wizard (no UI question exists for it) — always false, i.e. private-sector rates apply. */
  isGovtEmployee: boolean;

  // Step 8 — §8.8
  savingsInterest: number;
  fdInterest: number;
  otherIncome: number;
  donations: number;
  /** "" = unanswered/not applicable; 0.5 used when the user says "I'm not sure". */
  donationRate: 1 | 0.5 | "";
  educationLoanInterest: number;
}

export type HasHRAComponent = "yesKnown" | "yesUnknown" | "no";
export type Disability = "none" | "normal" | "severe";
export type PropertyUse = "selfOccupied" | "letOut" | "underConstruction";

/**
 * PRD §15's `Computed` — `WizardInputs` plus everything derived from it.
 * Produced once per render by `deriveComputed` and fed to `computeFullTax`
 * for both regimes; nothing recomputes these values a second, different way.
 */
export interface Computed extends WizardInputs {
  basicMonthly: number; // resolved, not the raw §8.3 answer
  basicSource: "user" | "derivedFromPF" | "estimated";
  basicPlusDaAnnual: number;
  employeePFAnnual: number;
  employerNPSAnnual: number;
  ownNPSAnnual: number;
  professionalTaxAnnualResolved: number;
  annualRent: number;
  hraReceivedAnnual: number;
  hraExempt: number;
  hraLimbs: [number, number, number];
  hraWinningLimb: 1 | 2 | 3;
  isMetro: boolean;
  /** Base gross (from the take-home solve) + employer NPS. */
  annualGross: number;
  grossDerivation: "exact" | "solved" | "fallback";
  grossAmbiguous: boolean;
}
