import { forwardRef, useImperativeHandle, useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { RadioGroup } from "../RadioGroup";
import { Slider } from "../Slider";
import { useWizardStore } from "../../../store/wizard";
import { deriveSalaryStructure } from "../../../lib/tax/derive";
import { formatINR } from "../../../lib/tax/format";
import type { StepHandle } from "./StepHandle";
import type { PfCappingChoice, WizardInputs } from "../../../lib/tax/types";

type YesNoUnsure = "yes" | "no" | "unsure";
const PF_DEDUCTED_OPTIONS: { value: YesNoUnsure; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "I'm not sure" },
];

type YesNo = "yes" | "no";
const BASIC_KNOWN_OPTIONS: { value: YesNo; label: string }[] = [
  { value: "yes", label: "Yes, I know it" },
  { value: "no", label: "No — please estimate it for me" },
];

const PF_CAPPING_OPTIONS: { value: PfCappingChoice; label: string }[] = [
  { value: "capped1800", label: "₹1,800 a month (the standard cap)" },
  { value: "twelvePercent", label: "12% of my basic salary" },
  { value: "dontKnow", label: "I really don't know" },
];

function toYesNoUnsure(v: boolean | "unsure" | ""): YesNoUnsure | "" {
  if (v === "") return "";
  if (v === true) return "yes";
  if (v === false) return "no";
  return "unsure";
}

function toYesNo(v: boolean | ""): YesNo | "" {
  if (v === "") return "";
  return v ? "yes" : "no";
}

function validate(
  inputs: WizardInputs,
  grossMonthly: number,
  showBasicField: boolean,
): Partial<Record<keyof WizardInputs, string>> {
  const errors: Partial<Record<keyof WizardInputs, string>> = {};

  if (inputs.pfDeducted === "") errors.pfDeducted = "Please choose one of the options above.";
  if (inputs.basicKnown === "") errors.basicKnown = "Please choose one of the options above.";

  if (inputs.pfDeducted === true && (inputs.pfMonthly < 0 || inputs.pfMonthly > 1_00_000)) {
    errors.pfMonthly = "Please check this amount.";
  }

  if (showBasicField) {
    if (inputs.basicMonthly < 1_000) {
      errors.basicMonthly = "Please enter your basic salary.";
    } else if (grossMonthly > 0 && inputs.basicMonthly > grossMonthly) {
      errors.basicMonthly = "Your basic can't be more than your total salary. Please check the number.";
    }
  }

  return errors;
}

const Step3SalaryStructure = forwardRef<StepHandle>(function Step3SalaryStructure(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);
  const [touched, setTouched] = useState<Partial<Record<keyof WizardInputs, boolean>>>({});

  const structure = deriveSalaryStructure(inputs);
  const grossMonthly = structure.grossSalary.annualGross / 12;

  const wouldDeriveFromPF =
    inputs.pfDeducted === true && inputs.pfMonthly > 0 && inputs.pfMonthly !== 1_800;
  const forcedBasicRequired = inputs.pfMonthly === 1_800;
  const showBasicField = inputs.basicKnown === true || forcedBasicRequired;
  const showSlider = inputs.basicKnown === false && !wouldDeriveFromPF && !forcedBasicRequired;
  const showCappingChoice = inputs.pfDeducted === true && inputs.pfMonthly === 0;

  const errors = validate(inputs, grossMonthly, showBasicField);
  const touch = (field: keyof WizardInputs) => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field: keyof WizardInputs) => (touched[field] ? errors[field] : undefined);

  useImperativeHandle(ref, () => ({
    validate: () => {
      setTouched({ pfDeducted: true, basicKnown: true, pfMonthly: true, basicMonthly: true });
      return Object.keys(errors).length === 0;
    },
  }));

  const basicRatio = grossMonthly > 0 ? inputs.basicMonthly / grossMonthly : 0;
  const basicWarning =
    showBasicField && inputs.basicMonthly > 0
      ? basicRatio < 0.25
        ? "That's an unusually low basic. Double-check it — it affects your rent benefit a lot."
        : basicRatio > 0.85
          ? "That's an unusually high basic. Double-check it."
          : undefined
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">How your salary is put together</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Two numbers matter here: your basic salary and your PF. We&apos;ll help you find both.
        </p>
      </div>

      <RadioGroup
        legend="Does your company deduct PF (Provident Fund) from your salary?"
        helper='On your payslip it says "PF", "EPF" or "Provident Fund" on the deductions side.'
        required
        layout="row"
        options={PF_DEDUCTED_OPTIONS}
        value={toYesNoUnsure(inputs.pfDeducted)}
        onChange={(v) => {
          setField("pfDeducted", v === "yes" ? true : v === "no" ? false : "unsure");
          touch("pfDeducted");
        }}
        error={shown("pfDeducted")}
      />

      {inputs.pfDeducted === true ? (
        <MoneyInput
          label="How much PF is deducted from your salary each month?"
          helper="Just your share, not the company's. If your payslip shows two PF lines, use the one in the deductions column."
          period="monthly"
          value={inputs.pfMonthly}
          onChange={(v) => setField("pfMonthly", v)}
          onBlur={() => touch("pfMonthly")}
          error={shown("pfMonthly")}
          warning={
            inputs.pfMonthly === 1_800
              ? "₹1,800 is the standard capped amount. That means your basic salary is at least ₹15,000 a month, but we can't tell exactly how much. Please tell us your basic salary below."
              : undefined
          }
        />
      ) : null}

      {showCappingChoice ? (
        <RadioGroup
          legend="Roughly how much PF is deducted?"
          layout="column"
          options={PF_CAPPING_OPTIONS}
          value={inputs.pfCappingChoice}
          onChange={(v) => setField("pfCappingChoice", v)}
        />
      ) : null}

      <RadioGroup
        legend="Do you know your basic salary?"
        helper="It's the biggest single line on your payslip, usually 40% to 50% of your gross."
        required
        layout="column"
        options={BASIC_KNOWN_OPTIONS}
        value={toYesNo(inputs.basicKnown)}
        onChange={(v) => {
          setField("basicKnown", v === "yes");
          touch("basicKnown");
        }}
        error={shown("basicKnown")}
      />

      {wouldDeriveFromPF && inputs.basicKnown === false ? (
        <p className="rounded-[var(--radius-card)] bg-[var(--accent-soft)] px-3 py-2 text-sm">
          We worked out your basic as {formatINR(structure.basic.value)} from your PF.{" "}
          <button
            type="button"
            className="font-medium text-[var(--accent-text)] underline"
            onClick={() => {
              setField("basicMonthly", structure.basic.value);
              setField("basicKnown", true);
            }}
          >
            Not right? Change it.
          </button>
        </p>
      ) : null}

      {showBasicField ? (
        <MoneyInput
          label="What is your monthly basic salary?"
          helper="Basic pay plus DA if your payslip shows DA separately."
          period="monthly"
          required
          value={inputs.basicMonthly}
          onChange={(v) => setField("basicMonthly", v)}
          onBlur={() => touch("basicMonthly")}
          error={shown("basicMonthly")}
          warning={basicWarning}
        />
      ) : null}

      {showSlider ? (
        <Slider
          label="We'll assume your basic is this share of your salary:"
          min={30}
          max={60}
          step={1}
          value={Math.round(inputs.basicSharePercent * 100)}
          onChange={(pct) => setField("basicSharePercent", pct / 100)}
          readout={`${Math.round(inputs.basicSharePercent * 100)}% of ${formatINR(
            Math.round(grossMonthly),
          )} = ${formatINR(Math.round(grossMonthly * inputs.basicSharePercent))} basic per month`}
          note="50% is the most common split in Indian payroll. Change it if you know better. This only affects the old regime, through your rent benefit and PF."
        />
      ) : null}

      {structure.basic.clamped ? (
        <p className="rounded-[var(--radius-input)] bg-[var(--warn-soft)] px-2 py-1.5 text-xs text-[var(--warn)]">
          Something looks off — please check your PF or basic salary figure.
        </p>
      ) : null}
    </div>
  );
});

export default Step3SalaryStructure;
