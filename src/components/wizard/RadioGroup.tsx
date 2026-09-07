import { useId } from "react";

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  subtitle?: string;
}

export interface RadioGroupProps<T extends string> {
  legend: string;
  helper?: string;
  options: RadioOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  required?: boolean;
  error?: string;
  layout?: "row" | "column" | "cards";
}

export function RadioGroup<T extends string>({
  legend,
  helper,
  options,
  value,
  onChange,
  required,
  error,
  layout = "row",
}: RadioGroupProps<T>) {
  const name = useId();
  const helperId = `${name}-helper`;
  const errorId = `${name}-error`;

  const optionsClassName =
    layout === "cards"
      ? "grid gap-2 sm:grid-cols-3"
      : layout === "column"
        ? "flex flex-col gap-2"
        : "flex flex-wrap gap-4";

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={`${helperId} ${errorId}`}>
      <legend className="text-sm font-medium">
        {legend}
        {required ? <span className="text-[var(--error)]"> *</span> : null}
      </legend>
      {helper ? (
        <p id={helperId} className="-mt-1 text-xs text-[var(--text-muted)]">
          {helper}
        </p>
      ) : (
        <span id={helperId} />
      )}
      <div className={optionsClassName}>
        {options.map((option) =>
          layout === "cards" ? (
            <label
              key={option.value}
              className={`cursor-pointer rounded-[var(--radius-card)] border px-4 py-3 text-sm ${
                value === option.value
                  ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                  : "border-[var(--border-strong)]"
              }`}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span className="font-medium">{option.label}</span>
              {option.subtitle ? (
                <span className="mt-0.5 block text-xs text-[var(--text-muted)]">
                  {option.subtitle}
                </span>
              ) : null}
            </label>
          ) : (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
              />
              {option.label}
            </label>
          ),
        )}
      </div>
      <p id={errorId} className="text-xs text-[var(--error)]" aria-live="polite">
        {error ?? ""}
      </p>
    </fieldset>
  );
}
