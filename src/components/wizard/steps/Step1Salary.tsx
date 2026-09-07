import { forwardRef, useImperativeHandle, useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { RadioGroup } from "../RadioGroup";
import { useWizardStore } from "../../../store/wizard";
import type { StepHandle } from "./StepHandle";
import type { Regime, TdsKnowledge, WizardInputs } from "../../../lib/tax/types";

const TDS_KNOWLEDGE_OPTIONS: { value: TdsKnowledge; label: string }[] = [
  { value: "known", label: "Yes, and I know the amount" },
  { value: "unknownAmount", label: "Yes, but I don't know the amount" },
  { value: "none", label: "No tax is deducted" },
  { value: "unsure", label: "I'm not sure" },
];

const EMPLOYER_REGIME_OPTIONS: { value: Regime | "unknown"; label: string }[] = [
  { value: "new", label: "New regime" },
  { value: "old", label: "Old regime" },
  { value: "unknown", label: "I don't know" },
];

const SURCHARGE_WARNING_THRESHOLD_MONTHLY = 4_16_667; // ₹50L / 12, PRD §8.1 field 1.1

function validate(inputs: WizardInputs): Partial<Record<keyof WizardInputs, string>> {
  const errors: Partial<Record<keyof WizardInputs, string>> = {};

  if (!inputs.monthlyInHand || inputs.monthlyInHand < 1_000 || inputs.monthlyInHand > 50_00_000) {
    errors.monthlyInHand = "Please enter the amount your salary credit shows.";
  }

  if (!inputs.tdsKnowledge) {
    errors.tdsKnowledge = "Please choose one of the options above.";
  }

  if (
    inputs.tdsKnowledge === "known" &&
    (inputs.monthlyTDS < 0 || inputs.monthlyTDS >= inputs.monthlyInHand * 3)
  ) {
    errors.monthlyTDS = "That looks too high compared to your salary. Please check.";
  }

  if (inputs.annualBonus > 5_00_00_000) {
    errors.annualBonus = "Please check this amount.";
  }

  return errors;
}

const Step1Salary = forwardRef<StepHandle>(function Step1Salary(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);
  const [touched, setTouched] = useState<Partial<Record<keyof WizardInputs, boolean>>>({});

  const errors = validate(inputs);
  const touch = (field: keyof WizardInputs) => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field: keyof WizardInputs) => (touched[field] ? errors[field] : undefined);

  useImperativeHandle(ref, () => ({
    validate: () => {
      setTouched({
        monthlyInHand: true,
        tdsKnowledge: true,
        monthlyTDS: true,
        annualBonus: true,
      });
      return Object.keys(errors).length === 0;
    },
  }));

  const showTDSAmount = inputs.tdsKnowledge === "known";
  const showEmployerRegime = inputs.tdsKnowledge !== "" && inputs.tdsKnowledge !== "none";

  const monthlyInHandWarning =
    inputs.monthlyInHand > SURCHARGE_WARNING_THRESHOLD_MONTHLY
      ? "That works out to over ₹50 lakh a year. Above that, an extra charge called surcharge applies, which this calculator doesn't handle. Your result will be understated."
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">Let's start with your salary</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Don&apos;t worry about CTC or gross salary. We&apos;ll work those out ourselves.
        </p>
      </div>

      <MoneyInput
        label="How much money lands in your bank account each month?"
        helper="The exact amount your salary credit shows. After PF, after tax, after everything."
        period="monthly"
        subLabelNote="before we add back your deductions"
        required
        value={inputs.monthlyInHand}
        onChange={(v) => setField("monthlyInHand", v)}
        onBlur={() => touch("monthlyInHand")}
        error={shown("monthlyInHand")}
        warning={monthlyInHandWarning}
      />

      <RadioGroup
        legend="Does your payslip show income tax / TDS being deducted?"
        helper={`On your payslip it's usually called "TDS", "Income Tax" or "IT".`}
        required
        layout="column"
        options={TDS_KNOWLEDGE_OPTIONS}
        value={inputs.tdsKnowledge}
        onChange={(v) => {
          setField("tdsKnowledge", v);
          touch("tdsKnowledge");
        }}
        error={shown("tdsKnowledge")}
      />

      {showTDSAmount ? (
        <MoneyInput
          label="How much tax is deducted each month?"
          period="monthly"
          value={inputs.monthlyTDS}
          onChange={(v) => setField("monthlyTDS", v)}
          onBlur={() => touch("monthlyTDS")}
          error={shown("monthlyTDS")}
        />
      ) : null}

      {showEmployerRegime ? (
        <RadioGroup
          legend="Which regime is your employer using right now?"
          helper="If you never submitted investment proofs to HR, it's almost certainly the new regime — that's the default."
          layout="row"
          options={EMPLOYER_REGIME_OPTIONS}
          value={inputs.employerRegime}
          onChange={(v) => setField("employerRegime", v)}
        />
      ) : null}

      <MoneyInput
        label="Do you get a bonus or variable pay on top of your monthly salary?"
        helper="Enter the total you expect to receive this financial year, before tax. Leave blank if none."
        period="annual"
        value={inputs.annualBonus}
        onChange={(v) => setField("annualBonus", v)}
        onBlur={() => touch("annualBonus")}
        error={shown("annualBonus")}
      />

      <details className="rounded-[var(--radius-card)] border border-[var(--border)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium">Add something else</summary>
        <div className="mt-3">
          <MoneyInput
            label="Anything else from your employer that's taxable?"
            helper="Joining bonus, retention bonus, notice-pay recovery reversal, taxable reimbursements. Skip if unsure."
            period="annual"
            value={inputs.otherTaxableSalary}
            onChange={(v) => setField("otherTaxableSalary", v)}
          />
        </div>
      </details>
    </div>
  );
});

export default Step1Salary;
