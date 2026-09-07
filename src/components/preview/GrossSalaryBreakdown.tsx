import type { GrossSalaryResult } from "../../lib/tax/solver";
import type { WizardInputs } from "../../lib/tax/types";
import { formatINR } from "../../lib/tax/format";

interface BreakdownLine {
  label: string;
  monthly?: number;
  value: number;
  sign: "add" | "none";
}

/** PRD §12.5 — the "how did you get my gross salary?" panel. */
export function GrossSalaryBreakdown({
  inputs,
  result,
  employeePFAnnual,
  professionalTaxAnnual,
}: {
  inputs: WizardInputs;
  result: GrossSalaryResult;
  /** Resolved via §13.1 (Step 3) — 0 until the user has answered the PF questions. */
  employeePFAnnual: number;
  /** Resolved via §8.2 (Step 2), uncapped — 0 until the user has answered the professional tax questions. */
  professionalTaxAnnual: number;
}) {
  const lines: BreakdownLine[] = [
    {
      label: "What lands in your bank",
      monthly: inputs.monthlyInHand,
      value: inputs.monthlyInHand * 12,
      sign: "none",
    },
    { label: "Add back: your PF", monthly: employeePFAnnual / 12, value: employeePFAnnual, sign: "add" },
    {
      label: "Add back: professional tax",
      monthly: professionalTaxAnnual / 12,
      value: professionalTaxAnnual,
      sign: "add",
    },
    {
      label:
        result.derivation === "exact"
          ? "Add back: income tax deducted (from your payslip)"
          : "Add back: income tax deducted (our estimate)",
      monthly: result.derivation === "exact" ? inputs.monthlyTDS : undefined,
      value: result.derivation === "exact" ? inputs.monthlyTDS * 12 : result.estimatedAnnualTax,
      sign: "add",
    },
    { label: "Add: annual bonus", value: inputs.annualBonus, sign: "add" },
  ];

  if (inputs.otherTaxableSalary > 0) {
    lines.push({ label: "Add: other taxable salary", value: inputs.otherTaxableSalary, sign: "add" });
  }

  return (
    <details className="rounded-[var(--radius-card)] border border-[var(--border)] px-4 py-3 text-sm">
      <summary className="cursor-pointer font-medium">How did you get my gross salary?</summary>
      <div className="mt-3 flex flex-col gap-1.5">
        <p className="font-medium">Working out your gross salary</p>
        {lines.map((line) => (
          <div key={line.label} className="flex items-baseline justify-between gap-4 text-[var(--text-muted)]">
            <span>
              {line.label}
              {line.monthly !== undefined ? (
                <span className="tabular-nums"> — {formatINR(line.monthly)} × 12</span>
              ) : null}
            </span>
            <span className="shrink-0 tabular-nums text-[var(--text)]">
              {line.sign === "add" ? "+ " : ""}
              {formatINR(line.value)}
            </span>
          </div>
        ))}
        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-[var(--border-strong)] pt-1.5 font-semibold">
          <span>Your gross salary for the year</span>
          <span className="tabular-nums">{formatINR(result.annualGross)}</span>
        </div>

        {result.derivation !== "exact" ? (
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            We worked out the tax figure ourselves, assuming your employer is using the{" "}
            {result.assumedRegime === "old" ? "old" : "new"} regime. If your payslip shows a
            different TDS amount, go back to step 1 and enter it — it&apos;ll make this exact.
          </p>
        ) : null}

        {result.ambiguous ? (
          <p className="mt-2 rounded-[var(--radius-input)] bg-[var(--warn-soft)] px-2 py-1.5 text-xs text-[var(--warn)]">
            Your take-home lands in an unusual zone where a small pay rise wouldn&apos;t increase
            your take-home at all. We&apos;ve used the lower of the two possible salaries:{" "}
            {formatINR(result.annualGross)}. If your actual gross is different, enter your monthly
            TDS on step 1 for an exact answer.
          </p>
        ) : null}

        {result.derivation === "fallback" ? (
          <p className="mt-2 rounded-[var(--radius-input)] bg-[var(--warn-soft)] px-2 py-1.5 text-xs text-[var(--warn)]">
            We couldn&apos;t work backwards reliably from that number. We&apos;ve used{" "}
            {formatINR(result.annualGross)} as your gross salary. For an exact result, please
            enter your monthly TDS amount.
          </p>
        ) : null}
      </div>
    </details>
  );
}
