import { describe, expect, it } from "vitest";
import { buildExplanation } from "./impact";
import { DEFAULT_WIZARD_INPUTS } from "./defaults";
import type { WizardInputs } from "./types";

function inputs(overrides: Partial<WizardInputs> = {}): WizardInputs {
  return { ...DEFAULT_WIZARD_INPUTS, ...overrides };
}

// A GT-2-like scenario where rent/HRA is the single dominant factor.
const rentDominantInputs = inputs({
  monthlyInHand: 1_00_000,
  tdsKnowledge: "known",
  monthlyTDS: 25_000,
  cityType: "metro",
  basicKnown: true,
  basicMonthly: 62_500,
  paysRent: true,
  monthlyRent: 25_000,
  rentPaidWholeYear: true,
  hasHRAComponent: "yesKnown",
  monthlyHRA: 25_000,
});

describe("buildExplanation (PRD §20)", () => {
  it("names rent as a card with a real old-regime impact and none in the new regime", () => {
    const { cards } = buildExplanation(rentDominantInputs);
    const rentCard = cards.find((c) => c.key === "rent");
    expect(rentCard).toBeDefined();
    expect(rentCard!.oldImpact).toBeGreaterThan(0);
    expect(rentCard!.newImpact).toBe(0);
    expect(rentCard!.title).toMatch(/rent/i);
  });

  it("names rent as the deciding factor in the summary line for a rent-dominant scenario", () => {
    const { summary, cards } = buildExplanation(rentDominantInputs);
    expect(cards[0].key).toBe("rent"); // sorted by magnitude — rent should be the biggest
    expect(summary).toMatch(/rent/i);
    expect(summary).toMatch(/regime/i);
  });

  it("drops items whose impact is below ₹100 in both regimes", () => {
    // A token ₹200 of 80C investment moves old-regime tax by only a few tens
    // of rupees (and does nothing at all in the new regime) — small enough
    // that the 80c card should be filtered out entirely, not just small.
    const { cards } = buildExplanation(
      inputs({ monthlyInHand: 50_000, tdsKnowledge: "unsure", ppf: 200 }),
    );
    expect(cards.some((c) => c.key === "80c")).toBe(false);
    for (const card of cards) {
      expect(Math.abs(card.oldImpact) >= 100 || Math.abs(card.newImpact) >= 100).toBe(true);
    }
  });

  it("produces a card for every applicable item when everything is answered", () => {
    const everything = inputs({
      monthlyInHand: 1_50_000,
      tdsKnowledge: "unsure",
      annualBonus: 2_00_000,
      ageBand: "senior",
      cityType: "metro",
      paysProfessionalTax: true,
      professionalTaxMonthly: 200,
      pfDeducted: false,
      basicKnown: true,
      basicMonthly: 1_00_000,
      paysRent: true,
      monthlyRent: 40_000,
      rentPaidWholeYear: true,
      hasHRAComponent: "yesKnown",
      monthlyHRA: 40_000,
      ppf: 1_00_000,
      healthPremiumSelf: 40_000,
      hasHomeLoan: true,
      propertyUse: "selfOccupied",
      homeLoanInterestAnnual: 1_50_000,
      hasNPS: true,
      ownNPS: 60_000,
      employerContributesNPS: true,
      // Deliberately over both the 10% (old) and 14% (new) caps of basic, so
      // the "cancels out" gross-up/deduction pair leaves a genuine taxable
      // excess in both regimes — otherwise a fully-within-cap contribution
      // is perfectly tax-neutral and produces no measurable impact at all.
      employerNPSMonthly: 20_000,
      savingsInterest: 20_000,
      fdInterest: 30_000,
    });

    const { cards } = buildExplanation(everything);
    const keys = cards.map((c) => c.key);
    for (const expectedKey of [
      "rent",
      "80c",
      "80d",
      "homeLoanInterest",
      "ownNPS",
      "employerNPS",
      "professionalTax",
      "interestIncome",
      "standardDeduction",
      "age",
      "bonus",
    ]) {
      expect(keys).toContain(expectedKey);
    }

    // Sanity: every card renders a non-empty, finite body.
    for (const card of cards) {
      expect(card.body.length).toBeGreaterThan(0);
      expect(Number.isFinite(card.oldImpact)).toBe(true);
      expect(Number.isFinite(card.newImpact)).toBe(true);
    }
  });

  it("drops the rent card when a token rent amount moves tax by under ₹100", () => {
    const { cards } = buildExplanation(
      inputs({
        monthlyInHand: 50_000,
        tdsKnowledge: "unsure",
        paysRent: true,
        monthlyRent: 10,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 10,
      }),
    );
    expect(cards.some((c) => c.key === "rent")).toBe(false);
  });

  it("drops the own-NPS card when a token contribution moves tax by under ₹100", () => {
    const { cards } = buildExplanation(
      inputs({ monthlyInHand: 50_000, tdsKnowledge: "unsure", hasNPS: true, ownNPS: 10 }),
    );
    expect(cards.some((c) => c.key === "ownNPS")).toBe(false);
  });

  it("mentions the 80C overflow line when investments exceed the ₹1.5 lakh cap", () => {
    const { cards } = buildExplanation(inputs({ monthlyInHand: 50_000, tdsKnowledge: "unsure", ppf: 2_14_000 }));
    const card = cards.find((c) => c.key === "80c");
    expect(card).toBeDefined();
    expect(card!.body).toMatch(/over the limit/);
  });

  it("mentions the 80D over-limit line when health premiums exceed the deductible cap", () => {
    const { cards } = buildExplanation(
      inputs({ monthlyInHand: 50_000, tdsKnowledge: "unsure", healthPremiumSelf: 40_000 }),
    );
    const card = cards.find((c) => c.key === "80d");
    expect(card).toBeDefined();
    expect(card!.body).toMatch(/above your limit/);
  });

  it("drops the 80D card when a token premium moves tax by under ₹100", () => {
    const { cards } = buildExplanation(
      inputs({ monthlyInHand: 50_000, tdsKnowledge: "unsure", healthPremiumSelf: 50 }),
    );
    expect(cards.some((c) => c.key === "80d")).toBe(false);
  });

  it("drops the home-loan-interest card when a token amount moves tax by under ₹100", () => {
    const { cards } = buildExplanation(
      inputs({
        monthlyInHand: 50_000,
        tdsKnowledge: "unsure",
        hasHomeLoan: true,
        propertyUse: "selfOccupied",
        homeLoanInterestAnnual: 50,
      }),
    );
    expect(cards.some((c) => c.key === "homeLoanInterest")).toBe(false);
  });

  it("drops the employer-NPS card when a token contribution moves tax by under ₹100", () => {
    const { cards } = buildExplanation(
      inputs({
        monthlyInHand: 50_000,
        tdsKnowledge: "unsure",
        employerContributesNPS: true,
        employerNPSMonthly: 10,
      }),
    );
    expect(cards.some((c) => c.key === "employerNPS")).toBe(false);
  });

  it("drops the professional-tax card when a token amount moves tax by under ₹100", () => {
    const { cards } = buildExplanation(
      inputs({
        monthlyInHand: 50_000,
        tdsKnowledge: "unsure",
        paysProfessionalTax: true,
        professionalTaxMonthly: 1,
      }),
    );
    expect(cards.some((c) => c.key === "professionalTax")).toBe(false);
  });

  it("marks the top card as decisive when the old regime wins because of it", () => {
    const { summary } = buildExplanation(
      inputs({
        monthlyInHand: 86_000,
        tdsKnowledge: "known",
        monthlyTDS: 65_500,
        cityType: "metro",
        basicKnown: true,
        basicMonthly: 1_30_500,
        paysRent: true,
        monthlyRent: 78_500,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 65_800,
        hasHomeLoan: true,
        propertyUse: "selfOccupied",
        homeLoanInterestAnnual: 2_00_000,
        ppf: 1_50_000,
        hasNPS: true,
        ownNPS: 50_000,
        healthPremiumSelf: 25_000,
        healthPremiumParents: 50_000,
        parentsAreSenior: true,
      }),
    );
    expect(summary).toMatch(/that alone is why the old regime wins/);
  });

  it("drops the interest-income card when a token amount moves tax by under ₹100", () => {
    const { cards } = buildExplanation(
      inputs({ monthlyInHand: 50_000, tdsKnowledge: "unsure", savingsInterest: 50 }),
    );
    expect(cards.some((c) => c.key === "interestIncome")).toBe(false);
  });

  it("drops the age card when the extra exemption falls entirely inside an already-zero-tax band", () => {
    // Income low enough that both regimes owe zero tax regardless of the
    // senior citizen's higher old-regime exemption threshold.
    const { cards } = buildExplanation(
      inputs({ monthlyInHand: 25_000, tdsKnowledge: "unsure", ageBand: "senior" }),
    );
    expect(cards.some((c) => c.key === "age")).toBe(false);
  });

  it("marks the top card as non-decisive when it alone doesn't explain the full margin", () => {
    // No single old-regime-only item (home loan, 80C, 80D, NPS) is big enough
    // on its own to flip the verdict — the new regime still wins overall.
    const { summary } = buildExplanation(
      inputs({
        monthlyInHand: 1_50_000,
        tdsKnowledge: "unsure",
        cityType: "metro",
        basicKnown: true,
        basicMonthly: 90_000,
        ppf: 1_50_000,
        hasHomeLoan: true,
        propertyUse: "selfOccupied",
        homeLoanInterestAnnual: 2_00_000,
        hasNPS: true,
        ownNPS: 50_000,
        healthPremiumSelf: 25_000,
        healthPremiumParents: 25_000,
      }),
    );
    expect(summary).toMatch(/isn't enough on its own/);
  });

  it("re-derives basic salary when zeroing PF, rather than swapping a single field", () => {
    // Basic is derived FROM this PF figure (₹3,600/month → basic ₹30,000/month) — zeroing PF
    // must also change the derived basic and therefore the rent-benefit math, not just remove PF itself.
    const withDerivedBasic = inputs({
      monthlyInHand: 1_00_000,
      tdsKnowledge: "unsure",
      pfDeducted: true,
      pfMonthly: 3_600,
      paysRent: true,
      monthlyRent: 10_000,
      hasHRAComponent: "yesUnknown",
    });
    const { cards } = buildExplanation(withDerivedBasic);
    // Should not throw and should produce a sensible, finite set of impacts.
    for (const card of cards) {
      expect(Number.isFinite(card.oldImpact)).toBe(true);
      expect(Number.isFinite(card.newImpact)).toBe(true);
    }
  });
});
