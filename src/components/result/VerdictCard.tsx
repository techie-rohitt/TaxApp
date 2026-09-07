import { Link, useNavigate } from "react-router-dom";
import type { FullTaxResult } from "../../lib/tax/compute";
import { formatINR } from "../../lib/tax/format";
import { pickWinner } from "../../lib/tax/verdict";
import { useWizardStore } from "../../store/wizard";

/** PRD §10.1 — the verdict, above the fold. Imperative, never hedged. */
export function VerdictCard({
  oldResult,
  newResult,
  grossSalary,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
  grossSalary: number;
}) {
  const navigate = useNavigate();
  const goToStep = useWizardStore((s) => s.goToStep);
  const clearAll = useWizardStore((s) => s.clearAll);

  const bothZero = oldResult.totalTax === 0 && newResult.totalTax === 0;
  const { winner, saving, verdict } = pickWinner(oldResult, newResult);

  let heading: string;
  let subLine: string;
  if (bothZero) {
    heading = "You pay no tax either way";
    subLine =
      "Your income is below the taxable limit under both regimes. Pick the new regime — it's the default and needs no paperwork.";
  } else if (verdict === "tie") {
    heading = "It's almost a tie — go with the NEW REGIME";
    subLine = `The difference is only ${formatINR(saving)} a year. The new regime needs no investment proofs and no paperwork, so it's the easier choice.`;
  } else {
    heading = `Pick the ${winner === "new" ? "NEW" : "OLD"} REGIME`;
    subLine = `You save ${formatINR(saving)} this year — that's about ${formatINR(Math.round(saving / 12))} every month.`;
  }

  function handleChangeAnswers() {
    goToStep(1);
    navigate("/calculator");
  }

  function handleStartOver() {
    if (window.confirm("This clears everything you've entered. Start over?")) {
      clearAll();
      navigate("/calculator");
    }
  }

  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-8 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_-12px_rgba(0,0,0,0.1)] md:p-12">
      <h1 className="text-[32px] font-semibold md:text-[48px]">{heading}</h1>
      <p className="mt-3 text-lg text-[var(--text-muted)]">{subLine}</p>

      <div className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-4">
        <div
          className={`rounded-[var(--radius-card)] border p-5 ${
            !bothZero && winner === "new"
              ? "border-[var(--new-regime)] bg-[var(--new-soft)]"
              : "border-[var(--border)]"
          }`}
        >
          <p className="text-xs font-medium text-[var(--text-muted)]">NEW REGIME</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(newResult.totalTax)}</p>
          <p className="text-xs text-[var(--text-muted)]">for the year</p>
          {!bothZero && winner === "new" ? (
            <p className="mt-2 text-xs font-semibold text-[var(--new-regime)]">✓ RECOMMENDED</p>
          ) : null}
        </div>
        <div
          className={`rounded-[var(--radius-card)] border p-5 ${
            !bothZero && winner === "old"
              ? "border-[var(--old-regime)] bg-[var(--old-soft)]"
              : "border-[var(--border)]"
          }`}
        >
          <p className="text-xs font-medium text-[var(--text-muted)]">OLD REGIME</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatINR(oldResult.totalTax)}</p>
          <p className="text-xs text-[var(--text-muted)]">for the year</p>
          {!bothZero && winner === "old" ? (
            <p className="mt-2 text-xs font-semibold text-[var(--old-regime)]">✓ RECOMMENDED</p>
          ) : null}
        </div>
      </div>

      <p className="mt-6 text-sm text-[var(--text-muted)]">
        Based on a gross salary of {formatINR(grossSalary)}
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
        <button type="button" onClick={handleChangeAnswers} className="font-medium text-[var(--accent-text)] hover:underline">
          Change my answers
        </button>
        <button type="button" onClick={handleStartOver} className="font-medium text-[var(--text-muted)] hover:underline">
          Start over
        </button>
        <Link to="/how-it-works" className="font-medium text-[var(--accent-text)] hover:underline">
          See how this was calculated
        </Link>
      </div>
    </div>
  );
}
