/**
 * PRD §6.1 — the "confidence preview". A static, non-interactive mock of the
 * real result card, rendered with fixed sample data. It never recalculates
 * and never links to real engine output — that's the whole point of it.
 */
export function SampleResultCard() {
  return (
    <div>
      <div
        className="-rotate-2 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),0_4px_6px_-4px_rgba(0,0,0,0.06)]"
        aria-hidden="true"
      >
        <div className="mb-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <span className="inline-block h-2 w-2 rounded-full bg-[var(--text-faint)]" />
          Sample result
        </div>

        <p className="text-sm font-semibold tracking-wide text-[var(--new-regime)] uppercase">
          Pick the New Regime
        </p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">You save ₹34,320 this year</p>
        <p className="text-[var(--text-muted)] tabular-nums">(about ₹2,860 every month)</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[var(--radius-card)] border border-[var(--new-regime)] bg-[var(--new-soft)] p-3">
            <p className="text-xs font-medium text-[var(--text-muted)]">NEW REGIME</p>
            <p className="text-xl font-semibold tabular-nums">₹97,500</p>
            <p className="text-xs font-medium text-[var(--new-regime)]">✓ Lower</p>
          </div>
          <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-sunk)] p-3">
            <p className="text-xs font-medium text-[var(--text-muted)]">OLD REGIME</p>
            <p className="text-xl font-semibold tabular-nums">₹1,31,820</p>
          </div>
        </div>

        <p className="mt-4 text-xs text-[var(--text-muted)]">
          Based on ₹15,00,000 salary, ₹25,000/mo rent in a metro city, ₹1.5L in 80C.
        </p>
      </div>

      <p className="mt-3 text-center text-xs text-[var(--text-faint)]">
        This is an example. Your numbers will replace these.
      </p>
    </div>
  );
}
