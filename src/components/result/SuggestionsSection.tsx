import type { Suggestion } from "../../lib/tax/suggestions";
import { formatINR } from "../../lib/tax/format";

/** PRD §10.5 / §21 — "what you could do next". Up to five cards, each with a rupee figure. */
export function SuggestionsSection({ suggestions }: { suggestions: Suggestion[] }) {
  if (suggestions.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">What you could do next</h2>
      <div className="flex flex-col gap-3">
        {suggestions.map((s) => (
          <div
            key={s.key}
            className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--border)] p-4"
          >
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="mt-1 text-sm text-[var(--text-muted)]">{s.body}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-lg font-semibold tabular-nums text-[var(--accent-text)]">
                {formatINR(s.amount)}
              </p>
              <p className="text-xs text-[var(--text-muted)]">estimated yearly saving</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-[var(--text-muted)]">
        These are estimates based on what you told us, not financial advice. Any lock-in period,
        liquidity need or personal goal matters more than the tax saving.
      </p>
    </div>
  );
}
