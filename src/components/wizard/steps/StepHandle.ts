/**
 * Imperative handle every step component exposes to `WizardShell`. Calling
 * `validate()` marks all of the step's required fields as touched (so any
 * errors become visible) and returns whether the step may be left.
 */
export interface StepHandle {
  validate: () => boolean;
}
