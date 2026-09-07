import { describe, expect, it } from "vitest";
import { computeTax } from "./compute";
import { deriveGrossSalary, solveGrossFromInHand } from "./solver";

describe("GT-8 — the back-solver (PRD §18)", () => {
  it("converges to the expected gross salary and tax, unambiguously", () => {
    const result = solveGrossFromInHand({
      monthlyInHand: 150_000,
      monthlyEmployeePF: 3_600,
      monthlyProfTax: 200,
      annualBonus: 0,
      otherSalary: 0,
      ageBand: "below60",
      employerRegime: "new",
    });

    expect(result.ok).toBe(true);
    expect(result.ambiguous).toBe(false);
    expect(result.annualGross).toBeGreaterThanOrEqual(2_047_980 - 100);
    expect(result.annualGross).toBeLessThanOrEqual(2_047_980 + 100);
    expect(result.annualTaxAtRoot).toBeGreaterThanOrEqual(202_380 - 100);
    expect(result.annualTaxAtRoot).toBeLessThanOrEqual(202_380 + 100);
  });
});

describe("GT-9 — solver ambiguity guard (PRD §18)", () => {
  it("detects the marginal-relief ambiguity and returns the smallest root", () => {
    // Construct the input per §18's recipe: take a gross of ₹12,80,000 with PF
    // ₹1,800/month, compute the take-home, then feed that take-home back in.
    const grossForFeed = 1_280_000;
    const pfMonthly = 1_800;
    const employeePFAnnual = pfMonthly * 12;
    const tax = computeTax("new", {
      annualGrossSalary: grossForFeed,
      ageBand: "below60",
      professionalTaxAnnual: 0,
    });
    const annualTakeHome = grossForFeed - employeePFAnnual - tax.totalTax;
    const monthlyInHand = Math.round(annualTakeHome / 12);

    const result = solveGrossFromInHand({
      monthlyInHand,
      monthlyEmployeePF: pfMonthly,
      monthlyProfTax: 0,
      annualBonus: 0,
      otherSalary: 0,
      ageBand: "below60",
      employerRegime: "new",
    });

    expect(result.ok).toBe(true);
    expect(result.ambiguous).toBe(true);
    expect(result.ambiguityRange).not.toBeNull();
    // The returned root must be the smallest one found.
    expect(result.annualGross).toBeLessThanOrEqual(result.ambiguityRange![1]);
    // And it should land back near the gross we started from, within the band.
    expect(result.annualGross).toBeLessThanOrEqual(grossForFeed + 100);
  });
});

describe("solveGrossFromInHand — no-solution fallback", () => {
  it("returns ok: false when the scan range collapses (pathological negative input)", () => {
    // A large negative monthlyInHand drives `base` so negative that the scan's
    // upper bound (2.2 × base + 5,00,000) ends up below the lower bound — the
    // coarse-scan loop then never runs, so no root can be found.
    const result = solveGrossFromInHand({
      monthlyInHand: -1_00_000,
      monthlyEmployeePF: 0,
      monthlyProfTax: 0,
      annualBonus: 0,
      otherSalary: 0,
      ageBand: "below60",
      employerRegime: "new",
    });

    expect(result.ok).toBe(false);
    expect(result.ambiguous).toBe(false);
    expect(result.ambiguityRange).toBeNull();
  });
});

describe("deriveGrossSalary (PRD §12.6 / §12.4-5)", () => {
  it("defaults monthlyEmployeePF, monthlyProfTax and ageBand when omitted", () => {
    const result = deriveGrossSalary({
      monthlyInHand: 60_000,
      tdsKnowledge: "unsure",
      monthlyTDS: 0,
      employerRegime: "new",
      annualBonus: 0,
      otherTaxableSalary: 0,
    });
    expect(result.derivation).toBe("solved");
    expect(result.assumedRegime).toBe("new");
  });

  it("assumes the old regime when the employer is known to run it", () => {
    const result = deriveGrossSalary({
      monthlyInHand: 60_000,
      tdsKnowledge: "unsure",
      monthlyTDS: 0,
      employerRegime: "old",
      annualBonus: 0,
      otherTaxableSalary: 0,
    });
    expect(result.assumedRegime).toBe("old");
  });

  it("returns an exact gross when TDS is known, folding in PF, professional tax and TDS", () => {
    const result = deriveGrossSalary({
      monthlyInHand: 60_000,
      tdsKnowledge: "known",
      monthlyTDS: 10_000,
      employerRegime: "new",
      annualBonus: 0,
      otherTaxableSalary: 0,
      monthlyEmployeePF: 1_000,
      monthlyProfTax: 200,
    });
    expect(result.derivation).toBe("exact");
    expect(result.annualGross).toBe(12 * (60_000 + 1_000 + 200 + 10_000));
  });

  it("falls back when the solver can't find a root (pathological negative in-hand)", () => {
    const result = deriveGrossSalary({
      monthlyInHand: -1_00_000,
      tdsKnowledge: "unsure",
      monthlyTDS: 0,
      employerRegime: "new",
      annualBonus: 0,
      otherTaxableSalary: 0,
    });
    expect(result.derivation).toBe("fallback");
  });
});
