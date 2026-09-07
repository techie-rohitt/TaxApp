import { computeTax } from "./compute";
import type { AgeBand, Regime, TdsKnowledge } from "./types";

/**
 * PRD §12. Working backwards from take-home pay to gross salary.
 *
 * `monthlyEmployeePF` and `monthlyProfTax` are treated as known constants
 * here, not re-derived from a candidate gross salary — that derivation
 * (basic salary as a share of gross, PF as 12% of basic, PRD §13.1) doesn't
 * exist until Step 3 (Phase 5). Until then this module only ever receives 0
 * for both. GT-8's worked example confirms this is the right shape for a
 * *known* PF figure: it folds employee PF straight into the constant `base`
 * alongside professional tax, exactly like §12.1's algebraic relationship.
 */

export interface SolverInput {
  monthlyInHand: number;
  monthlyEmployeePF: number;
  monthlyProfTax: number;
  annualBonus: number;
  otherSalary: number;
  ageBand: AgeBand;
  employerRegime: Regime;
}

export interface SolverResult {
  ok: boolean;
  annualGross: number;
  ambiguous: boolean;
  ambiguityRange: [number, number] | null;
  /** The annual tax the solver computed at the returned root — reused by the UI so it never has to recompute tax itself (PRD §24.3 rule 1). */
  annualTaxAtRoot: number;
}

const COARSE_STEP = 500;
const BISECT_ITERATIONS = 60;

function annualTaxFor(input: SolverInput, annualGross: number): number {
  return computeTax(input.employerRegime, {
    annualGrossSalary: annualGross,
    ageBand: input.ageBand,
    professionalTaxAnnual: input.monthlyProfTax * 12,
  }).totalTax;
}

function residual(input: SolverInput, base: number, annualGross: number): number {
  return annualGross - annualTaxFor(input, annualGross) - base;
}

function bisect(input: SolverInput, base: number, lo: number, hi: number): number {
  let a = lo;
  let b = hi;
  for (let i = 0; i < BISECT_ITERATIONS; i++) {
    const mid = (a + b) / 2;
    const fMid = residual(input, base, mid);
    if (fMid === 0) return mid;
    const fA = residual(input, base, a);
    if (Math.sign(fA) === Math.sign(fMid)) {
      a = mid;
    } else {
      b = mid;
    }
  }
  return (a + b) / 2;
}

/** PRD §12.4 — coarse scan for every sign change, then bisect each one to ±₹1. */
export function solveGrossFromInHand(input: SolverInput): SolverResult {
  const base =
    12 * (input.monthlyInHand + input.monthlyEmployeePF + input.monthlyProfTax) +
    input.annualBonus +
    input.otherSalary;

  // Lower bound: gross can never be below what already lands in hand plus known deductions.
  const lo = base;
  const hi = base * 2.2 + 500_000;

  const roots: number[] = [];
  let prevG = lo;
  let prevF = residual(input, base, lo);
  for (let g = lo + COARSE_STEP; g <= hi; g += COARSE_STEP) {
    const curF = residual(input, base, g);
    if (prevF === 0) {
      roots.push(prevG);
    } else if (Math.sign(prevF) !== Math.sign(curF)) {
      roots.push(bisect(input, base, prevG, g));
    }
    prevG = g;
    prevF = curF;
  }

  if (roots.length === 0) {
    const fallbackGross = Math.round(base / 10) * 10;
    return {
      ok: false,
      annualGross: fallbackGross,
      ambiguous: false,
      ambiguityRange: null,
      annualTaxAtRoot: annualTaxFor(input, fallbackGross),
    };
  }

  // Multiple roots (the marginal-relief band, §12.3): the smallest is the
  // conservative, most-likely-true answer.
  const gross = Math.round(roots[0] / 10) * 10;
  return {
    ok: true,
    annualGross: gross,
    ambiguous: roots.length > 1,
    ambiguityRange: roots.length > 1 ? [roots[0], roots[roots.length - 1]] : null,
    annualTaxAtRoot: annualTaxFor(input, gross),
  };
}

export type GrossSalaryDerivation = "exact" | "solved" | "fallback";

export interface GrossSalaryInput {
  monthlyInHand: number;
  tdsKnowledge: TdsKnowledge | "";
  monthlyTDS: number;
  employerRegime: Regime | "unknown";
  annualBonus: number;
  otherTaxableSalary: number;
  /** Not yet collected by the wizard (Step 2, Phase 5) — defaults to below60. */
  ageBand?: AgeBand;
  /** Not yet collected by the wizard (Step 3, Phase 5) — always 0 until then. */
  monthlyEmployeePF?: number;
  monthlyProfTax?: number;
}

export interface GrossSalaryResult {
  annualGross: number;
  derivation: GrossSalaryDerivation;
  ambiguous: boolean;
  assumedRegime: Regime;
  /** Meaningful only when derivation !== "exact" — the tax the solve assumed at the root. */
  estimatedAnnualTax: number;
}

/** PRD §12.6 (exact path) and §12.4/§12.5 (solved path) combined. */
export function deriveGrossSalary(input: GrossSalaryInput): GrossSalaryResult {
  const monthlyEmployeePF = input.monthlyEmployeePF ?? 0;
  const monthlyProfTax = input.monthlyProfTax ?? 0;
  const ageBand = input.ageBand ?? "below60";
  const assumedRegime: Regime = input.employerRegime === "old" ? "old" : "new";

  if (input.tdsKnowledge === "known") {
    const annualGross =
      12 * (input.monthlyInHand + monthlyEmployeePF + monthlyProfTax + input.monthlyTDS) +
      input.annualBonus +
      input.otherTaxableSalary;
    return {
      annualGross,
      derivation: "exact",
      ambiguous: false,
      assumedRegime,
      estimatedAnnualTax: 0,
    };
  }

  const result = solveGrossFromInHand({
    monthlyInHand: input.monthlyInHand,
    monthlyEmployeePF,
    monthlyProfTax,
    annualBonus: input.annualBonus,
    otherSalary: input.otherTaxableSalary,
    ageBand,
    employerRegime: assumedRegime,
  });

  return {
    annualGross: result.annualGross,
    derivation: result.ok ? "solved" : "fallback",
    ambiguous: result.ambiguous,
    assumedRegime,
    estimatedAnnualTax: result.annualTaxAtRoot,
  };
}
