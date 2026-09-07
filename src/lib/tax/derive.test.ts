import { describe, expect, it } from "vitest";
import { computeFullTax } from "./compute";
import {
  deriveChapterVIAOld,
  deriveComputed,
  deriveRentBenefit,
  deriveSalaryStructure,
  resolveBasicMonthly,
  resolveEmployeePFAnnual,
  resolveProfessionalTaxAnnual,
} from "./derive";
import { DEFAULT_WIZARD_INPUTS } from "./defaults";
import type { WizardInputs } from "./types";

function inputs(overrides: Partial<WizardInputs> = {}): WizardInputs {
  return { ...DEFAULT_WIZARD_INPUTS, ...overrides };
}

describe("resolveBasicMonthly (PRD §13.1 priority order)", () => {
  it("prefers a user-provided basic salary", () => {
    const r = resolveBasicMonthly(
      inputs({ basicKnown: true, basicMonthly: 45_000 }),
      100_000,
    );
    expect(r).toEqual({ value: 45_000, source: "user", clamped: false });
  });

  it("derives basic from a known, non-₹1,800 PF figure", () => {
    const r = resolveBasicMonthly(
      inputs({ basicKnown: false, pfDeducted: true, pfMonthly: 3_600 }),
      250_000,
    );
    expect(r).toEqual({ value: 30_000, source: "derivedFromPF", clamped: false });
  });

  it("E28 — never derives basic from the ₹1,800 PF ceiling", () => {
    const r = resolveBasicMonthly(
      inputs({ basicKnown: false, pfDeducted: true, pfMonthly: 1_800, basicSharePercent: 0.5 }),
      100_000,
    );
    expect(r.source).not.toBe("derivedFromPF");
    expect(r.source).toBe("estimated");
    expect(r.value).toBe(50_000); // 50% of gross, not the 15,000 PF-wage-ceiling trap
  });

  it("falls back to the gross-share estimate when nothing else is known", () => {
    const r = resolveBasicMonthly(inputs({ basicSharePercent: 0.4 }), 100_000);
    expect(r).toEqual({ value: 40_000, source: "estimated", clamped: false });
  });

  it("E29 — clamps a derived basic that would exceed gross salary", () => {
    const r = resolveBasicMonthly(
      inputs({ basicKnown: true, basicMonthly: 9_99_999 }),
      50_000,
    );
    expect(r.value).toBe(50_000);
    expect(r.clamped).toBe(true);
  });
});

describe("resolveEmployeePFAnnual (PRD §13.1)", () => {
  it("uses a known monthly PF figure directly", () => {
    expect(resolveEmployeePFAnnual(inputs({ pfDeducted: true, pfMonthly: 3_600 }), 30_000)).toBe(
      43_200,
    );
  });

  it("assumes 12% of basic when the user says PF is capped at ₹1,800", () => {
    const annual = resolveEmployeePFAnnual(
      inputs({ pfDeducted: true, pfMonthly: 0, pfCappingChoice: "capped1800" }),
      20_000,
    );
    // capped at the ₹15,000 EPF wage ceiling before applying 12%.
    expect(annual).toBe(15_000 * 0.12 * 12);
  });

  it("uses the full 12% of basic when PF isn't capped", () => {
    const annual = resolveEmployeePFAnnual(
      inputs({ pfDeducted: true, pfMonthly: 0, pfCappingChoice: "twelvePercent" }),
      20_000,
    );
    expect(annual).toBe(20_000 * 0.12 * 12);
  });

  it("is zero when PF is not deducted or unknown", () => {
    expect(resolveEmployeePFAnnual(inputs({ pfDeducted: false }), 30_000)).toBe(0);
    expect(resolveEmployeePFAnnual(inputs({ pfDeducted: "unsure" }), 30_000)).toBe(0);
  });
});

describe("resolveProfessionalTaxAnnual (PRD §8.2)", () => {
  it("E23 — returns the raw, uncapped annual figure (computeTax applies the ₹2,500 cap)", () => {
    const annual = resolveProfessionalTaxAnnual(
      inputs({ paysProfessionalTax: true, professionalTaxMonthly: 250 }),
    );
    expect(annual).toBe(3_000);
  });

  it("is zero when the user says no or is unsure", () => {
    expect(resolveProfessionalTaxAnnual(inputs({ paysProfessionalTax: false }))).toBe(0);
    expect(resolveProfessionalTaxAnnual(inputs({ paysProfessionalTax: "unsure" }))).toBe(0);
  });
});

describe("deriveSalaryStructure — fixed-point resolution", () => {
  it("converges to a stable gross salary once PF is folded in", () => {
    const result = deriveSalaryStructure(
      inputs({
        monthlyInHand: 100_000,
        tdsKnowledge: "unsure",
        pfDeducted: true,
        pfMonthly: 0,
        pfCappingChoice: "twelvePercent",
        basicKnown: false,
        basicSharePercent: 0.5,
      }),
    );

    expect(result.employeePFAnnual).toBeGreaterThan(0);
    expect(result.grossSalary.annualGross).toBeGreaterThan(12_00_000); // > 12 × in-hand alone
    expect(Number.isFinite(result.grossSalary.annualGross)).toBe(true);
    expect(result.basic.source).toBe("estimated");
  });

  it("flags professionalTaxCapped when the monthly figure annualises past ₹2,500", () => {
    const result = deriveSalaryStructure(
      inputs({ monthlyInHand: 50_000, paysProfessionalTax: true, professionalTaxMonthly: 250 }),
    );
    expect(result.professionalTaxCapped).toBe(true);
  });
});

describe("deriveRentBenefit (PRD §8.4)", () => {
  it("is not applicable when the user doesn't pay rent", () => {
    const r = deriveRentBenefit(inputs({ paysRent: false }), 62_500, true);
    expect(r.applicable).toBe(false);
    expect(r.exemption.exempt).toBe(0);
  });

  it("GT-2 — known HRA, full year, metro: matches the worked example exactly", () => {
    const r = deriveRentBenefit(
      inputs({
        paysRent: true,
        monthlyRent: 25_000,
        rentPaidWholeYear: true,
        hasHRAComponent: "yesKnown",
        monthlyHRA: 25_000,
      }),
      62_500, // basic monthly → 7,50,000 annual
      true,
    );
    expect(r.annualRent).toBe(3_00_000);
    expect(r.hraReceivedAnnual).toBe(3_00_000);
    expect(r.exemption.limbs).toEqual([3_00_000, 3_75_000, 2_25_000]);
    expect(r.exemption.exempt).toBe(2_25_000);
    expect(r.taxableHRA).toBe(75_000);
  });

  it("annualises rent by the actual months paid, not always 12", () => {
    const r = deriveRentBenefit(
      inputs({
        paysRent: true,
        monthlyRent: 20_000,
        rentPaidWholeYear: false,
        monthsRentPaid: 7,
        hasHRAComponent: "no",
      }),
      50_000,
      true,
    );
    expect(r.annualRent).toBe(1_40_000);
  });

  it('estimates HRA at 50% of basic (metro) when the user says "yes, but I don\'t know the amount"', () => {
    const r = deriveRentBenefit(
      inputs({ paysRent: true, monthlyRent: 10_000, hasHRAComponent: "yesUnknown" }),
      62_500,
      true,
    );
    expect(r.hraReceivedAnnual).toBe(62_500 * 0.5 * 12);
    expect(r.hraSource).toBe("estimated");
  });

  it('estimates HRA at 40% of basic outside the four metro cities', () => {
    const r = deriveRentBenefit(
      inputs({ paysRent: true, monthlyRent: 10_000, hasHRAComponent: "yesUnknown" }),
      62_500,
      false,
    );
    expect(r.hraReceivedAnnual).toBe(62_500 * 0.4 * 12);
  });

  it("E8 — no HRA line at all means zero HRA received and zero exemption", () => {
    const r = deriveRentBenefit(
      inputs({ paysRent: true, monthlyRent: 20_000, hasHRAComponent: "no" }),
      50_000,
      true,
    );
    expect(r.hraReceivedAnnual).toBe(0);
    expect(r.exemption.exempt).toBe(0);
  });
});

describe("deriveChapterVIAOld (PRD §8.5 wiring)", () => {
  it("sums the wizard's 80C fields alongside the resolved employee PF, capped at ₹1.5 lakh", () => {
    const r = deriveChapterVIAOld(
      inputs({ ppf: 1_00_000, elss: 80_000 }),
      43_200, // employeePFAnnual
      50_000, // basicMonthly
    );
    expect(r.raw80C).toBe(2_23_200);
    expect(r.ded80CCE).toBe(1_50_000);
    expect(r.excess80C).toBe(73_200);
  });
});

describe("deriveComputed — employer NPS gross-up (E20/E21)", () => {
  it("E20 — adds the FULL employer contribution to gross, but deducts only up to 14% of basic in the new regime", () => {
    const wizardInputs = inputs({
      monthlyInHand: 1_00_000,
      tdsKnowledge: "unsure",
      basicKnown: true,
      basicMonthly: 50_000, // basicPlusDaAnnual = 6,00,000; 14% cap = 84,000
      hasNPS: true,
      employerContributesNPS: true,
      employerNPSMonthly: 10_000, // ₹1,20,000/year — well above the 14% cap
    });

    const c = deriveComputed(wizardInputs);
    expect(c.employerNPSAnnual).toBe(1_20_000);
    // Adding the full ₹1,20,000 employer contribution on top of a ~₹12L base
    // gross confirms it was added in full, not pre-capped before reaching gross.
    expect(c.annualGross).toBeGreaterThan(12_00_000 + 1_20_000 - 1_000);

    const newR = computeFullTax("new", c);
    expect(newR.dedTotal).toBeCloseTo(84_000, 5); // capped at 14% of ₹6,00,000
    // The ₹36,000 excess employer contribution (1,20,000 − 84,000) is taxed, not sheltered.
    expect(newR.gti - newR.dedTotal).toBeGreaterThan(0);
  });

  it("E21 — a government employee gets the 14% rate in the old regime too, via isGovtEmployee", () => {
    const wizardInputs = inputs({
      basicKnown: true,
      basicMonthly: 50_000,
      hasNPS: true,
      employerContributesNPS: true,
      employerNPSMonthly: 10_000,
      isGovtEmployee: true,
    });
    const c = deriveComputed(wizardInputs);
    const old = computeFullTax("old", c);
    expect(old.deductions.ded80CCD2).toBeCloseTo(84_000, 5); // 14% of 6,00,000, not the 10% private rate
  });
});
