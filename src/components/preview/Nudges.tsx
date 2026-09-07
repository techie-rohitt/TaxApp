import type { FullTaxResult } from "../../lib/tax/compute";
import { LIMIT_80C, RATE_80CCD_2_NEW } from "../../lib/tax/constants";
import { formatINR } from "../../lib/tax/format";
import { marginalRate } from "../../lib/tax/marginalRate";
import type { Computed } from "../../lib/tax/types";
import { pickWinner } from "./VerdictStrip";

interface Nudge {
  text: string;
  amount: number;
}

/**
 * PRD §9.2 Block 8 / §21 — a first cut of the suggestion rules, showing the
 * top two by rupee value. The full 17-rule engine (§21.2) is result-page
 * scope; this seeds the pattern with the highest-value, simplest ones.
 */
export function Nudges({
  computed,
  oldResult,
  newResult,
}: {
  computed: Computed;
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
}) {
  const { winner, saving } = pickWinner(oldResult, newResult);
  const nudges: Nudge[] = [];

  const oldDeductions = oldResult.deductions as { ded80CCE: number };
  const room80C = Math.max(0, LIMIT_80C - oldDeductions.ded80CCE);
  if (winner === "old" && room80C > 0) {
    const rate = marginalRate("old", computed);
    nudges.push({
      text: `You've used ${formatINR(oldDeductions.ded80CCE)} of the ₹1.5 lakh limit. Putting the remaining ${formatINR(room80C)} into PPF, ELSS or a five-year tax-saving FD would cut your tax by about ${formatINR(Math.round(room80C * rate))}.`,
      amount: room80C * rate,
    });
  }

  if (computed.employerNPSAnnual === 0) {
    const cap = Math.round(computed.basicPlusDaAnnual * RATE_80CCD_2_NEW);
    const rate = marginalRate("new", computed);
    nudges.push({
      text: `Ask HR about corporate NPS — it's the only deduction that still works in the new regime. Routing ${formatINR(cap)} a year into your NPS out of your existing CTC would save about ${formatINR(Math.round(cap * rate))} without earning a rupee more.`,
      amount: cap * rate,
    });
  }

  if (winner === "new" && saving > 20_000) {
    nudges.push({
      text: `The new regime saves you ${formatINR(saving)} and asks for nothing in return — no rent receipts, no investment proofs, no insurance certificates.`,
      amount: saving,
    });
  }

  if (saving < 5_000) {
    nudges.push({
      text: `It's close — the difference is only ${formatINR(saving)} a year. At that margin, the new regime is the simpler pick: it's the default and needs no paperwork.`,
      amount: 5_000 - saving, // ensures this still sorts sensibly among near-ties
    });
  }

  const top = nudges.sort((a, b) => b.amount - a.amount).slice(0, 2);
  if (top.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {top.map((n) => (
        <p
          key={n.text}
          className="rounded-[var(--radius-card)] bg-[var(--accent-soft)] px-3 py-2 text-xs"
        >
          {n.text}
        </p>
      ))}
    </div>
  );
}
