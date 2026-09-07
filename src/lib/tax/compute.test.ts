import { describe, expect, it } from "vitest";
import { computeFullTax, computeTax } from "./compute";
import { DEFAULT_WIZARD_INPUTS } from "./defaults";
import type { Computed, SalaryOnlyInput } from "./types";

function input(overrides: Partial<SalaryOnlyInput> = {}): SalaryOnlyInput {
  return {
    annualGrossSalary: 0,
    ageBand: "below60",
    professionalTaxAnnual: 0,
    ...overrides,
  };
}

function computed(overrides: Partial<Computed> = {}): Computed {
  return {
    ...DEFAULT_WIZARD_INPUTS,
    basicMonthly: 0,
    basicSource: "estimated",
    basicPlusDaAnnual: 0,
    employeePFAnnual: 0,
    employerNPSAnnual: 0,
    ownNPSAnnual: 0,
    professionalTaxAnnualResolved: 0,
    annualRent: 0,
    hraReceivedAnnual: 0,
    hraExempt: 0,
    hraLimbs: [0, 0, 0],
    hraWinningLimb: 1,
    isMetro: false,
    annualGross: 0,
    grossDerivation: "exact",
    grossAmbiguous: false,
    ...overrides,
  };
}

describe("GT-1 — first job, no deductions (PRD §18)", () => {
  const gross = input({ annualGrossSalary: 800_000 });

  it("old regime", () => {
    const r = computeTax("old", gross);
    expect(r.standardDeduction).toBe(50_000);
    expect(r.totalIncome).toBe(750_000);
    expect(r.taxBeforeRebate).toBeCloseTo(62_500, 5);
    expect(r.rebate).toBe(0);
    expect(r.cess).toBeCloseTo(2_500, 5);
    expect(r.totalTax).toBe(65_000);
  });

  it("new regime", () => {
    const r = computeTax("new", gross);
    expect(r.standardDeduction).toBe(75_000);
    expect(r.totalIncome).toBe(725_000);
    expect(r.taxBeforeRebate).toBeCloseTo(16_250, 5);
    expect(r.rebate).toBeCloseTo(16_250, 5);
    expect(r.totalTax).toBe(0);
  });
});

describe("GT-4 — marginal relief boundaries, new regime (PRD §18; E1-E4 §16)", () => {
  // Each row's "total income" is reproduced via gross salary = TI + STD_DEDUCTION_NEW (₹75,000),
  // since the new regime allows no other exemption or deduction in this engine slice.
  const cases: {
    id: string;
    totalIncome: number;
    slabTax: number;
    rebate: number;
    relief: number;
    totalTax: number;
  }[] = [
    { id: "E1", totalIncome: 1_200_000, slabTax: 60_000, rebate: 60_000, relief: 0, totalTax: 0 },
    {
      id: "E2",
      totalIncome: 1_200_010,
      slabTax: 60_001.5,
      rebate: 0,
      relief: 59_991.5,
      totalTax: 10,
    },
    { id: "GT-3", totalIncome: 1_250_000, slabTax: 67_500, rebate: 0, relief: 17_500, totalTax: 52_000 },
    { id: "GT-4 row 3", totalIncome: 1_270_580, slabTax: 70_587, rebate: 0, relief: 7, totalTax: 73_400 },
    {
      id: "E4",
      totalIncome: 1_270_590,
      slabTax: 70_588.5,
      rebate: 0,
      relief: 0,
      totalTax: 73_410,
    },
  ];

  for (const c of cases) {
    it(`${c.id} — total income ₹${c.totalIncome.toLocaleString("en-IN")}`, () => {
      const r = computeTax("new", input({ annualGrossSalary: c.totalIncome + 75_000 }));
      expect(r.totalIncome).toBe(c.totalIncome);
      expect(r.taxBeforeRebate).toBeCloseTo(c.slabTax, 5);
      expect(r.rebate).toBeCloseTo(c.rebate, 5);
      expect(r.marginalRelief).toBeCloseTo(c.relief, 5);
      expect(r.totalTax).toBe(c.totalTax);
    });
  }
});

describe("GT-5 — old regime ₹5 lakh cliff, no marginal relief (PRD §18; E6/E7 §16)", () => {
  it("E6 — total income exactly ₹5,00,000 → rebate wipes it out", () => {
    const r = computeTax("old", input({ annualGrossSalary: 550_000 }));
    expect(r.totalIncome).toBe(500_000);
    expect(r.taxBeforeRebate).toBeCloseTo(12_500, 5);
    expect(r.rebate).toBe(12_500);
    expect(r.totalTax).toBe(0);
  });

  it("E7 — total income ₹5,00,010 → no rebate, no relief, cliff to ₹13,000", () => {
    const r = computeTax("old", input({ annualGrossSalary: 550_010 }));
    expect(r.totalIncome).toBe(500_010);
    expect(r.taxBeforeRebate).toBeCloseTo(12_502, 5);
    expect(r.rebate).toBe(0);
    expect(r.marginalRelief).toBe(0);
    expect(r.totalTax).toBe(13_000);
  });
});

describe("E5 — standard deduction never exceeds salary, never creates a loss", () => {
  it.each(["old", "new"] as const)("%s regime, gross ₹40,000", (regime) => {
    const r = computeTax(regime, input({ annualGrossSalary: 40_000 }));
    expect(r.standardDeduction).toBe(40_000); // capped at salary, not the statutory 50k/75k
    expect(r.salaryIncome).toBe(0);
    expect(r.totalIncome).toBe(0);
    expect(r.totalTax).toBe(0);
  });
});

describe("E19 — income below the basic exemption limit in both regimes", () => {
  it("gross ₹3,00,000 → zero tax both ways", () => {
    expect(computeTax("old", input({ annualGrossSalary: 300_000 })).totalTax).toBe(0);
    expect(computeTax("new", input({ annualGrossSalary: 300_000 })).totalTax).toBe(0);
  });
});

describe("E22 — new regime slabs are identical for every age band", () => {
  it("below60, senior and superSenior all produce the same new-regime tax", () => {
    const gross = input({ annualGrossSalary: 2_000_000 });
    const below60 = computeTax("new", { ...gross, ageBand: "below60" });
    const senior = computeTax("new", { ...gross, ageBand: "senior" });
    const superSenior = computeTax("new", { ...gross, ageBand: "superSenior" });
    expect(senior.totalTax).toBe(below60.totalTax);
    expect(superSenior.totalTax).toBe(below60.totalTax);
  });
});

describe("E23 — professional tax capped at ₹2,500/year, disallowed in the new regime", () => {
  it("₹250/month (₹3,000/year) entered → capped at ₹2,500 in the old regime", () => {
    const r = computeTax(
      "old",
      input({ annualGrossSalary: 800_000, professionalTaxAnnual: 3_000 }),
    );
    expect(r.professionalTaxDeducted).toBe(2_500);
  });

  it("professional tax is never deducted in the new regime", () => {
    const r = computeTax(
      "new",
      input({ annualGrossSalary: 800_000, professionalTaxAnnual: 3_000 }),
    );
    expect(r.professionalTaxDeducted).toBe(0);
  });
});

describe("computeFullTax — golden vectors, end to end (PRD §14, §18)", () => {
  it("GT-1 — first job, no deductions: reduces to the same result as the salary-only engine", () => {
    const x = computed({ annualGross: 8_00_000 });
    expect(computeFullTax("old", x).totalTax).toBe(65_000);
    expect(computeFullTax("new", x).totalTax).toBe(0);
  });

  it("GT-2 — metro renter with a full 80C and 80D", () => {
    const x = computed({
      annualGross: 15_00_000,
      basicPlusDaAnnual: 7_50_000,
      hraExempt: 2_25_000,
      ppf: 1_50_000,
      healthPremiumSelf: 25_000,
      professionalTaxAnnualResolved: 2_500,
      paysProfessionalTax: true,
    });
    const old = computeFullTax("old", x);
    expect(old.gti).toBe(12_22_500);
    expect(old.totalIncome).toBe(10_47_500);
    expect(old.totalTax).toBe(1_31_820);

    const newR = computeFullTax("new", x);
    expect(newR.totalIncome).toBe(14_25_000);
    expect(newR.totalTax).toBe(97_500);
  });

  it("GT-6 — senior citizen with deposit interest", () => {
    const x = computed({
      annualGross: 9_00_000,
      ageBand: "senior",
      savingsInterest: 12_000,
      fdInterest: 60_000,
      ppf: 1_50_000,
      healthPremiumSelf: 50_000,
    });
    const old = computeFullTax("old", x);
    expect(old.totalIncome).toBe(6_72_000);
    expect(old.totalTax).toBe(46_180);

    expect(computeFullTax("new", x).totalTax).toBe(0);
  });

  it("GT-7 — old regime wins (home loan + NPS + high income)", () => {
    const x = computed({
      annualGross: 20_00_000,
      basicPlusDaAnnual: 10_00_000,
      hraExempt: 5_00_000,
      ppf: 1_50_000,
      ownNPSAnnual: 50_000,
      healthPremiumSelf: 25_000,
      healthPremiumParents: 50_000,
      parentsAreSenior: true,
      hasHomeLoan: true,
      propertyUse: "selfOccupied",
      homeLoanInterestAnnual: 2_00_000,
      professionalTaxAnnualResolved: 2_500,
      paysProfessionalTax: true,
    });
    const old = computeFullTax("old", x);
    expect(old.salaryIncome).toBe(14_47_500);
    expect(old.gti).toBe(12_47_500);
    expect(old.dedTotal).toBe(2_75_000);
    expect(old.totalIncome).toBe(9_72_500);
    expect(old.totalTax).toBe(1_11_280);

    const newR = computeFullTax("new", x);
    expect(newR.salaryIncome).toBe(19_25_000);
    expect(newR.totalIncome).toBe(19_25_000);
    expect(newR.totalTax).toBe(1_92_400);

    // Old wins by ₹81,120.
    expect(old.totalTax).toBeLessThan(newR.totalTax);
    expect(newR.totalTax - old.totalTax).toBe(81_120);
  });

  it("E18 — a gross total income that would be negative is clamped to zero, not carried as a loss", () => {
    const x = computed({
      annualGross: 1_00_000,
      hasHomeLoan: true,
      propertyUse: "selfOccupied",
      homeLoanInterestAnnual: 5_00_000, // capped at 2,00,000, still swamps the tiny salary
    });
    const old = computeFullTax("old", x);
    expect(old.gti).toBe(0);
    expect(old.totalIncome).toBe(0);
    expect(old.totalTax).toBe(0);
  });
});
