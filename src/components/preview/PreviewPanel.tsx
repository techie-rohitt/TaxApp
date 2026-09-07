import { useWizardStore } from "../../store/wizard";
import { computeFullTax } from "../../lib/tax/compute";
import { deriveComputed, deriveRentBenefit } from "../../lib/tax/derive";
import { AGE_LABELS } from "../../content/ageLabels";
import { DeductionsBlock } from "./DeductionsBlock";
import { ExemptionsBlock } from "./ExemptionsBlock";
import { GrossSalaryBreakdown } from "./GrossSalaryBreakdown";
import { IncomeBlock } from "./IncomeBlock";
import { MobilePreviewBar } from "./MobilePreviewBar";
import { Nudges } from "./Nudges";
import { OtherIncomeBlock } from "./OtherIncomeBlock";
import { RentBenefitBlock } from "./RentBenefitBlock";
import { SlabTables } from "./SlabTables";
import { SummaryBlock } from "./SummaryBlock";
import { VerdictStrip } from "./VerdictStrip";

/**
 * PRD §9 — the complete live preview panel, Blocks 0-8. `computeFullTax`
 * runs for both regimes on every render; nothing here computes tax itself,
 * it only reads what the engine already worked out (§24.3 rule 1).
 */
export function PreviewPanel() {
  const inputs = useWizardStore((s) => s.inputs);
  const currentStep = useWizardStore((s) => s.currentStep);
  const hasSalary = inputs.monthlyInHand > 0;

  if (!hasSalary) {
    return (
      <aside className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)]">
        <p className="text-sm text-[var(--text-muted)]">
          Your numbers will appear here as you answer.
        </p>
      </aside>
    );
  }

  const computed = deriveComputed(inputs);
  const oldResult = computeFullTax("old", computed);
  const newResult = computeFullTax("new", computed);
  const rentBenefit = deriveRentBenefit(inputs, computed.basicMonthly, computed.isMetro);

  // PRD §9.1 — never show a winner before step 3 is complete.
  const ready = currentStep >= 4;

  const blocks = (
    <>
      <VerdictStrip oldResult={oldResult} newResult={newResult} ready={ready} />

      <IncomeBlock
        grossDerivation={computed.grossDerivation}
        annualBonus={computed.annualBonus}
        otherTaxableSalary={computed.otherTaxableSalary}
        employerNPSAnnual={computed.employerNPSAnnual}
        annualGross={computed.annualGross}
      />

      <GrossSalaryBreakdown
        inputs={inputs}
        result={{
          annualGross: computed.annualGross - computed.employerNPSAnnual,
          derivation: computed.grossDerivation,
          ambiguous: computed.grossAmbiguous,
          assumedRegime: inputs.employerRegime === "old" ? "old" : "new",
          estimatedAnnualTax: 0,
        }}
        employeePFAnnual={computed.employeePFAnnual}
        professionalTaxAnnual={computed.professionalTaxAnnualResolved}
      />

      <RentBenefitBlock rentBenefit={rentBenefit} isMetro={computed.isMetro} />

      <ExemptionsBlock oldResult={oldResult} newResult={newResult} />

      <OtherIncomeBlock computed={computed} oldResult={oldResult} newResult={newResult} />

      <DeductionsBlock oldResult={oldResult} newResult={newResult} />

      {ready ? (
        <>
          <SummaryBlock oldResult={oldResult} newResult={newResult} />
          <SlabTables
            oldResult={oldResult}
            newResult={newResult}
            ageLabel={AGE_LABELS[computed.ageBand]}
          />
          <Nudges computed={computed} oldResult={oldResult} newResult={newResult} />
        </>
      ) : null}
    </>
  );

  return (
    <>
      <aside className="hidden flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_-8px_rgba(0,0,0,0.08)] lg:sticky lg:top-6 lg:flex">
        {blocks}
      </aside>
      <MobilePreviewBar oldResult={oldResult} newResult={newResult} ready={ready}>
        {blocks}
      </MobilePreviewBar>
    </>
  );
}
