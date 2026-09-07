import {
  EPF_EMPLOYEE_RATE,
  EPF_WAGE_CEILING_MONTHLY,
  HRA_METRO_RATE,
  HRA_NON_METRO_RATE,
  PROF_TAX_ANNUAL_CAP,
} from "./constants";
import { chapterVIAOld, type ChapterVIAOldResult } from "./deductions";
import { roundToNearest } from "./format";
import { hraExemption, type HraExemptionResult } from "./hra";
import { deriveGrossSalary, type GrossSalaryResult } from "./solver";
import type { Computed, WizardInputs } from "./types";

export type BasicSource = "user" | "derivedFromPF" | "estimated";

export interface BasicSalaryResult {
  value: number;
  source: BasicSource;
  /** True if the derivation would have exceeded gross and had to be clamped (E29). */
  clamped: boolean;
}

/**
 * PRD §13.1 / §11.3 priority order. `grossMonthly` is supplied by the caller
 * rather than computed here, since gross salary and basic salary can be
 * mutually dependent (see `deriveSalaryStructure` below) — this function
 * only ever resolves basic for a *given* gross.
 *
 * Note the PF branch deliberately excludes exactly ₹1,800: that figure is
 * the statutory PF wage ceiling showing through, not evidence of what basic
 * actually is (E28) — the UI forces the user to answer 3.4 directly instead.
 */
export function resolveBasicMonthly(inputs: WizardInputs, grossMonthly: number): BasicSalaryResult {
  let value: number;
  let source: BasicSource;

  if (inputs.basicKnown === true && inputs.basicMonthly > 0) {
    value = inputs.basicMonthly;
    source = "user";
  } else if (inputs.pfDeducted === true && inputs.pfMonthly > 0 && inputs.pfMonthly !== 1_800) {
    value = roundToNearest(inputs.pfMonthly / EPF_EMPLOYEE_RATE, 10);
    source = "derivedFromPF";
  } else {
    value = grossMonthly * inputs.basicSharePercent;
    source = "estimated";
  }

  if (value > grossMonthly && grossMonthly > 0) {
    return { value: grossMonthly, source, clamped: true };
  }
  return { value, source, clamped: false };
}

/** PRD §13.1. */
export function resolveEmployeePFAnnual(inputs: WizardInputs, basicMonthly: number): number {
  if (inputs.pfDeducted !== true) return 0;
  if (inputs.pfMonthly > 0) return inputs.pfMonthly * 12;

  if (inputs.pfCappingChoice === "capped1800") {
    return Math.min(basicMonthly, EPF_WAGE_CEILING_MONTHLY) * EPF_EMPLOYEE_RATE * 12;
  }
  return basicMonthly * EPF_EMPLOYEE_RATE * 12;
}

/** PRD §8.2 fields 2.3/2.4. Uncapped — `computeTax` applies the ₹2,500 annual cap itself. */
export function resolveProfessionalTaxAnnual(inputs: WizardInputs): number {
  if (inputs.paysProfessionalTax !== true) return 0;
  return inputs.professionalTaxMonthly * 12;
}

export interface SalaryStructureResult {
  grossSalary: GrossSalaryResult;
  basic: BasicSalaryResult;
  employeePFAnnual: number;
  professionalTaxAnnual: number;
  professionalTaxCapped: boolean;
}

/**
 * Basic salary (when estimated as a share of gross) depends on gross salary;
 * employee PF depends on basic; and gross salary — via the back-solver —
 * depends on employee PF. Three fixed-point passes resolve this: PF is a
 * small share of gross, so it converges within a rupee well before that.
 */
export function deriveSalaryStructure(inputs: WizardInputs): SalaryStructureResult {
  const professionalTaxAnnual = resolveProfessionalTaxAnnual(inputs);

  let grossSalary = deriveGrossSalary({
    ...inputs,
    ageBand: inputs.ageBand,
    monthlyProfTax: professionalTaxAnnual / 12,
    monthlyEmployeePF: 0,
  });
  let basic = resolveBasicMonthly(inputs, grossSalary.annualGross / 12);
  let employeePFAnnual = resolveEmployeePFAnnual(inputs, basic.value);

  for (let i = 0; i < 3; i++) {
    grossSalary = deriveGrossSalary({
      ...inputs,
      ageBand: inputs.ageBand,
      monthlyProfTax: professionalTaxAnnual / 12,
      monthlyEmployeePF: employeePFAnnual / 12,
    });
    basic = resolveBasicMonthly(inputs, grossSalary.annualGross / 12);
    employeePFAnnual = resolveEmployeePFAnnual(inputs, basic.value);
  }

  return {
    grossSalary,
    basic,
    employeePFAnnual,
    professionalTaxAnnual,
    professionalTaxCapped: professionalTaxAnnual > PROF_TAX_ANNUAL_CAP,
  };
}

export type HraSource = "user" | "estimated" | "none";

export interface RentBenefitResult {
  /** False when the user doesn't pay rent at all — nothing here is meaningful. */
  applicable: boolean;
  annualRent: number;
  hraReceivedAnnual: number;
  hraSource: HraSource;
  exemption: HraExemptionResult;
  /** hraReceivedAnnual − exemption.exempt. Already inside gross salary; shown, not added again. */
  taxableHRA: number;
}

const NOT_APPLICABLE: RentBenefitResult = {
  applicable: false,
  annualRent: 0,
  hraReceivedAnnual: 0,
  hraSource: "none",
  exemption: { exempt: 0, limbs: [0, 0, 0], winningLimb: 1 },
  taxableHRA: 0,
};

/**
 * PRD §8.4 + §13.2, old regime only. `basicMonthly` comes from
 * `deriveSalaryStructure` (Step 3) — the same resolved figure everywhere,
 * never recomputed differently in two places.
 */
export function deriveRentBenefit(
  inputs: WizardInputs,
  basicMonthly: number,
  isMetro: boolean,
): RentBenefitResult {
  if (inputs.paysRent !== true) return NOT_APPLICABLE;

  const monthsPaid = inputs.rentPaidWholeYear === false ? inputs.monthsRentPaid : 12;
  const annualRent = inputs.monthlyRent * monthsPaid;

  let hraReceivedAnnual = 0;
  let hraSource: HraSource = "none";
  if (inputs.hasHRAComponent === "yesKnown") {
    hraReceivedAnnual = inputs.monthlyHRA * 12;
    hraSource = "user";
  } else if (inputs.hasHRAComponent === "yesUnknown") {
    const rate = isMetro ? HRA_METRO_RATE : HRA_NON_METRO_RATE;
    hraReceivedAnnual = basicMonthly * rate * 12;
    hraSource = "estimated";
  }

  const basicPlusDaAnnual = basicMonthly * 12;
  const exemption = hraExemption({
    hraReceivedAnnual,
    basicPlusDaAnnual,
    rentPaidAnnual: annualRent,
    isMetro,
  });

  return {
    applicable: true,
    annualRent,
    hraReceivedAnnual,
    hraSource,
    exemption,
    taxableHRA: hraReceivedAnnual - exemption.exempt,
  };
}

/**
 * PRD §8.5 wired up to §13.6's 80CCE basket. `employeePFAnnual` and
 * `basicMonthly` come from `deriveSalaryStructure` (Step 3) — the same
 * resolved figures everywhere, never recomputed differently in two places.
 * Own NPS (§8.7, Phase 9) is always 0 until that step exists.
 */
export function deriveChapterVIAOld(
  inputs: WizardInputs,
  employeePFAnnual: number,
  basicMonthly: number,
): ChapterVIAOldResult {
  return chapterVIAOld({
    employeePFAnnual,
    lifeInsurance: inputs.lifeInsurance,
    ppf: inputs.ppf,
    elss: inputs.elss,
    tuitionFees: inputs.tuitionFees,
    taxSavingFD: inputs.taxSavingFD,
    sukanya: inputs.sukanya,
    nscOther: inputs.nscOther,
    homeLoanPrincipal: inputs.homeLoanPrincipal,
    stampDuty: inputs.stampDuty,
    ownNPS: 0,
    basicPlusDaAnnual: basicMonthly * 12,
    ageBand: inputs.ageBand,
    healthPremiumSelf: inputs.healthPremiumSelf,
    healthPremiumParents: inputs.healthPremiumParents,
    parentsAreSenior: inputs.parentsAreSenior === true,
    preventiveCheckup: inputs.preventiveCheckup,
    parentsMedicalExpenditure: inputs.parentsMedicalExpenditure,
    disabilityDependant: inputs.disabilityDependant,
    disabilitySelf: inputs.disabilitySelf,
    specifiedIllnessSpend: inputs.specifiedIllnessSpend,
    illnessPatientIsSenior: inputs.illnessPatientIsSenior,
    // Not yet known this early in the wizard (Step 7/8) — the live indicators
    // on steps 3-6 don't need them; `computeFullTax` uses the real figures.
    employerNPSAnnual: 0,
    isGovtEmployee: false,
    savingsInterest: 0,
    fdInterest: 0,
    educationLoanInterest: 0,
    donations: 0,
    donationRate: 0.5,
  });
}

/** PRD §8.7 field 7.6 — a direct monthly figure, never derived from basic. */
export function resolveOwnNPSAnnual(inputs: WizardInputs): number {
  if (inputs.hasNPS !== true) return 0;
  return inputs.ownNPS;
}

/**
 * PRD §8.7 field 7.8 — also a direct monthly figure. Unlike employee PF,
 * this never touches take-home pay at all, so it plays no part in the
 * back-solver (§12) — it's simply added to gross salary afterwards (§13.8).
 */
export function resolveEmployerNPSAnnual(inputs: WizardInputs): number {
  if (inputs.employerContributesNPS !== true) return 0;
  return inputs.employerNPSMonthly * 12;
}

/**
 * PRD §15's `Computed` — every derived figure resolved exactly once, from
 * the same building blocks the standalone step-level derivations already
 * use (`deriveSalaryStructure`, `deriveRentBenefit`). This is what
 * `computeFullTax` consumes for both regimes.
 */
export function deriveComputed(inputs: WizardInputs): Computed {
  const structure = deriveSalaryStructure(inputs);
  const isMetro = inputs.cityType === "metro";
  const rentBenefit = deriveRentBenefit(inputs, structure.basic.value, isMetro);
  const employerNPSAnnual = resolveEmployerNPSAnnual(inputs);
  const ownNPSAnnual = resolveOwnNPSAnnual(inputs);

  return {
    ...inputs,
    basicMonthly: structure.basic.value,
    basicSource: structure.basic.source,
    basicPlusDaAnnual: structure.basic.value * 12,
    employeePFAnnual: structure.employeePFAnnual,
    employerNPSAnnual,
    ownNPSAnnual,
    professionalTaxAnnualResolved: structure.professionalTaxAnnual,
    annualRent: rentBenefit.annualRent,
    hraReceivedAnnual: rentBenefit.hraReceivedAnnual,
    hraExempt: rentBenefit.exemption.exempt,
    hraLimbs: rentBenefit.exemption.limbs,
    hraWinningLimb: rentBenefit.exemption.winningLimb,
    isMetro,
    // Employer NPS never touches take-home pay, so the solver never sees it —
    // it's added on top of the take-home-derived base gross here (§13.8).
    annualGross: structure.grossSalary.annualGross + employerNPSAnnual,
    grossDerivation: structure.grossSalary.derivation,
    grossAmbiguous: structure.grossSalary.ambiguous,
  };
}
