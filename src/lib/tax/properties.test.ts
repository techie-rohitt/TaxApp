import { describe, expect, it } from "vitest";
import { computeFullTax } from "./compute";
import { RATE_80CCD_2_NEW } from "./constants";
import { DEFAULT_WIZARD_INPUTS } from "./defaults";
import type { AgeBand, Computed } from "./types";

// Deterministic PRNG (mulberry32) — reproducible across runs, no flakiness.
function mulberry32(seed: number) {
  let a = seed;
  return function random() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
const AGE_BANDS: AgeBand[] = ["below60", "senior", "superSenior"];

function randomComputed(): Computed {
  const annualGross = Math.round(rand() * 50_00_000) + 2_00_000;
  const basicPlusDaAnnual = Math.round(annualGross * (0.3 + rand() * 0.3));
  return {
    ...DEFAULT_WIZARD_INPUTS,
    ageBand: AGE_BANDS[Math.floor(rand() * 3)],
    paysProfessionalTax: rand() > 0.5,
    professionalTaxMonthly: Math.round(rand() * 500),
    lifeInsurance: Math.round(rand() * 50_000),
    ppf: Math.round(rand() * 2_00_000),
    elss: Math.round(rand() * 50_000),
    healthPremiumSelf: Math.round(rand() * 60_000),
    healthPremiumParents: Math.round(rand() * 60_000),
    parentsAreSenior: rand() > 0.5,
    disabilityDependant: rand() > 0.7 ? "normal" : "none",
    savingsInterest: Math.round(rand() * 20_000),
    fdInterest: Math.round(rand() * 1_00_000),
    otherIncome: Math.round(rand() * 50_000),
    donations: Math.round(rand() * 20_000),
    donationRate: rand() > 0.5 ? 1 : 0.5,
    educationLoanInterest: Math.round(rand() * 1_00_000),
    hasHomeLoan: rand() > 0.5,
    propertyUse: "selfOccupied",
    homeLoanInterestAnnual: Math.round(rand() * 3_00_000),

    basicMonthly: Math.round(basicPlusDaAnnual / 12),
    basicSource: "estimated",
    basicPlusDaAnnual,
    employeePFAnnual: Math.round(basicPlusDaAnnual * 0.12),
    employerNPSAnnual: Math.round(rand() * 3_00_000),
    ownNPSAnnual: Math.round(rand() * 80_000),
    professionalTaxAnnualResolved: 0,
    annualRent: 0,
    hraReceivedAnnual: 0,
    hraExempt: Math.round(rand() * 3_00_000),
    hraLimbs: [0, 0, 0],
    hraWinningLimb: 1,
    isMetro: rand() > 0.5,
    annualGross,
    grossDerivation: "exact",
    grossAmbiguous: false,
  };
}

describe("Property — the new regime allows nothing but the standard deduction and employer NPS", () => {
  it("new-regime Chapter VI-A always equals min(employerNPS, 14% of basic), clamped to GTI, across 500 random inputs", () => {
    for (let i = 0; i < 500; i++) {
      const computed = randomComputed();
      const result = computeFullTax("new", computed);
      const expectedUncapped = Math.min(
        computed.employerNPSAnnual,
        computed.basicPlusDaAnnual * RATE_80CCD_2_NEW,
      );
      const expected = Math.min(expectedUncapped, Math.max(0, result.gti));
      expect(result.dedTotal).toBeCloseTo(expected, 5);
    }
  });
});

describe("Property — tax is monotonically non-decreasing in gross salary", () => {
  it("holds across a random sweep, both regimes, including through the marginal-relief band", () => {
    for (let i = 0; i < 200; i++) {
      const base = randomComputed();
      let prevOld = computeFullTax("old", base).totalTax;
      let prevNew = computeFullTax("new", base).totalTax;
      for (let step = 1; step <= 10; step++) {
        const bumped = { ...base, annualGross: base.annualGross + step * 50_000 };
        const curOld = computeFullTax("old", bumped).totalTax;
        const curNew = computeFullTax("new", bumped).totalTax;
        expect(curOld).toBeGreaterThanOrEqual(prevOld);
        expect(curNew).toBeGreaterThanOrEqual(prevNew);
        prevOld = curOld;
        prevNew = curNew;
      }
    }
  });
});

describe("Property — age band affects the old regime only (E22)", () => {
  it("new-regime tax is identical across all three age bands for the same inputs, across 300 random inputs", () => {
    for (let i = 0; i < 300; i++) {
      const computed = randomComputed();
      const below60 = computeFullTax("new", { ...computed, ageBand: "below60" }).totalTax;
      const senior = computeFullTax("new", { ...computed, ageBand: "senior" }).totalTax;
      const superSenior = computeFullTax("new", { ...computed, ageBand: "superSenior" }).totalTax;
      expect(senior).toBe(below60);
      expect(superSenior).toBe(below60);
    }
  });
});
