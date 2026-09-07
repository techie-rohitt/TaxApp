import type { ExplanationResult } from "../../lib/tax/impact";
import { formatINR } from "../../lib/tax/format";

/** PRD §10.4 / §20 — "what each of your answers did". */
export function ExplanationSection({ explanation }: { explanation: ExplanationResult }) {
  if (explanation.cards.length === 0) return null;

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">What each of your answers did</h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{explanation.summary}</p>
      <div className="flex flex-col gap-3">
        {explanation.cards.map((card) => (
          <div
            key={card.key}
            className="rounded-[var(--radius-card)] border border-[var(--border)] p-4"
          >
            <p className="font-semibold">{card.title}</p>
            <div className="mt-1 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[var(--old-soft)] px-2 py-1 text-[var(--old-regime)]">
                {card.oldImpact >= 0
                  ? `Saved ${formatINR(card.oldImpact)} in the old regime`
                  : `Cost ${formatINR(-card.oldImpact)} in the old regime`}
              </span>
              <span className="rounded-full bg-[var(--new-soft)] px-2 py-1 text-[var(--new-regime)]">
                {card.newImpact >= 0
                  ? `Saved ${formatINR(card.newImpact)} in the new regime`
                  : `Cost ${formatINR(-card.newImpact)} in the new regime`}
              </span>
            </div>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
