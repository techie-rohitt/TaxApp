import { forwardRef, useImperativeHandle, useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { RadioGroup } from "../RadioGroup";
import { Stepper } from "../Stepper";
import { useWizardStore } from "../../../store/wizard";
import { deriveSalaryStructure } from "../../../lib/tax/derive";
import { formatINR } from "../../../lib/tax/format";
import { HRA_METRO_RATE, HRA_NON_METRO_RATE } from "../../../lib/tax/constants";
import type { StepHandle } from "./StepHandle";
import type { HasHRAComponent, WizardInputs } from "../../../lib/tax/types";

type YesNo = "yes" | "no";
const YES_NO = (yesLabel: string, noLabel: string) => [
  { value: "yes" as const, label: yesLabel },
  { value: "no" as const, label: noLabel },
];

const HRA_COMPONENT_OPTIONS: { value: HasHRAComponent; label: string }[] = [
  { value: "yesKnown", label: "Yes, and I know the amount" },
  { value: "yesUnknown", label: "Yes, but I don't know the amount" },
  { value: "no", label: "No, there's no HRA line" },
];

const RENT_QUICK_FILLS = [8_000, 12_000, 18_000, 25_000, 35_000];

function toYesNo(v: boolean | ""): YesNo | "" {
  if (v === "") return "";
  return v ? "yes" : "no";
}

function validate(
  inputs: WizardInputs,
  grossMonthly: number,
  basicMonthly: number,
): Partial<Record<keyof WizardInputs, string>> {
  const errors: Partial<Record<keyof WizardInputs, string>> = {};
  if (inputs.paysRent === "") {
    errors.paysRent = "Please choose one of the options above.";
    return errors;
  }
  if (inputs.paysRent === false) return errors;

  if (inputs.monthlyRent <= 0 || inputs.monthlyRent > 10_00_000) {
    errors.monthlyRent = "Please check this amount.";
  }
  if (inputs.rentPaidWholeYear === "") {
    errors.rentPaidWholeYear = "Please choose one of the options above.";
  }
  if (inputs.hasHRAComponent === "") {
    errors.hasHRAComponent = "Please choose one of the options above.";
  }
  if (inputs.hasHRAComponent === "yesKnown") {
    const cap = Math.max(0, grossMonthly - basicMonthly);
    if (inputs.monthlyHRA < 0 || inputs.monthlyHRA > cap) {
      errors.monthlyHRA = "HRA plus basic can't be more than your total salary.";
    }
  }

  return errors;
}

const Step4Rent = forwardRef<StepHandle>(function Step4Rent(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);
  const [touched, setTouched] = useState<Partial<Record<keyof WizardInputs, boolean>>>({});

  const structure = deriveSalaryStructure(inputs);
  const grossMonthly = structure.grossSalary.annualGross / 12;
  const basicMonthly = structure.basic.value;
  const isMetro = inputs.cityType === "metro";

  const errors = validate(inputs, grossMonthly, basicMonthly);
  const touch = (field: keyof WizardInputs) => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field: keyof WizardInputs) => (touched[field] ? errors[field] : undefined);

  useImperativeHandle(ref, () => ({
    validate: () => {
      setTouched({
        paysRent: true,
        monthlyRent: true,
        rentPaidWholeYear: true,
        hasHRAComponent: true,
        monthlyHRA: true,
      });
      return Object.keys(errors).length === 0;
    },
  }));

  const annualRentWarning =
    inputs.monthlyRent * 12 > structure.grossSalary.annualGross
      ? "Your rent is more than your entire salary. Please check the amount."
      : undefined;

  const estimatedHraRate = isMetro ? HRA_METRO_RATE : HRA_NON_METRO_RATE;
  const estimatedHraMonthly = Math.round(basicMonthly * estimatedHraRate);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">Do you pay rent?</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Rent can be a big tax saver — but only in the old regime.
        </p>
      </div>

      <RadioGroup
        legend="Do you pay rent for the place you live in?"
        required
        layout="row"
        options={YES_NO("Yes", "No")}
        value={toYesNo(inputs.paysRent)}
        onChange={(v) => {
          setField("paysRent", v === "yes");
          touch("paysRent");
        }}
        error={shown("paysRent")}
      />

      {inputs.paysRent === false ? (
        <p className="rounded-[var(--radius-card)] bg-[var(--surface-sunk)] px-3 py-2 text-sm text-[var(--text-muted)]">
          No rent means no rent benefit — that&apos;s fine, it just removes one advantage the old
          regime had. If you live in a house you own and have a home loan, we&apos;ll ask about
          that in a couple of steps.
        </p>
      ) : null}

      {inputs.paysRent === true ? (
        <>
          <MoneyInput
            label="How much rent do you pay each month?"
            helper="The rent you actually pay to your landlord. Don't include maintenance or electricity paid separately."
            period="monthly"
            required
            quickFills={RENT_QUICK_FILLS}
            value={inputs.monthlyRent}
            onChange={(v) => setField("monthlyRent", v)}
            onBlur={() => touch("monthlyRent")}
            error={shown("monthlyRent")}
            warning={annualRentWarning}
          />

          <RadioGroup
            legend="Did you pay this rent for all twelve months?"
            required
            layout="row"
            options={YES_NO("Yes, all year", "No, only part of the year")}
            value={toYesNo(inputs.rentPaidWholeYear)}
            onChange={(v) => {
              setField("rentPaidWholeYear", v === "yes");
              touch("rentPaidWholeYear");
            }}
            error={shown("rentPaidWholeYear")}
          />

          {inputs.rentPaidWholeYear === false ? (
            <Stepper
              label="How many months?"
              min={1}
              max={12}
              value={inputs.monthsRentPaid}
              onChange={(v) => setField("monthsRentPaid", v)}
            />
          ) : null}

          <RadioGroup
            legend="Does your payslip have a line called HRA or House Rent Allowance?"
            helper="HRA is on the earnings side of your payslip, usually the second-largest line."
            required
            layout="column"
            options={HRA_COMPONENT_OPTIONS}
            value={inputs.hasHRAComponent}
            onChange={(v) => {
              setField("hasHRAComponent", v);
              touch("hasHRAComponent");
            }}
            error={shown("hasHRAComponent")}
          />

          {inputs.hasHRAComponent === "yesKnown" ? (
            <MoneyInput
              label="How much HRA do you get each month?"
              period="monthly"
              value={inputs.monthlyHRA}
              onChange={(v) => setField("monthlyHRA", v)}
              onBlur={() => touch("monthlyHRA")}
              error={shown("monthlyHRA")}
            />
          ) : null}

          {inputs.hasHRAComponent === "yesUnknown" ? (
            <p className="rounded-[var(--radius-card)] bg-[var(--accent-soft)] px-3 py-2 text-sm">
              We&apos;ve assumed your HRA is {formatINR(estimatedHraMonthly)} a month (
              {estimatedHraRate * 100}% of your basic). That&apos;s the most common setup.{" "}
              <button
                type="button"
                className="font-medium text-[var(--accent-text)] underline"
                onClick={() => {
                  setField("monthlyHRA", estimatedHraMonthly);
                  setField("hasHRAComponent", "yesKnown");
                }}
              >
                Change it →
              </button>
            </p>
          ) : null}

          {inputs.hasHRAComponent === "no" ? (
            <p className="rounded-[var(--radius-card)] bg-[var(--surface-sunk)] px-3 py-2 text-sm text-[var(--text-muted)]">
              Because your salary has no HRA component, the usual rent benefit doesn&apos;t apply
              to you. There&apos;s a separate rule called Section 80GG for people in exactly your
              situation — it can give up to ₹60,000 a year in the old regime, but it has strict
              conditions and we don&apos;t calculate it here. Worth asking a CA about, or asking HR
              to add an HRA component to your salary structure.
            </p>
          ) : null}
        </>
      ) : null}
    </div>
  );
});

export default Step4Rent;
