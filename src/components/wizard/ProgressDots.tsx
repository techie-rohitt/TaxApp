import { WIZARD_STEPS } from "../../content/steps";

export function ProgressDots({ currentStep }: { currentStep: number }) {
  const total = WIZARD_STEPS.length;
  const stepTitle = WIZARD_STEPS[currentStep - 1]?.title ?? "";
  const progressPercent = ((currentStep - 1) / total) * 100;

  const completedPhrase =
    currentStep <= 1
      ? "No steps completed yet."
      : `Steps 1${currentStep > 2 ? ` to ${currentStep - 1}` : ""} completed.`;

  return (
    <div className="mb-6">
      <div
        className="flex items-center gap-2"
        role="img"
        aria-live="polite"
        aria-label={`Step ${currentStep} of ${total}, ${stepTitle}. ${completedPhrase}`}
      >
        {WIZARD_STEPS.map((step, i) => {
          const stepNumber = i + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          return (
            <span
              key={step.id}
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full border ${
                isCompleted
                  ? "border-[var(--accent)] bg-[var(--accent)]"
                  : isCurrent
                    ? "border-[var(--accent)] bg-[var(--accent)] ring-2 ring-[var(--accent-soft)] ring-offset-1"
                    : "border-[var(--border-strong)] bg-transparent"
              }`}
            />
          );
        })}
        <span className="ml-2 text-sm text-[var(--text-muted)]">
          Step {currentStep} of {total} · {stepTitle}
        </span>
      </div>
      <div className="mt-2 h-0.5 w-full bg-[var(--border)]" aria-hidden="true">
        <div
          className="h-0.5 bg-[var(--accent)] transition-[width] duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
