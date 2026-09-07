import { useId } from "react";

export interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  readout: string;
  note?: string;
}

export function Slider({ label, min, max, step, value, onChange, readout, note }: SliderProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-[var(--accent)]"
      />
      <p className="text-sm font-medium tabular-nums">{readout}</p>
      {note ? <p className="text-xs text-[var(--text-muted)]">{note}</p> : null}
    </div>
  );
}
