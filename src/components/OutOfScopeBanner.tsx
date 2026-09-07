import { useState } from "react";
import type { Computed } from "../lib/tax/types";

/** PRD §17.4 — persistent, dismissible amber banners for scenarios this calculator understates or excludes. */
export function OutOfScopeBanner({ computed }: { computed: Computed }) {
  const [dismissed, setDismissed] = useState<Record<string, boolean>>({});

  const messages: { key: string; text: string }[] = [];

  if (computed.annualGross > 50_00_000) {
    messages.push({
      key: "surcharge",
      text: "Above ₹50 lakh, an extra charge called surcharge applies. We don't calculate it, so both numbers below are lower than your real tax. The comparison between the two regimes is still broadly useful, but please confirm the final figures with a CA.",
    });
  }
  if (computed.propertyUse === "letOut") {
    messages.push({
      key: "letOut",
      text: "We only handle the home you live in. Your rented-out property isn't included in these numbers.",
    });
  }
  if (computed.propertyUse === "underConstruction") {
    messages.push({
      key: "underConstruction",
      text: "Interest paid while a house is under construction follows a different rule that we don't handle. It isn't included here.",
    });
  }

  const visible = messages.filter((m) => !dismissed[m.key]);
  if (visible.length === 0) return null;

  return (
    <div className="mb-6 flex flex-col gap-2">
      {visible.map((m) => (
        <div
          key={m.key}
          className="flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--warn)] bg-[var(--warn-soft)] px-4 py-3 text-sm text-[var(--warn)]"
        >
          <span>{m.text}</span>
          <button
            type="button"
            onClick={() => setDismissed((d) => ({ ...d, [m.key]: true }))}
            aria-label="Dismiss"
            className="shrink-0"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
