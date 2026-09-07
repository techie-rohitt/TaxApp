import { Navigate } from "react-router-dom";
import { useWizardStore } from "../store/wizard";
import { computeFullTax } from "../lib/tax/compute";
import { deriveComputed } from "../lib/tax/derive";
import { buildExplanation } from "../lib/tax/impact";
import { buildSuggestions } from "../lib/tax/suggestions";
import { pickWinner } from "../lib/tax/verdict";
import { AGE_LABELS } from "../content/ageLabels";
import { DISCLAIMER_PARAGRAPHS } from "../content/disclaimer";
import { OutOfScopeBanner } from "../components/OutOfScopeBanner";
import { ComparisonTable } from "../components/result/ComparisonTable";
import { ExplanationSection } from "../components/result/ExplanationSection";
import { NextSteps } from "../components/result/NextSteps";
import { SlabBreakdownSection } from "../components/result/SlabBreakdownSection";
import { SuggestionsSection } from "../components/result/SuggestionsSection";
import { VerdictCard } from "../components/result/VerdictCard";

/** PRD §5 — /result is not reachable unless the wizard is complete; a direct visit redirects. */
export default function Result() {
  const inputs = useWizardStore((s) => s.inputs);

  if (inputs.monthlyInHand <= 0) {
    return <Navigate to="/calculator" replace />;
  }

  const computed = deriveComputed(inputs);
  const oldResult = computeFullTax("old", computed);
  const newResult = computeFullTax("new", computed);
  const { winner } = pickWinner(oldResult, newResult);
  const explanation = buildExplanation(inputs);
  const suggestions = buildSuggestions(inputs);

  return (
    <div className="mx-auto flex max-w-[1000px] flex-col gap-12 px-4 py-10 sm:px-6 sm:py-12 md:gap-16">
      <OutOfScopeBanner computed={computed} />

      <VerdictCard oldResult={oldResult} newResult={newResult} grossSalary={computed.annualGross} />

      <ComparisonTable oldResult={oldResult} newResult={newResult} />

      <SlabBreakdownSection
        oldResult={oldResult}
        newResult={newResult}
        ageLabel={AGE_LABELS[computed.ageBand]}
      />

      <ExplanationSection explanation={explanation} />

      <SuggestionsSection suggestions={suggestions} />

      <NextSteps winner={winner} />

      <footer className="space-y-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--text-faint)]">
        {DISCLAIMER_PARAGRAPHS.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </footer>
    </div>
  );
}
