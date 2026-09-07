/**
 * FY 2025-26 / AY 2026-27 constants — PRD §11.1–11.2.
 * This file is the only place these numbers may appear. No magic numbers
 * anywhere else in the codebase (PRD §24.3 rule 2).
 */

export const FY = "2025-26";
export const AY = "2026-27";

// Slabs are [upperBound, rate]. Infinity marks the top slab.
export const NEW_REGIME_SLABS = [
  { upTo: 400_000, rate: 0.0 },
  { upTo: 800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.1 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.2 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo: Infinity, rate: 0.3 },
] as const;

// Note: the New Regime slabs are IDENTICAL for all ages. There is no senior
// citizen benefit in the new regime — a frequent source of bugs (PRD §11.1, E22).
export const OLD_REGIME_SLABS = {
  below60: [
    { upTo: 250_000, rate: 0.0 },
    { upTo: 500_000, rate: 0.05 },
    { upTo: 1_000_000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ],
  senior: [
    // 60 to 79
    { upTo: 300_000, rate: 0.0 },
    { upTo: 500_000, rate: 0.05 },
    { upTo: 1_000_000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ],
  superSenior: [
    // 80 and above
    { upTo: 500_000, rate: 0.0 },
    { upTo: 1_000_000, rate: 0.2 },
    { upTo: Infinity, rate: 0.3 },
  ],
} as const;

export const CESS_RATE = 0.04; // Health & Education Cess

export const STD_DEDUCTION_OLD = 50_000; // s.16(ia)
export const STD_DEDUCTION_NEW = 75_000; // s.16(ia)

export const PROF_TAX_ANNUAL_CAP = 2_500; // s.16(iii), Art. 276(2)

export const REBATE_87A_OLD = {
  incomeLimit: 500_000,
  maxRebate: 12_500,
  marginalRelief: false, // no marginal relief in old regime
} as const;

export const REBATE_87A_NEW = {
  incomeLimit: 1_200_000,
  maxRebate: 60_000,
  marginalRelief: true,
  marginalReliefThreshold: 1_200_000,
} as const;

export const LIMIT_80C = 150_000; // s.80CCE: 80C + 80CCC + 80CCD(1)
export const LIMIT_80CCD_1B = 50_000; // own NPS, over and above 80CCE
export const RATE_80CCD_1_SALARIED = 0.1; // own NPS sub-limit within 80CCE
export const RATE_80CCD_2_NEW = 0.14; // employer NPS, new regime, all employers
export const RATE_80CCD_2_OLD_PRIVATE = 0.1; // employer NPS, old regime, non-govt
export const RATE_80CCD_2_OLD_GOVT = 0.14; // employer NPS, old regime, govt

export const LIMIT_80D_SELF_BELOW_60 = 25_000;
export const LIMIT_80D_SELF_60_PLUS = 50_000;
export const LIMIT_80D_PARENTS_BELOW_60 = 25_000;
export const LIMIT_80D_PARENTS_60_PLUS = 50_000;
export const LIMIT_80D_PREVENTIVE = 5_000; // inside the above, not on top

export const LIMIT_80TTA = 10_000; // savings interest, under 60
export const LIMIT_80TTB = 50_000; // all deposit interest, 60+

export const LIMIT_24B_SELF_OCCUPIED = 200_000; // s.24(b)
export const LIMIT_HP_LOSS_SETOFF = 200_000; // s.71(3A)

export const LIMIT_80DD_NORMAL = 75_000; // 40-79% disability, flat
export const LIMIT_80DD_SEVERE = 125_000; // 80%+ disability, flat
export const LIMIT_80U_NORMAL = 75_000;
export const LIMIT_80U_SEVERE = 125_000;
export const LIMIT_80DDB_NORMAL = 40_000;
export const LIMIT_80DDB_SENIOR = 100_000;

export const HRA_METRO_RATE = 0.5;
export const HRA_NON_METRO_RATE = 0.4;
export const HRA_RENT_OFFSET = 0.1;
export const HRA_METRO_CITIES = ["Delhi", "Mumbai", "Kolkata", "Chennai"] as const;

export const EPF_EMPLOYEE_RATE = 0.12;
export const EPF_WAGE_CEILING_MONTHLY = 15_000;
export const EPF_CAPPED_MONTHLY = 1_800; // 12% of 15,000

export const ROUNDING_INCOME = 10; // s.288A
export const ROUNDING_TAX = 10; // s.288B

// Derived, useful for tests and for the "cliff" warning (PRD §13.10.3)
export const NEW_MARGINAL_RELIEF_BREAKEVEN = 1_270_588;
