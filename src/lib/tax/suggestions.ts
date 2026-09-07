import { computeFullTax } from "./compute";
import {
  LIMIT_80C,
  LIMIT_80CCD_1B,
  LIMIT_80D_PARENTS_60_PLUS,
  LIMIT_80D_PARENTS_BELOW_60,
  LIMIT_80D_SELF_60_PLUS,
  LIMIT_80D_SELF_BELOW_60,
  LIMIT_80TTB,
  NEW_MARGINAL_RELIEF_BREAKEVEN,
  RATE_80CCD_2_NEW,
  REBATE_87A_NEW,
} from "./constants";
import { deriveComputed } from "./derive";
import { formatINR } from "./format";
import { marginalRate } from "./marginalRate";
import type { ChapterVIAOldResult } from "./deductions";
import type { WizardInputs } from "./types";
import { pickWinner } from "./verdict";

export interface Suggestion {
  key: string;
  title: string;
  body: string;
  amount: number;
}

const MARGINAL_RELIEF_LOW = 12_00_000;
const MARGINAL_RELIEF_NARROW_HIGH = 12_20_000;
const OLD_CLIFF_LOW = 5_00_000;
const OLD_CLIFF_HIGH = 5_20_000;

/** PRD §21 — fires every rule whose condition is true, returns the top five by rupee value. */
export function buildSuggestions(inputs: WizardInputs): Suggestion[] {
  const computed = deriveComputed(inputs);
  const oldResult = computeFullTax("old", computed);
  const newResult = computeFullTax("new", computed);
  const { winner, saving } = pickWinner(oldResult, newResult);
  const oldDed = oldResult.deductions as ChapterVIAOldResult;
  const rateOld = marginalRate("old", computed);
  const rateNew = marginalRate("new", computed);

  const out: Suggestion[] = [];

  // S1
  const room80C = Math.max(0, LIMIT_80C - oldDed.ded80CCE);
  if (winner === "old" && room80C > 0) {
    const amount = Math.round(room80C * rateOld);
    out.push({
      key: "S1",
      title: "Fill up your ₹1.5 lakh limit",
      body: `You've used ${formatINR(oldDed.ded80CCE)} of the ₹1.5 lakh limit. Putting the remaining ${formatINR(room80C)} into PPF, ELSS or a five-year tax-saving FD would cut your tax by about ${formatINR(amount)}. ELSS has the shortest lock-in at three years; PPF is the safest but locks money for fifteen.`,
      amount,
    });
  }

  // S2
  const ownNPSUsed = computed.hasNPS === true ? computed.ownNPS : 0;
  const roomNPS1B = Math.max(0, LIMIT_80CCD_1B - ownNPSUsed);
  if (winner === "old" && ownNPSUsed < LIMIT_80CCD_1B) {
    const amount = Math.round(roomNPS1B * rateOld);
    out.push({
      key: "S2",
      title: "The extra ₹50,000 nobody uses",
      body: `There's a ₹50,000 NPS deduction that sits completely outside the ₹1.5 lakh limit. You've used ${formatINR(ownNPSUsed)} of it. Putting in another ${formatINR(roomNPS1B)} would save about ${formatINR(amount)}. The catch: the money is locked until you're 60.`,
      amount,
    });
  }

  // S3
  if (computed.employerNPSAnnual === 0) {
    const cap = Math.round(computed.basicPlusDaAnnual * RATE_80CCD_2_NEW);
    const amount = Math.round(cap * rateNew);
    out.push({
      key: "S3",
      title: "Ask HR about corporate NPS",
      body: `This is the only deduction that still works in the new regime. If your employer routes ${formatINR(cap)} — 14% of your basic — into your NPS out of your existing CTC, you'd save about ${formatINR(amount)} a year without earning a rupee more. Many HR teams will set this up on request.`,
      amount,
    });
  }

  // S4
  if (winner === "old" && computed.healthPremiumSelf === 0) {
    const cap = computed.ageBand === "below60" ? LIMIT_80D_SELF_BELOW_60 : LIMIT_80D_SELF_60_PLUS;
    const amount = Math.round(cap * rateOld);
    out.push({
      key: "S4",
      title: "You have no health insurance",
      body: `Beyond the obvious reason to have it, a premium of up to ${formatINR(cap)} is deductible — worth about ${formatINR(amount)} in tax. A basic ₹10 lakh cover for a healthy person in their twenties or thirties costs far less than that limit.`,
      amount,
    });
  }

  // S5
  if (winner === "old" && computed.healthPremiumParents === 0 && computed.ageBand === "below60") {
    const cap = computed.parentsAreSenior === true ? LIMIT_80D_PARENTS_60_PLUS : LIMIT_80D_PARENTS_BELOW_60;
    const amount = Math.round(cap * rateOld);
    out.push({
      key: "S5",
      title: "Insurance for your parents",
      body: `A separate limit of ${formatINR(cap)} applies to health insurance you buy for your parents — ₹50,000 if either is 60 or above. Using it fully would save about ${formatINR(amount)}.`,
      amount,
    });
  }

  // S6
  if (winner === "new" && oldDed.ded80CCE > 0) {
    out.push({
      key: "S6",
      title: "Your investments aren't buying you tax savings",
      body: `You've put ${formatINR(oldDed.ded80CCE)} into 80C investments, but the new regime is still cheaper for you by ${formatINR(saving)}. That doesn't make the investments bad — PPF and ELSS are fine places for money. It does mean you should choose them on their own merits from now on, not for the tax break.`,
      amount: saving,
    });
  }

  // S7
  const tiNew = newResult.totalIncome;
  if (tiNew > MARGINAL_RELIEF_LOW && tiNew <= NEW_MARGINAL_RELIEF_BREAKEVEN) {
    const wouldBe = newResult.taxBeforeRebate;
    const cappedAt = wouldBe - newResult.marginalRelief;
    out.push({
      key: "S7",
      title: "You're inside the marginal relief zone",
      body: `Your taxable income of ${formatINR(tiNew)} is just above the ₹12 lakh line. A rule called marginal relief is capping your tax at ${formatINR(cappedAt)} instead of ${formatINR(wouldBe)} — it's saving you ${formatINR(newResult.marginalRelief)} right now. But be careful: between ₹12 lakh and about ₹12.7 lakh, every extra rupee you earn goes straight to tax. A raise in this band adds nothing to your take-home.`,
      amount: newResult.marginalRelief,
    });
  }

  // S8
  if (
    tiNew > MARGINAL_RELIEF_LOW &&
    tiNew <= MARGINAL_RELIEF_NARROW_HIGH &&
    computed.employerNPSAnnual < computed.basicPlusDaAnnual * RATE_80CCD_2_NEW
  ) {
    const excess = tiNew - MARGINAL_RELIEF_LOW;
    out.push({
      key: "S8",
      title: "You're just above the ₹12 lakh line",
      body: `You're ${formatINR(excess)} over the ₹12 lakh mark. If your employer contributed ${formatINR(excess)} to your NPS, your taxable income would fall back under ₹12 lakh, the full ${formatINR(REBATE_87A_NEW.maxRebate)} rebate would return, and your tax would drop to zero. That's a saving of ${formatINR(newResult.totalTax)} for a change that costs your employer nothing extra.`,
      amount: newResult.totalTax,
    });
  }

  // S9
  const tiOld = oldResult.totalIncome;
  if (winner === "old" && tiOld > OLD_CLIFF_LOW && tiOld <= OLD_CLIFF_HIGH) {
    const excess = tiOld - OLD_CLIFF_LOW;
    out.push({
      key: "S9",
      title: "You're just above the ₹5 lakh line",
      body: `In the old regime there is no marginal relief — cross ₹5 lakh of taxable income by ₹10 and you owe ₹13,000. You're ${formatINR(excess)} over. Another ${formatINR(excess)} of 80C investment would take you back under and wipe out ${formatINR(oldResult.totalTax)} of tax entirely.`,
      amount: oldResult.totalTax,
    });
  }

  // S10
  if (computed.paysRent === true && computed.hasHRAComponent === "no") {
    const potential = Math.min(computed.annualRent, computed.basicPlusDaAnnual * 0.5);
    const amount = Math.round(potential * rateOld);
    out.push({
      key: "S10",
      title: "Ask HR to restructure your salary",
      body: `You pay ${formatINR(computed.monthlyRent)} a month in rent but your salary has no HRA line, so you get no rent benefit at all. If HR moved part of your special allowance into an HRA component, up to ${formatINR(Math.round(potential))} could become tax-free in the old regime — worth about ${formatINR(amount)}. There's also a separate rule called 80GG for people with no HRA, worth up to ₹60,000, which is worth asking a CA about.`,
      amount,
    });
  }

  // S11
  if (computed.basicSharePercent < 0.4 && computed.paysRent === true && winner === "old") {
    out.push({
      key: "S11",
      title: "Your basic salary is low",
      body: `Your basic is only ${Math.round(computed.basicSharePercent * 100)}% of your salary, and the rent benefit is calculated as a percentage of basic. A higher basic would mean a bigger rent benefit — though it also means more PF deducted, so your monthly take-home would fall. Worth a conversation with HR if you're renting in a metro.`,
      amount: 1, // informational — always shown last among ties
    });
  }

  // S12
  if (oldDed.excess80C > 0) {
    out.push({
      key: "S12",
      title: `${formatINR(oldDed.excess80C)} of your investments is doing nothing for tax`,
      body: `You've put ${formatINR(oldDed.raw80C)} into 80C investments but only ₹1,50,000 counts. The extra ${formatINR(oldDed.excess80C)} gave you no tax benefit. Consider redirecting it to NPS for the separate ₹50,000 slot, or simply to a regular index fund with no lock-in.`,
      amount: Math.round(oldDed.excess80C * rateOld),
    });
  }

  // S13
  if (computed.savingsInterest > 10_000 && computed.ageBand === "below60" && winner === "old") {
    const excess = computed.savingsInterest - 10_000;
    out.push({
      key: "S13",
      title: "Interest sitting in a savings account",
      body: `Only ₹10,000 of savings interest is deductible, and you earned ${formatINR(computed.savingsInterest)}. The remaining ${formatINR(excess)} is taxed at your slab rate. Money you don't need for a year does better in an FD or a debt fund — and if you're planning for retirement, the taxable interest is a good argument for shifting some of it.`,
      amount: Math.round(excess * rateOld),
    });
  }

  // S14
  if (winner === "new" && saving > 20_000) {
    out.push({
      key: "S14",
      title: "You can stop chasing proofs",
      body: `The new regime saves you ${formatINR(saving)} and asks for nothing in return — no rent receipts, no landlord PAN, no insurance certificates, no investment statements in January. That's real time saved on top of the money.`,
      amount: saving,
    });
  }

  // S15
  if (saving < 5_000) {
    out.push({
      key: "S15",
      title: "It's close — so pick the simpler one",
      body: `The difference between the two is only ${formatINR(saving)} a year, which is about ${formatINR(Math.round(saving / 12))} a month. At that margin, go with the new regime: it's the default, it needs no paperwork, and one missed proof would wipe out the difference anyway.`,
      amount: 5_000 - saving,
    });
  }

  // S16
  if (computed.hasHomeLoan === true && computed.propertyUse === "selfOccupied" && winner === "old") {
    const allowed = Math.min(computed.homeLoanInterestAnnual, 2_00_000);
    const amount = Math.round(allowed * rateOld);
    out.push({
      key: "S16",
      title: "Your home loan is doing the heavy lifting",
      body: `Your ${formatINR(computed.homeLoanInterestAnnual)} of home loan interest is worth ${formatINR(amount)} in the old regime and nothing in the new. Keep this in mind if you're thinking about prepaying — reducing the loan reduces the deduction too, so the effective cost of your loan is lower than the sticker interest rate.`,
      amount,
    });
  }

  // S17
  if (
    computed.ageBand !== "below60" &&
    winner === "old" &&
    computed.savingsInterest + computed.fdInterest < LIMIT_80TTB
  ) {
    const used = computed.savingsInterest + computed.fdInterest;
    const room = LIMIT_80TTB - used;
    out.push({
      key: "S17",
      title: "You have unused senior citizen benefit",
      body: `As a senior citizen you can deduct up to ₹50,000 of deposit interest and you've used only ${formatINR(used)}. If you have money in a savings account earning little, moving it to a fixed deposit puts that unused ${formatINR(room)} of deduction to work.`,
      amount: Math.round(room * rateOld),
    });
  }

  return out.sort((a, b) => b.amount - a.amount).slice(0, 5);
}
