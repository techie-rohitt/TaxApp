import { describe, expect, it } from "vitest";
import { buildSuggestions } from "./suggestions";
import { DEFAULT_WIZARD_INPUTS } from "./defaults";
import type { WizardInputs } from "./types";

function inputs(overrides: Partial<WizardInputs> = {}): WizardInputs {
  return { ...DEFAULT_WIZARD_INPUTS, ...overrides };
}

describe("buildSuggestions (PRD §21)", () => {
  it("S1 and S3 fire when 80C isn't maxed and no employer NPS exists (old regime wins)", () => {
    // Rent + HRA + a self-occupied home loan keep the old regime ahead, with
    // 80C only half-used and no employer NPS at all.
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 1_50_000,
        tdsKnowledge: "unsure",
        cityType: "metro",
        basicKnown: true,
        basicMonthly: 83_333,
        paysRent: true,
        monthlyRent: 50_000,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 41_667,
        hasHomeLoan: true,
        propertyUse: "selfOccupied",
        homeLoanInterestAnnual: 2_00_000,
        ppf: 50_000,
      }),
    );

    const keys = suggestions.map((s) => s.key);
    expect(keys).toContain("S1");
    expect(keys).toContain("S3");
    for (const s of suggestions) {
      expect(s.amount).toBeGreaterThanOrEqual(0);
      expect(s.body.length).toBeGreaterThan(0);
    }
  });

  it("never returns more than five suggestions, sorted by rupee value", () => {
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 2_00_000,
        tdsKnowledge: "known",
        monthlyTDS: 50_000,
        cityType: "other",
        basicKnown: true,
        basicMonthly: 1_00_000,
        paysRent: true,
        monthlyRent: 5_000, // low enough that limb 3 (rent − 10% of basic) is negative
        rentPaidWholeYear: true,
        hasHRAComponent: "no",
      }),
    );
    expect(suggestions.length).toBeLessThanOrEqual(5);
    for (let i = 1; i < suggestions.length; i++) {
      expect(suggestions[i - 1].amount).toBeGreaterThanOrEqual(suggestions[i].amount);
    }
  });

  it("S10 fires when rent is paid but the salary has no HRA line", () => {
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 80_000,
        tdsKnowledge: "unsure",
        basicKnown: true,
        basicMonthly: 40_000,
        paysRent: true,
        monthlyRent: 15_000,
        rentPaidWholeYear: true,
        hasHRAComponent: "no",
      }),
    );
    expect(suggestions.some((s) => s.key === "S10")).toBe(true);
  });

  it("S5 uses the higher senior-parent 80D cap when the user's parents are 60+", () => {
    // 80C, own NPS, employer NPS and self health cover are all maxed out so
    // S1/S2/S3/S4's larger amounts don't crowd S5 out of the top-5 slice.
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 1_50_000,
        tdsKnowledge: "unsure",
        cityType: "metro",
        basicKnown: true,
        basicMonthly: 83_333,
        paysRent: true,
        monthlyRent: 50_000,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 41_667,
        hasHomeLoan: true,
        propertyUse: "selfOccupied",
        homeLoanInterestAnnual: 2_00_000,
        parentsAreSenior: true,
        ppf: 1_50_000,
        hasNPS: true,
        ownNPS: 50_000,
        employerContributesNPS: true,
        employerNPSMonthly: 20_000,
        healthPremiumSelf: 25_000,
      }),
    );
    const s5 = suggestions.find((s) => s.key === "S5");
    expect(s5).toBeDefined();
    expect(s5!.amount).toBeGreaterThan(0);
  });

  it("S6 fires when the new regime wins despite real 80C investments", () => {
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 60_000,
        tdsKnowledge: "unsure",
        ppf: 50_000,
      }),
    );
    expect(suggestions.some((s) => s.key === "S6")).toBe(true);
  });

  it("S7 fires inside the marginal-relief zone (new-regime taxable income just above ₹12L)", () => {
    // Exact gross of ₹13,00,000 → new-regime taxable income ₹12,25,000.
    const suggestions = buildSuggestions(
      inputs({ monthlyInHand: 1_00_000, tdsKnowledge: "known", monthlyTDS: 0, annualBonus: 1_00_000 }),
    );
    expect(suggestions.some((s) => s.key === "S7")).toBe(true);
  });

  it("S8 fires in the narrow ₹12L-12.2L band with no employer NPS", () => {
    // Exact gross of ₹12,85,000 → new-regime taxable income ₹12,10,000.
    const suggestions = buildSuggestions(
      inputs({ monthlyInHand: 1_00_000, tdsKnowledge: "known", monthlyTDS: 0, annualBonus: 85_000 }),
    );
    expect(suggestions.some((s) => s.key === "S8")).toBe(true);
  });

  it("S11 fires for a low basic share while renting, when the old regime wins", () => {
    // 80C, own NPS, employer NPS and health premiums are all maxed out so their
    // (much larger) suggestion amounts don't crowd S11 (deliberately amount: 1)
    // out of the top-5 slice.
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 1_50_000,
        tdsKnowledge: "unsure",
        cityType: "metro",
        basicKnown: true,
        basicMonthly: 1_40_000,
        basicSharePercent: 0.3, // S11 checks this raw field regardless of whether it's actually used
        paysRent: true,
        monthlyRent: 85_000,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 70_000,
        ppf: 1_50_000,
        hasNPS: true,
        ownNPS: 50_000,
        employerContributesNPS: true,
        employerNPSMonthly: 20_000,
        healthPremiumSelf: 25_000,
        healthPremiumParents: 25_000,
      }),
    );
    expect(suggestions.some((s) => s.key === "S11")).toBe(true);
  });

  it("S9 fires just above the old regime's ₹5 lakh no-marginal-relief cliff, when old wins", () => {
    const suggestions = buildSuggestions(
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
    expect(suggestions.some((s) => s.key === "S9")).toBe(true);
  });

  it("S15 fires when the two regimes are within ₹5,000 of each other", () => {
    // A low enough gross that both regimes land under their respective
    // full-rebate ceilings — both totals are exactly zero, a perfect tie.
    const suggestions = buildSuggestions(
      inputs({ monthlyInHand: 45_000, tdsKnowledge: "known", monthlyTDS: 0, cityType: "other" }),
    );
    expect(suggestions.some((s) => s.key === "S15")).toBe(true);
  });

  it("S17 fires for a senior citizen with unused 80TTB room, when the old regime wins", () => {
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 87_500,
        tdsKnowledge: "known",
        monthlyTDS: 66_500,
        ageBand: "senior",
        cityType: "metro",
        basicKnown: true,
        basicMonthly: 1_31_000,
        paysRent: true,
        monthlyRent: 79_000,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 65_500,
        savingsInterest: 5_000,
        fdInterest: 5_000,
      }),
    );
    expect(suggestions.some((s) => s.key === "S17")).toBe(true);
  });

  it("S12 fires whenever 80C investments exceed the ₹1.5 lakh cap, regardless of winner", () => {
    const suggestions = buildSuggestions(inputs({ monthlyInHand: 60_000, ppf: 2_14_000 }));
    expect(suggestions.some((s) => s.key === "S12")).toBe(true);
  });

  it("S13 fires for savings interest over ₹10,000 under 60 when the old regime wins", () => {
    // 80C, own NPS, employer NPS and health premiums are all maxed out so their
    // larger suggestion amounts don't crowd S13 out of the top-5 slice.
    const suggestions = buildSuggestions(
      inputs({
        monthlyInHand: 1_50_000,
        tdsKnowledge: "unsure",
        cityType: "metro",
        basicKnown: true,
        basicMonthly: 83_333,
        paysRent: true,
        monthlyRent: 50_000,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 41_667,
        hasHomeLoan: true,
        propertyUse: "selfOccupied",
        homeLoanInterestAnnual: 2_00_000,
        savingsInterest: 20_000,
        ppf: 1_50_000,
        hasNPS: true,
        ownNPS: 50_000,
        employerContributesNPS: true,
        employerNPSMonthly: 20_000,
        healthPremiumSelf: 25_000,
        healthPremiumParents: 25_000,
      }),
    );
    expect(suggestions.some((s) => s.key === "S13")).toBe(true);
  });
});
