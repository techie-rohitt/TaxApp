import { formatINR } from "../../lib/tax/format";

export interface RunningLimitBarProps {
  limit: number;
  used: number;
  atLimitMessage: string;
}

/** PRD §8.5 — the persistent ₹1.5L running-limit bar. Turns amber at 100%. */
export function RunningLimitBar({ limit, used, atLimitMessage }: RunningLimitBarProps) {
  const atLimit = used >= limit;
  const pct = Math.min(100, (used / limit) * 100);
  const left = Math.max(0, limit - used);

  return (
    <div
      className={`rounded-[var(--radius-card)] border px-4 py-3 ${
        atLimit
          ? "border-[var(--warn)] bg-[var(--warn-soft)]"
          : "border-[var(--border)] bg-[var(--surface-sunk)]"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm font-medium">
        <span>{formatINR(limit)} limit</span>
        <span className="tabular-nums">
          {formatINR(used)} used · {formatINR(left)} left
        </span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
        <div
          className={`h-2 rounded-full transition-[width] duration-300 ${
            atLimit ? "bg-[var(--warn)]" : "bg-[var(--accent)]"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {atLimit ? <p className="mt-2 text-xs text-[var(--warn)]">{atLimitMessage}</p> : null}
    </div>
  );
}
