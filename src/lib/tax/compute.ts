import {
  CESS_RATE,
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  PROF_TAX_ANNUAL_CAP,
  ROUNDING_INCOME,
  ROUNDING_TAX,
  STD_DEDUCTION_NEW,
  STD_DEDUCTION_OLD,
} from "./constants";
import { chapterVIANew, chapterVIAOld, type ChapterVIANewResult, type ChapterVIAOldResult } from "./deductions";
import { roundToNearest } from "./format";
import { houseProperty } from "./houseProperty";
import { applyRebate } from "./rebate";
import { slabTax } from "./slabs";
import type { Computed, Regime, SalaryOnlyInput, SlabRow, TaxResult } from "./types";

/**
 * PRD §14, salary-only subset. HRA/LTA exemptions, house property, other
 * income and Chapter VI-A deductions are all zero at this stage of the
 * build — they're introduced step by step in later phases as the wizard
 * grows. Nothing here computes a wrong number for the terms it does handle;
 * it simply doesn't handle the rest yet.
 */
export function computeTax(regime: Regime, input: SalaryOnlyInput): TaxResult {
  const grossSalary = input.annualGrossSalary;

  // No HRA/LTA exemption yet — hard-zeroed until Phase 6.
  const afterExempt = Math.max(0, grossSalary);

  const standardDeduction = Math.min(
    regime === "old" ? STD_DEDUCTION_OLD : STD_DEDUCTION_NEW,
    afterExempt,
  );

  const professionalTaxDeducted =
    regime === "old" ? Math.min(input.professionalTaxAnnual, PROF_TAX_ANNUAL_CAP) : 0;

  const salaryIncome = Math.max(0, afterExempt - standardDeduction - professionalTaxDeducted);

  // No house property or other income yet — gross total income is salary income alone.
  const gti = salaryIncome;

  // No Chapter VI-A yet — total income equals GTI, rounded per s.288A.
  const totalIncome = Math.max(0, roundToNearest(gti, ROUNDING_INCOME));

  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[input.ageBand];
  const slabRows = slabTax(totalIncome, slabs);
  const taxBeforeRebate = slabRows.reduce((sum, row) => sum + row.taxInSlab, 0);

  const { rebate, marginalRelief, taxAfter } = applyRebate(regime, totalIncome, taxBeforeRebate);

  const cess = Math.max(0, taxAfter) * CESS_RATE;
  const totalTax = roundToNearest(Math.max(0, taxAfter) + cess, ROUNDING_TAX);

  return {
    regime,
    grossSalary,
    standardDeduction,
    professionalTaxDeducted,
    salaryIncome,
    totalIncome,
    slabRows,
    taxBeforeRebate,
    rebate,
    marginalRelief,
    cess,
    totalTax,
  };
}

export interface FullTaxResult {
  regime: Regime;
  grossSalary: number;
  hraExempt: number;
  ltaExempt: number;
  standardDeduction: number;
  professionalTaxDeducted: number;
  salaryIncome: number;
  houseIncome: number;
  otherIncome: number;
  gti: number;
  deductions: ChapterVIAOldResult | ChapterVIANewResult;
  dedTotal: number;
  totalIncome: number;
  slabRows: SlabRow[];
  taxBeforeRebate: number;
  rebate: number;
  marginalRelief: number;
  cess: number;
  totalTax: number;
  monthlyTax: number;
  monthlyTakeHome: number;
}

/**
 * PRD §14 — the full computation, end to end. Takes the same `Computed`
 * shape for both regimes and returns everything the result page and the
 * complete preview panel need: slab-by-slab rows, rebate/marginal relief,
 * cess, and the final tax. The salary-only `computeTax` above stays
 * untouched — the back-solver still deliberately doesn't know about HRA or
 * Chapter VI-A (§12's own simplification), so it keeps using that version.
 */
export function computeFullTax(regime: Regime, x: Computed): FullTaxResult {
  // 1 — SALARY
  const grossSalary = x.annualGross; // already includes employer NPS (§13.8)
  const hraExempt = regime === "old" ? x.hraExempt : 0;
  const ltaExempt = 0; // LTA is out of scope — no wizard field ever sets this above 0
  const afterExempt = Math.max(0, grossSalary - hraExempt - ltaExempt);
  const standardDeduction = Math.min(
    regime === "old" ? STD_DEDUCTION_OLD : STD_DEDUCTION_NEW,
    afterExempt,
  );
  const professionalTaxDeducted =
    regime === "old" ? Math.min(x.professionalTaxAnnualResolved, PROF_TAX_ANNUAL_CAP) : 0;
  const salaryIncome = Math.max(0, afterExempt - standardDeduction - professionalTaxDeducted);

  // 2 — HOUSE PROPERTY (negative = loss)
  const houseIncome = houseProperty(regime, {
    hasHomeLoan: x.hasHomeLoan === true,
    propertyUse: x.propertyUse,
    homeLoanInterestAnnual: x.homeLoanInterestAnnual,
  });

  // 3 — OTHER SOURCES (§13.5) — identical in both regimes; only the deductions on it differ.
  const otherIncome = x.savingsInterest + x.fdInterest + x.otherIncome;

  // 4 — GROSS TOTAL INCOME
  const gti = Math.max(0, salaryIncome + houseIncome + otherIncome);

  // 5 — CHAPTER VI-A
  const deductions =
    regime === "old"
      ? chapterVIAOld(
          {
            employeePFAnnual: x.employeePFAnnual,
            lifeInsurance: x.lifeInsurance,
            ppf: x.ppf,
            elss: x.elss,
            tuitionFees: x.tuitionFees,
            taxSavingFD: x.taxSavingFD,
            sukanya: x.sukanya,
            nscOther: x.nscOther,
            homeLoanPrincipal: x.homeLoanPrincipal,
            stampDuty: x.stampDuty,
            ownNPS: x.ownNPSAnnual,
            basicPlusDaAnnual: x.basicPlusDaAnnual,
            ageBand: x.ageBand,
            healthPremiumSelf: x.healthPremiumSelf,
            healthPremiumParents: x.healthPremiumParents,
            parentsAreSenior: x.parentsAreSenior === true,
            preventiveCheckup: x.preventiveCheckup,
            parentsMedicalExpenditure: x.parentsMedicalExpenditure,
            disabilityDependant: x.disabilityDependant,
            disabilitySelf: x.disabilitySelf,
            specifiedIllnessSpend: x.specifiedIllnessSpend,
            illnessPatientIsSenior: x.illnessPatientIsSenior,
            employerNPSAnnual: x.employerNPSAnnual,
            isGovtEmployee: x.isGovtEmployee,
            savingsInterest: x.savingsInterest,
            fdInterest: x.fdInterest,
            educationLoanInterest: x.educationLoanInterest,
            donations: x.donations,
            donationRate: x.donationRate === "" ? 0.5 : x.donationRate,
          },
          gti,
        )
      : chapterVIANew(x.employerNPSAnnual, x.basicPlusDaAnnual, gti);

  // 6 — TOTAL INCOME, rounded per s.288A
  const totalIncome = Math.max(0, roundToNearest(gti - deductions.total, ROUNDING_INCOME));

  // 7 — SLAB TAX
  const slabs = regime === "new" ? NEW_REGIME_SLABS : OLD_REGIME_SLABS[x.ageBand];
  const slabRows = slabTax(totalIncome, slabs);
  const taxBeforeRebate = slabRows.reduce((sum, row) => sum + row.taxInSlab, 0);

  // 8 — REBATE / MARGINAL RELIEF
  const { rebate, marginalRelief, taxAfter } = applyRebate(regime, totalIncome, taxBeforeRebate);

  // 9 — CESS
  const cess = Math.max(0, taxAfter) * CESS_RATE;

  // 10 — FINAL, rounded per s.288B
  const totalTax = roundToNearest(Math.max(0, taxAfter) + cess, ROUNDING_TAX);

  return {
    regime,
    grossSalary,
    hraExempt,
    ltaExempt,
    standardDeduction,
    professionalTaxDeducted,
    salaryIncome,
    houseIncome,
    otherIncome,
    gti,
    deductions,
    dedTotal: deductions.total,
    totalIncome,
    slabRows,
    taxBeforeRebate,
    rebate,
    marginalRelief,
    cess,
    totalTax,
    monthlyTax: Math.round(totalTax / 12),
    monthlyTakeHome: Math.round(
      (grossSalary - x.employeePFAnnual - x.professionalTaxAnnualResolved - totalTax) / 12,
    ),
  };
}
