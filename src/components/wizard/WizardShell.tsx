import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useWizardStore } from "../../store/wizard";
import { deriveComputed } from "../../lib/tax/derive";
import { WIZARD_STEPS } from "../../content/steps";
import { STEP_FAQS } from "../../content/faqs";
import { OutOfScopeBanner } from "../OutOfScopeBanner";
import { ProgressDots } from "./ProgressDots";
import { StepFAQ } from "./StepFAQ";
import Step1Salary from "./steps/Step1Salary";
import Step2AboutYou from "./steps/Step2AboutYou";
import Step3SalaryStructure from "./steps/Step3SalaryStructure";
import Step4Rent from "./steps/Step4Rent";
import Step5Investments from "./steps/Step5Investments";
import Step6Health from "./steps/Step6Health";
import Step7HomeNPS from "./steps/Step7HomeNPS";
import Step8OtherIncome from "./steps/Step8OtherIncome";
import ComingSoonStep from "./steps/ComingSoonStep";
import type { StepHandle } from "./steps/StepHandle";
import { PreviewPanel } from "../preview/PreviewPanel";

const TOAST_DURATION_MS = 5_000;

export function WizardShell() {
  const navigate = useNavigate();
  const inputs = useWizardStore((s) => s.inputs);
  const currentStep = useWizardStore((s) => s.currentStep);
  const goToStep = useWizardStore((s) => s.goToStep);
  const clearAll = useWizardStore((s) => s.clearAll);
  const setFields = useWizardStore((s) => s.setFields);
  const hasRestoredDraft = useWizardStore((s) => s.hasRestoredDraft);
  const resetCount = useWizardStore((s) => s.resetCount);

  const [showFreshToast, setShowFreshToast] = useState(!hasRestoredDraft);
  const stepRef = useRef<StepHandle>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  // Restore the step from the URL hash on mount (PRD §7.3 — browser back/forward support).
  useEffect(() => {
    const match = window.location.hash.match(/^#step-(\d+)$/);
    if (match) {
      const step = Number(match[1]);
      if (step >= 1 && step <= WIZARD_STEPS.length) goToStep(step);
    }
  }, [goToStep]);

  useEffect(() => {
    window.history.replaceState(null, "", `#step-${currentStep}`);
  }, [currentStep]);

  useEffect(() => {
    if (!showFreshToast) return;
    const timer = setTimeout(() => setShowFreshToast(false), TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [showFreshToast]);

  // Move focus to the new step on every step change (not the initial mount,
  // so we don't steal focus from the page on first load) — PRD §26 keyboard
  // and screen-reader users otherwise keep focus on the "Continue" button
  // while the content underneath it silently changes.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    stepContainerRef.current?.focus();
  }, [currentStep]);

  const meta = WIZARD_STEPS[currentStep - 1];
  const faqItems = STEP_FAQS[meta.id] ?? [];
  const isLastStep = currentStep === WIZARD_STEPS.length;

  function handleContinue() {
    if (!stepRef.current?.validate()) return;
    if (isLastStep) {
      navigate("/result");
    } else {
      goToStep(currentStep + 1);
    }
  }

  function handleSkip() {
    if (meta.skipDefaults) setFields(meta.skipDefaults);
    if (isLastStep) {
      navigate("/result");
    } else {
      goToStep(currentStep + 1);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-8">
      <div className="mb-6 flex items-center justify-end">
        <button
          type="button"
          onClick={clearAll}
          className="text-sm text-[var(--text-muted)] hover:underline"
        >
          Clear my data
        </button>
      </div>

      {showFreshToast ? (
        <div className="mb-6 flex items-start justify-between gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-sunk)] px-4 py-3 text-sm">
          <span>We start fresh each time — your data is never stored on a server.</span>
          <button
            type="button"
            onClick={() => setShowFreshToast(false)}
            aria-label="Dismiss"
            className="text-[var(--text-muted)]"
          >
            ✕
          </button>
        </div>
      ) : null}

      <OutOfScopeBanner computed={deriveComputed(inputs)} />

      <div className="lg:grid lg:grid-cols-[58fr_42fr] lg:gap-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
          className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] md:p-8"
        >
          <ProgressDots currentStep={currentStep} />

          <div key={currentStep} ref={stepContainerRef} tabIndex={-1} className="step-transition outline-none">
          {currentStep === 1 ? (
            <Step1Salary key={resetCount} ref={stepRef} />
          ) : currentStep === 2 ? (
            <Step2AboutYou key={resetCount} ref={stepRef} />
          ) : currentStep === 3 ? (
            <Step3SalaryStructure key={resetCount} ref={stepRef} />
          ) : currentStep === 4 ? (
            <Step4Rent key={resetCount} ref={stepRef} />
          ) : currentStep === 5 ? (
            <Step5Investments key={resetCount} ref={stepRef} />
          ) : currentStep === 6 ? (
            <Step6Health key={resetCount} ref={stepRef} />
          ) : currentStep === 7 ? (
            <Step7HomeNPS key={resetCount} ref={stepRef} />
          ) : currentStep === 8 ? (
            <Step8OtherIncome key={resetCount} ref={stepRef} />
          ) : (
            <ComingSoonStep key={resetCount} ref={stepRef} title={meta.title} />
          )}
          </div>

          {!meta.required && meta.skipDefaults ? (
            <button
              type="button"
              onClick={handleSkip}
              className="mt-4 inline-block min-h-[44px] py-2.5 text-sm text-[var(--text-muted)] hover:underline"
            >
              Skip this — doesn&apos;t apply to me
            </button>
          ) : null}

          <div className="mt-8 flex items-center justify-between border-t border-[var(--border)] pt-6">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => goToStep(currentStep - 1)}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-[var(--text-muted)] hover:underline"
              >
                ← Back
              </button>
            ) : (
              <span />
            )}
            <button
              type="submit"
              className="rounded-[var(--radius-button)] bg-[var(--accent)] px-6 py-2.5 font-medium text-white hover:opacity-90"
            >
              {isLastStep ? "See my result →" : "Continue"}
            </button>
          </div>

          <StepFAQ items={faqItems} />
        </form>

        <div className="mt-8 lg:mt-0">
          <PreviewPanel />
        </div>
      </div>

      <footer className="mt-10 flex gap-6 text-sm text-[var(--text-muted)]">
        <Link to="/how-it-works" className="hover:underline">
          How it works
        </Link>
        <Link to="/privacy" className="hover:underline">
          Privacy
        </Link>
      </footer>
    </div>
  );
}
