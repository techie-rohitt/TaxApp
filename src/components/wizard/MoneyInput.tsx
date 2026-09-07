import { useId, useRef, useState, type ChangeEvent, type FocusEvent } from "react";
import { formatIndianGrouping, formatINR, parseIndianMoneyInput } from "../../lib/tax/format";

export interface MoneyInputProps {
  label: string;
  helper?: string;
  /** "monthly" shows an annualised sub-label; "annual" shows a monthly one. Omit for neither. */
  period?: "monthly" | "annual";
  /** Extra clause appended in parentheses after the auto sub-label, e.g. step 1's "(before we add back your deductions)". */
  subLabelNote?: string;
  value: number;
  onChange: (value: number) => void;
  /** Fired on blur only — the point at which validation errors are allowed to appear (PRD §7.5). */
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  warning?: string;
  min?: number;
  max?: number;
  /** e.g. rent's ₹8,000 / ₹12,000 / ₹18,000 / ₹25,000 / ₹35,000 (PRD §7.5, §8.4). */
  quickFills?: number[];
}

function digitsBefore(text: string, caret: number): number {
  return text.slice(0, caret).replace(/[^\d]/g, "").length;
}

function caretAfterNDigits(text: string, n: number): number {
  if (n <= 0) return 0;
  let count = 0;
  for (let i = 0; i < text.length; i++) {
    if (/\d/.test(text[i])) count++;
    if (count === n) return i + 1;
  }
  return text.length;
}

export function MoneyInput({
  label,
  helper,
  period,
  subLabelNote,
  value,
  onChange,
  onBlur,
  required,
  error,
  warning,
  min,
  max,
  quickFills,
}: MoneyInputProps) {
  const id = useId();
  const helperId = `${id}-helper`;
  const errorId = `${id}-error`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState(() => (value ? formatIndianGrouping(value) : ""));

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const el = e.target;
    const caret = el.selectionStart ?? el.value.length;
    const nDigits = digitsBefore(el.value, caret);

    const parsed = parseIndianMoneyInput(el.value);
    const nextText = parsed === 0 && !/\d/.test(el.value) ? "" : formatIndianGrouping(parsed);
    setText(nextText);
    onChange(parsed);

    // Restore caret position relative to the digits typed so far (PRD §7.5 "live formatting").
    requestAnimationFrame(() => {
      if (!inputRef.current) return;
      const pos = caretAfterNDigits(nextText, nDigits);
      inputRef.current.setSelectionRange(pos, pos);
    });
  }

  function handleBlur(e: FocusEvent<HTMLInputElement>) {
    // Normalise alternate paste formats (1.5L, 1.5 lakh, ₹150000, ...) on blur.
    const parsed = parseIndianMoneyInput(e.target.value);
    setText(parsed ? formatIndianGrouping(parsed) : "");
    onBlur?.();
  }

  const subLabel =
    period === "monthly"
      ? `= ${formatINR(value * 12)} per year${subLabelNote ? ` (${subLabelNote})` : ""}`
      : period === "annual"
        ? `= ${formatINR(Math.round(value / 12))} per month${subLabelNote ? ` (${subLabelNote})` : ""}`
        : null;

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="text-[var(--error)]"> *</span> : null}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[var(--text-muted)]">
          ₹
        </span>
        <input
          ref={inputRef}
          id={id}
          type="text"
          inputMode="numeric"
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
          min={min}
          max={max}
          aria-describedby={`${helperId} ${errorId}`}
          aria-invalid={Boolean(error)}
          className="w-full rounded-[var(--radius-input)] border border-[var(--border-strong)] py-2 pr-3 pl-7 tabular-nums focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--accent)]"
        />
      </div>
      {quickFills && quickFills.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {quickFills.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => {
                setText(formatIndianGrouping(amount));
                onChange(amount);
              }}
              className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs hover:border-[var(--accent)] hover:text-[var(--accent-text)]"
            >
              {formatINR(amount)}
            </button>
          ))}
        </div>
      ) : null}
      {subLabel ? <p className="text-xs text-[var(--text-muted)] tabular-nums">{subLabel}</p> : null}
      {helper ? (
        <p id={helperId} className="text-xs text-[var(--text-muted)]">
          {helper}
        </p>
      ) : (
        <span id={helperId} />
      )}
      {warning && !error ? (
        <p className="rounded-[var(--radius-input)] bg-[var(--warn-soft)] px-2 py-1 text-xs text-[var(--warn)]">
          {warning}
        </p>
      ) : null}
      <p id={errorId} className="text-xs text-[var(--error)]" aria-live="polite">
        {error ?? ""}
      </p>
    </div>
  );
}
