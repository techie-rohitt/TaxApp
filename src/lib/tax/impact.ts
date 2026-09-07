import { computeFullTax } from "./compute";
import { LIMIT_80CCD_1B, STD_DEDUCTION_NEW, STD_DEDUCTION_OLD } from "./constants";
import { deriveComputed } from "./derive";
import { formatINR } from "./format";
import { marginalRate } from "./marginalRate";
import type { AgeBand, WizardInputs } from "./types";
import { pickWinner } from "./verdict";

export interface ImpactCard {
  key: string;
  title: string;
  oldImpact: number;
  newImpact: number;
  body: string;
}

export interface ExplanationResult {
  summary: string;
  cards: ImpactCard[];
}

const MIN_IMPACT = 100;

/**
 * PRD §20.1 — a true counterfactual: re-derive the whole `Computed` shape
 * with the given fields patched (usually zeroed), not just swap one field
 * in place. Zeroing `pfMonthly`, for instance, must also change the derived
 * basic salary if basic came from PF — only a full re-derivation gets that
 * right.
 */
function impactOf(inputs: WizardInputs, patch: Partial<WizardInputs>) {
  const base = deriveComputed(inputs);
  const without = deriveComputed({ ...inputs, ...patch });
  const baseOld = computeFullTax("old", base).totalTax;
  const baseNew = computeFullTax("new", base).totalTax;
  const withoutOld = computeFullTax("old", without).totalTax;
  const withoutNew = computeFullTax("new", without).totalTax;
  return { oldImpact: withoutOld - baseOld, newImpact: withoutNew - baseNew };
}

const LIMB_NAMES: Record<1 | 2 | 3, string> = {
  1: "the HRA you receive",
  2: "a share of your basic salary",
  3: "your rent minus 10% of your basic",
};

const AGE_LIMITS: Record<AgeBand, number> = {
  below60: 2_50_000,
  senior: 3_00_000,
  superSenior: 5_00_000,
};
const AGE_DESCRIPTIONS: Record<AgeBand, string> = {
  below60: "under 60",
  senior: "60 to 79",
  superSenior: "80 or above",
};

const EIGHTY_C_LABELS: [keyof WizardInputs, string][] = [
  ["lifeInsurance", "life insurance"],
  ["ppf", "PPF"],
  ["elss", "ELSS"],
  ["tuitionFees", "tuition fees"],
  ["taxSavingFD", "a tax-saving FD"],
  ["sukanya", "Sukanya Samriddhi"],
  ["homeLoanPrincipal", "home loan principal"],
  ["stampDuty", "stamp duty"],
  ["nscOther", "NSC/other savings"],
];

function buildCard(
  key: string,
  title: string,
  impact: { oldImpact: number; newImpact: number },
  body: string,
): ImpactCard | null {
  if (Math.abs(impact.oldImpact) < MIN_IMPACT && Math.abs(impact.newImpact) < MIN_IMPACT) {
    return null;
  }
  return { key, title, oldImpact: impact.oldImpact, newImpact: impact.newImpact, body };
}

/** PRD §20 — "what each of your answers did". */
export function buildExplanation(inputs: WizardInputs): ExplanationResult {
  const computed = deriveComputed(inputs);
  const oldResult = computeFullTax("old", computed);
  const newResult = computeFullTax("new", computed);
  const cards: ImpactCard[] = [];

  // Rent / HRA
  if (computed.paysRent === true) {
    const impact = impactOf(inputs, {
      paysRent: false,
      monthlyRent: 0,
      rentPaidWholeYear: "",
      monthsRentPaid: 12,
      hasHRAComponent: "",
      monthlyHRA: 0,
    });
    const card = buildCard(
      "rent",
      `Your rent of ${formatINR(computed.monthlyRent)} a month`,
      impact,
      `You pay ${formatINR(computed.monthlyRent)} a month in rent and receive ${formatINR(
        Math.round(computed.hraReceivedAnnual / 12),
      )} of HRA. The law made ${formatINR(computed.hraExempt)} of that HRA tax-free — it picked the smallest of three figures, and in your case the winner was ${LIMB_NAMES[computed.hraWinningLimb]}. In the new regime this benefit doesn't exist at all, which is worth ${formatINR(impact.oldImpact)} to you.`,
    );
    if (card) cards.push(card);
  }

  // 80C basket
  const raw80CUser =
    computed.lifeInsurance +
    computed.ppf +
    computed.elss +
    computed.tuitionFees +
    computed.taxSavingFD +
    computed.sukanya +
    computed.homeLoanPrincipal +
    computed.stampDuty +
    computed.nscOther;
  if (raw80CUser > 0) {
    const impact = impactOf(inputs, {
      lifeInsurance: 0,
      ppf: 0,
      elss: 0,
      tuitionFees: 0,
      taxSavingFD: 0,
      sukanya: 0,
      homeLoanPrincipal: 0,
      stampDuty: 0,
      nscOther: 0,
    });
    const itemList = EIGHTY_C_LABELS.filter(([field]) => (computed[field] as number) > 0)
      .map(([, label]) => label)
      .join(", ");
    const deductions = oldResult.deductions as { ded80CCE: number; excess80C: number };
    const overflowLine =
      deductions.excess80C > 0
        ? ` You went ${formatINR(deductions.excess80C)} over the limit, and that portion did nothing for your tax.`
        : "";
    const card = buildCard(
      "80c",
      "Your 80C investments",
      impact,
      `You put ${formatINR(raw80CUser)} into things that qualify for the ₹1.5 lakh limit — ${itemList}. That cut your old-regime tax by ${formatINR(impact.oldImpact)}.${overflowLine}`,
    );
    if (card) cards.push(card);
  }

  // 80D
  const healthTotal =
    computed.healthPremiumSelf +
    computed.healthPremiumParents +
    computed.preventiveCheckup +
    computed.parentsMedicalExpenditure;
  if (healthTotal > 0) {
    const impact = impactOf(inputs, {
      healthPremiumSelf: 0,
      healthPremiumParents: 0,
      preventiveCheckup: 0,
      parentsMedicalExpenditure: 0,
    });
    const ded80D = (oldResult.deductions as { ded80D: number }).ded80D;
    const capLine =
      ded80D < healthTotal
        ? `only ${formatINR(ded80D)} of it counted — the rest was above your limit`
        : `all of it was within your limit`;
    const card = buildCard(
      "80d",
      "Your health insurance",
      impact,
      `Your health insurance premiums of ${formatINR(healthTotal)} reduced your old-regime tax by ${formatINR(impact.oldImpact)}. Your limit was ${formatINR(ded80D)} — ${capLine}.`,
    );
    if (card) cards.push(card);
  }

  // Home loan interest
  if (
    computed.hasHomeLoan === true &&
    computed.propertyUse === "selfOccupied" &&
    computed.homeLoanInterestAnnual > 0
  ) {
    const impact = impactOf(inputs, { homeLoanInterestAnnual: 0 });
    const allowed = Math.min(computed.homeLoanInterestAnnual, 2_00_000);
    const card = buildCard(
      "homeLoanInterest",
      "Your home loan interest",
      impact,
      `You paid ${formatINR(computed.homeLoanInterestAnnual)} of home loan interest. ${formatINR(allowed)} of it was allowed as a deduction, saving you ${formatINR(impact.oldImpact)} in the old regime. In the new regime a home loan on the house you live in gives you nothing.`,
    );
    if (card) cards.push(card);
  }

  // Own NPS
  if (computed.hasNPS === true && computed.ownNPS > 0) {
    const impact = impactOf(inputs, { ownNPS: 0 });
    const cd1b = Math.min(computed.ownNPS, LIMIT_80CCD_1B);
    const card = buildCard(
      "ownNPS",
      "Your own NPS contribution",
      impact,
      `Your own NPS contribution of ${formatINR(computed.ownNPS)} saved ${formatINR(impact.oldImpact)}. ${formatINR(cd1b)} of it went into the special ₹50,000 slot that sits outside the ₹1.5 lakh limit.`,
    );
    if (card) cards.push(card);
  }

  // Employer NPS
  if (computed.employerNPSAnnual > 0) {
    const impact = impactOf(inputs, { employerContributesNPS: false, employerNPSMonthly: 0 });
    const card = buildCard(
      "employerNPS",
      "Your employer's NPS contribution",
      impact,
      `Your employer put ${formatINR(computed.employerNPSAnnual)} into your NPS. This is the one deduction that works in both regimes — it saved you ${formatINR(impact.oldImpact)} in the old regime and ${formatINR(impact.newImpact)} in the new one.`,
    );
    if (card) cards.push(card);
  }

  // Professional tax
  if (computed.paysProfessionalTax === true && computed.professionalTaxAnnualResolved > 0) {
    const impact = impactOf(inputs, { paysProfessionalTax: false, professionalTaxMonthly: 0 });
    const card = buildCard(
      "professionalTax",
      "Your professional tax",
      impact,
      `The ${formatINR(computed.professionalTaxAnnualResolved)} of professional tax on your payslip is deductible in the old regime — worth ${formatINR(impact.oldImpact)}. The new regime doesn't allow it.`,
    );
    if (card) cards.push(card);
  }

  // Interest income
  const interestTotal = computed.savingsInterest + computed.fdInterest;
  if (interestTotal > 0) {
    const impact = impactOf(inputs, { savingsInterest: 0, fdInterest: 0 });
    const ded80TT = (oldResult.deductions as { ded80TT: number }).ded80TT;
    const section = computed.ageBand === "below60" ? "80TTA" : "80TTB";
    const card = buildCard(
      "interestIncome",
      "Your bank interest",
      impact,
      `Your ${formatINR(interestTotal)} of bank interest added to your taxable income in both regimes. In the old regime, ${formatINR(ded80TT)} of it was deductible under ${section}, saving ${formatINR(impact.oldImpact)}.`,
    );
    if (card) cards.push(card);
  }

  // Standard deduction — a structural fact of the two regimes, not a user answer to zero out.
  {
    const diff = Math.round(
      (STD_DEDUCTION_NEW - STD_DEDUCTION_OLD) * marginalRate("new", computed),
    );
    if (Math.abs(diff) >= MIN_IMPACT) {
      cards.push({
        key: "standardDeduction",
        title: "The standard deduction",
        oldImpact: 0,
        newImpact: diff,
        body: `Everyone with a salary gets a flat deduction: ${formatINR(STD_DEDUCTION_OLD)} in the old regime and ${formatINR(STD_DEDUCTION_NEW)} in the new. That extra ${formatINR(STD_DEDUCTION_NEW - STD_DEDUCTION_OLD)} in the new regime is worth ${formatINR(diff)} to you.`,
      });
    }
  }

  // Age band
  if (computed.ageBand !== "below60") {
    const impact = impactOf(inputs, { ageBand: "below60" });
    const extra = AGE_LIMITS[computed.ageBand] - AGE_LIMITS.below60;
    const card = buildCard(
      "age",
      "Your age",
      impact,
      `Because you're ${AGE_DESCRIPTIONS[computed.ageBand]}, the old regime lets you earn ${formatINR(AGE_LIMITS[computed.ageBand])} before any tax starts — ${formatINR(extra)} more than someone under 60. That's worth ${formatINR(impact.oldImpact)}. The new regime gives everyone the same ₹4 lakh regardless of age.`,
    );
    if (card) cards.push(card);
  }

  // Bonus
  if (computed.annualBonus > 0) {
    const impact = impactOf(inputs, { annualBonus: 0 });
    cards.push({
      key: "bonus",
      title: "Your bonus",
      oldImpact: impact.oldImpact,
      newImpact: impact.newImpact,
      body: `Your ${formatINR(computed.annualBonus)} bonus is taxed exactly like salary. It added ${formatINR(-impact.oldImpact)} to your old-regime tax and ${formatINR(-impact.newImpact)} to your new-regime tax.`,
    });
  }

  cards.sort((a, b) => Math.max(Math.abs(b.oldImpact), Math.abs(b.newImpact)) - Math.max(Math.abs(a.oldImpact), Math.abs(a.newImpact)));

  const { winner, saving: margin } = pickWinner(oldResult, newResult);
  const top = cards[0];
  let summary = "";
  if (top) {
    const topImpact = winner === "old" ? top.oldImpact : top.newImpact;
    const decisive = Math.abs(topImpact) >= margin;
    summary = `The single biggest thing in your case is ${top.title.toLowerCase()}. It's worth ${formatINR(top.oldImpact)} in the old regime and ${formatINR(top.newImpact)} in the new one${
      decisive
        ? ` — and that alone is why the ${winner} regime wins for you.`
        : `, but it isn't enough on its own — the ${winner} regime still comes out ahead.`
    }`;
  }

  return { summary, cards };
}
