import type { FullTaxResult } from "../../lib/tax/compute";
import { formatINR } from "../../lib/tax/format";
import { pickWinner } from "../../lib/tax/verdict";

export { pickWinner };

/** PRD §9.2 Block 0 — the sticky verdict strip. Never shown before step 3 is complete (§9.1). */
export function VerdictStrip({
  oldResult,
  newResult,
  ready,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
  ready: boolean;
}) {
  if (!ready) {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-[var(--radius-card)] bg-[var(--surface-sunk)] px-3 py-2 text-sm font-medium text-[var(--text-muted)]"
      >
        Still gathering your details…
      </p>
    );
  }

  const { winner, saving, verdict } = pickWinner(oldResult, newResult);

  if (verdict === "tie") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="rounded-[var(--radius-card)] bg-[var(--surface-sunk)] px-3 py-2 text-sm font-medium"
      >
        It&apos;s basically a tie — within {formatINR(saving)} either way.
      </p>
    );
  }

  const winnerColorVar = winner === "new" ? "--new-soft" : "--old-soft";
  const winnerTextVar = winner === "new" ? "--new-regime" : "--old-regime";

  return (
    <p
      key={winner}
      role="status"
      aria-live="polite"
      className="winner-flip-highlight rounded-[var(--radius-card)] px-3 py-2 text-sm font-semibold"
      style={{
        backgroundColor: `var(${winnerColorVar})`,
        color: `var(${winnerTextVar})`,
      }}
    >
      {winner === "new" ? "NEW REGIME" : "OLD REGIME"} is ahead — saving you {formatINR(saving)}
    </p>
  );
}
