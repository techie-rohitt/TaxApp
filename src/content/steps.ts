import type { WizardInputs } from "../lib/tax/types";

// PRD §8 step map.
export interface WizardStepMeta {
  id: string;
  title: string;
  required: boolean;
  /** PRD §7.3 — fields to zero out when "Skip this — doesn't apply to me" is used. Only optional steps need this. */
  skipDefaults?: Partial<WizardInputs>;
}

export const WIZARD_STEPS: WizardStepMeta[] = [
  { id: "salary", title: "Your salary", required: true },
  { id: "about-you", title: "About you", required: true },
  { id: "salary-structure", title: "Your salary structure", required: true },
  {
    id: "rent",
    title: "Rent and HRA",
    required: false,
    skipDefaults: {
      paysRent: false,
      monthlyRent: 0,
      rentPaidWholeYear: "",
      monthsRentPaid: 12,
      hasHRAComponent: "",
      monthlyHRA: 0,
    },
  },
  {
    id: "investments",
    title: "Savings and investments",
    required: false,
    skipDefaults: {
      lifeInsurance: 0,
      ppf: 0,
      elss: 0,
      tuitionFees: 0,
      taxSavingFD: 0,
      sukanya: 0,
      homeLoanPrincipal: 0,
      stampDuty: 0,
      nscOther: 0,
    },
  },
  {
    id: "health",
    title: "Health insurance and medical",
    required: false,
    skipDefaults: {
      healthPremiumSelf: 0,
      healthPremiumParents: 0,
      parentsAreSenior: "",
      preventiveCheckup: 0,
      parentsMedicalExpenditure: 0,
      disabilityDependant: "none",
      disabilitySelf: "none",
      specifiedIllnessSpend: 0,
      illnessPatientIsSenior: false,
    },
  },
  {
    id: "home-nps",
    title: "Home loan and NPS",
    required: false,
    skipDefaults: {
      hasHomeLoan: false,
      propertyUse: "",
      homeLoanInterestAnnual: 0,
      homeLoanPrincipal: 0,
      hasNPS: false,
      ownNPS: 0,
      employerContributesNPS: "",
      employerNPSMonthly: 0,
    },
  },
  {
    id: "other-income",
    title: "Interest and other income",
    required: false,
    skipDefaults: {
      savingsInterest: 0,
      fdInterest: 0,
      otherIncome: 0,
      donations: 0,
      donationRate: "",
      educationLoanInterest: 0,
    },
  },
];
