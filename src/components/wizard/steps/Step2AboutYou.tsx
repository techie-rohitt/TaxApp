import { forwardRef, useImperativeHandle, useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { RadioGroup } from "../RadioGroup";
import { useWizardStore } from "../../../store/wizard";
import type { StepHandle } from "./StepHandle";
import type { AgeBand, CityType, WizardInputs } from "../../../lib/tax/types";

const AGE_BAND_OPTIONS: { value: AgeBand; label: string; subtitle: string }[] = [
  { value: "below60", label: "Under 60", subtitle: "Standard rates" },
  {
    value: "senior",
    label: "60 to 79",
    subtitle: "Senior citizen — higher exempt limit in the old regime",
  },
  {
    value: "superSenior",
    label: "80 or above",
    subtitle: "Super senior citizen — highest exempt limit in the old regime",
  },
];

const CITY_OPTIONS: { value: CityType; label: string }[] = [
  { value: "metro", label: "Delhi, Mumbai, Kolkata or Chennai" },
  { value: "other", label: "Any other city" },
];

type ProfTaxAnswer = "yes" | "no" | "unsure";
const PROF_TAX_OPTIONS: { value: ProfTaxAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "I'm not sure" },
];

function toProfTaxAnswer(v: WizardInputs["paysProfessionalTax"]): ProfTaxAnswer | "" {
  if (v === "") return "";
  if (v === true) return "yes";
  if (v === false) return "no";
  return "unsure";
}

function validate(inputs: WizardInputs): Partial<Record<keyof WizardInputs, string>> {
  const errors: Partial<Record<keyof WizardInputs, string>> = {};
  if (!inputs.cityType) errors.cityType = "Please choose one of the options above.";
  if (inputs.paysProfessionalTax === "") {
    errors.paysProfessionalTax = "Please choose one of the options above.";
  }
  return errors;
}

const Step2AboutYou = forwardRef<StepHandle>(function Step2AboutYou(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);
  const [touched, setTouched] = useState<Partial<Record<keyof WizardInputs, boolean>>>({});

  const errors = validate(inputs);
  const touch = (field: keyof WizardInputs) => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field: keyof WizardInputs) => (touched[field] ? errors[field] : undefined);

  useImperativeHandle(ref, () => ({
    validate: () => {
      setTouched({ cityType: true, paysProfessionalTax: true });
      return Object.keys(errors).length === 0;
    },
  }));

  const showProfTaxAmount = inputs.paysProfessionalTax === true;
  const profTaxAnnualRaw = inputs.professionalTaxMonthly * 12;
  const profTaxCappedNote =
    showProfTaxAmount && profTaxAnnualRaw > 2_500
      ? "The law caps professional tax at ₹2,500 a year, so we've used ₹2,500."
      : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">A few things about you</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Your age changes the tax rates in the old regime. Your city changes how much rent
          benefit you get.
        </p>
      </div>

      <RadioGroup
        legend="How old will you be on 31 March 2026?"
        helper='If you turn 60 at any point during this financial year, choose "60 to 79".'
        required
        layout="cards"
        options={AGE_BAND_OPTIONS}
        value={inputs.ageBand}
        onChange={(v) => setField("ageBand", v)}
      />

      <RadioGroup
        legend="Which city do you live and work in?"
        helper={`For the rent benefit, only these four cities count as "metro" for FY 2025-26. Bengaluru, Hyderabad, Pune, Gurugram, Noida, Jaipur and every other city fall in the second group.`}
        required
        layout="column"
        options={CITY_OPTIONS}
        value={inputs.cityType}
        onChange={(v) => {
          setField("cityType", v);
          touch("cityType");
        }}
        error={shown("cityType")}
      />

      <RadioGroup
        legend='Does your payslip show a "Professional Tax" or "PT" deduction?'
        helper="Some states charge it, some don't. Maharashtra, Karnataka, West Bengal, Tamil Nadu, Telangana, Gujarat and Madhya Pradesh do. Delhi, Haryana, Uttar Pradesh, Rajasthan, Punjab and Bihar do not."
        required
        layout="row"
        options={PROF_TAX_OPTIONS}
        value={toProfTaxAnswer(inputs.paysProfessionalTax)}
        onChange={(v) => {
          setField("paysProfessionalTax", v === "yes" ? true : v === "no" ? false : "unsure");
          touch("paysProfessionalTax");
        }}
        error={shown("paysProfessionalTax")}
      />

      {inputs.paysProfessionalTax === "unsure" ? (
        <p className="rounded-[var(--radius-card)] bg-[var(--surface-sunk)] px-3 py-2 text-sm text-[var(--text-muted)]">
          We&apos;ve assumed no professional tax. It&apos;s a small amount — at most ₹2,500 a
          year — so this barely changes the answer.
        </p>
      ) : null}

      {showProfTaxAmount ? (
        <MoneyInput
          label="How much per month?"
          period="monthly"
          value={inputs.professionalTaxMonthly}
          onChange={(v) => setField("professionalTaxMonthly", v)}
          warning={profTaxCappedNote}
        />
      ) : null}
    </div>
  );
});

export default Step2AboutYou;
