import { useState, type ReactNode } from "react";
import type { FullTaxResult } from "../../lib/tax/compute";
import { formatINR } from "../../lib/tax/format";
import { pickWinner } from "./VerdictStrip";

/**
 * PRD §7.1 / §9.3 — below 1024px the preview panel collapses to a bar
 * pinned to the bottom of the viewport; tapping it expands the same blocks
 * into a full-height sheet.
 */
export function MobilePreviewBar({
  oldResult,
  newResult,
  ready,
  children,
}: {
  oldResult: FullTaxResult;
  newResult: FullTaxResult;
  ready: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="mobile-preview-sheet"
        className="fixed inset-x-0 bottom-0 z-40 flex min-h-[44px] items-center justify-between border-t border-[var(--border-strong)] bg-[var(--surface)] px-4 py-3 text-sm shadow-[0_-4px_12px_rgba(0,0,0,0.06)]"
      >
        {ready ? (
          <span className="tabular-nums">
            NEW {formatINR(newResult.totalTax)} · OLD {formatINR(oldResult.totalTax)}
          </span>
        ) : (
          <span className="text-[var(--text-muted)]">Still gathering your details…</span>
        )}
        <span className="flex items-center gap-2 font-medium">
          {ready ? `${pickWinner(oldResult, newResult).winner === "new" ? "New" : "Old"} saves ${formatINR(pickWinner(oldResult, newResult).saving)}` : null}
          <span aria-hidden="true">{open ? "⌄" : "⌃"}</span>
        </span>
      </button>

      {/* Spacer so the pinned bar never covers page content. */}
      <div className="h-16" aria-hidden="true" />

      {open ? (
        <div
          id="mobile-preview-sheet"
          role="dialog"
          aria-modal="true"
          aria-label="Your numbers so far"
          className="fixed inset-0 z-50 overflow-y-auto bg-[var(--surface)] p-6"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mb-4 min-h-[44px] text-sm font-medium text-[var(--text-muted)]"
          >
            ✕ Close
          </button>
          <div className="flex flex-col gap-4">{children}</div>
        </div>
      ) : null}
    </div>
  );
}
