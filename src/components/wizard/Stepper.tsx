import { useId } from "react";

export interface StepperProps {
  label: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, min, max, value, onChange }: StepperProps) {
  const id = useId();
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="flex w-fit items-center gap-2">
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => onChange(clamp(value - 1))}
          className="h-11 w-11 rounded-[var(--radius-input)] border border-[var(--border-strong)] text-lg leading-none"
        >
          −
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(clamp(Number(e.target.value) || min))}
          className="w-14 rounded-[var(--radius-input)] border border-[var(--border-strong)] py-1.5 text-center tabular-nums"
        />
        <button
          type="button"
          aria-label="Increase"
          onClick={() => onChange(clamp(value + 1))}
          className="h-11 w-11 rounded-[var(--radius-input)] border border-[var(--border-strong)] text-lg leading-none"
        >
          +
        </button>
      </div>
    </div>
  );
}
