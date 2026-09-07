import { forwardRef, useImperativeHandle, useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { RadioGroup } from "../RadioGroup";
import { useWizardStore } from "../../../store/wizard";
import { deriveSalaryStructure } from "../../../lib/tax/derive";
import { formatINR } from "../../../lib/tax/format";
import { LIMIT_24B_SELF_OCCUPIED, LIMIT_80C, LIMIT_80CCD_1B, RATE_80CCD_2_NEW } from "../../../lib/tax/constants";
import type { StepHandle } from "./StepHandle";
import type { PropertyUse, WizardInputs } from "../../../lib/tax/types";

type YesNo = "yes" | "no";
function toYesNo(v: boolean | ""): YesNo | "" {
  if (v === "") return "";
  return v ? "yes" : "no";
}

const PROPERTY_USE_OPTIONS: { value: PropertyUse; label: string }[] = [
  { value: "selfOccupied", label: "Yes, I live in it" },
  { value: "letOut", label: "No, it's rented out" },
  { value: "underConstruction", label: "It's empty / under construction" },
];

type EmployerNPSAnswer = "yes" | "no" | "unsure";
const EMPLOYER_NPS_OPTIONS: { value: EmployerNPSAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "I'm not sure" },
];
function toEmployerNPSAnswer(v: boolean | "unsure" | ""): EmployerNPSAnswer | "" {
  if (v === "") return "";
  if (v === true) return "yes";
  if (v === false) return "no";
  return "unsure";
}

// PRD §17.1 — "homeLoanInterestAnnual | 0 – ₹1,00,00,000 | 'Please check this amount.'"
const MAX_HOME_LOAN_INTEREST = 1_00_00_000;

function validate(inputs: WizardInputs): Partial<Record<keyof WizardInputs, string>> {
  const errors: Partial<Record<keyof WizardInputs, string>> = {};
  if (inputs.hasHomeLoan === "") errors.hasHomeLoan = "Please choose one of the options above.";
  if (inputs.hasHomeLoan === true && inputs.propertyUse === "") {
    errors.propertyUse = "Please choose one of the options above.";
  }
  if (inputs.propertyUse === "selfOccupied" && inputs.homeLoanInterestAnnual > MAX_HOME_LOAN_INTEREST) {
    errors.homeLoanInterestAnnual = "Please check this amount.";
  }
  if (inputs.hasNPS === "") errors.hasNPS = "Please choose one of the options above.";
  if (inputs.hasNPS === true && inputs.employerContributesNPS === "") {
    errors.employerContributesNPS = "Please choose one of the options above.";
  }
  return errors;
}

const Step7HomeNPS = forwardRef<StepHandle>(function Step7HomeNPS(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);
  const setFields = useWizardStore((s) => s.setFields);
  const [touched, setTouched] = useState<Partial<Record<keyof WizardInputs, boolean>>>({});
  const [showNPSExplainer, setShowNPSExplainer] = useState(false);

  const errors = validate(inputs);
  const touch = (field: keyof WizardInputs) => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field: keyof WizardInputs) => (touched[field] ? errors[field] : undefined);

  useImperativeHandle(ref, () => ({
    validate: () => {
      setTouched({
        hasHomeLoan: true,
        propertyUse: true,
        homeLoanInterestAnnual: true,
        hasNPS: true,
        employerContributesNPS: true,
      });
      return Object.keys(errors).length === 0;
    },
  }));

  const structure = deriveSalaryStructure(inputs);
  const basicMonthly = structure.basic.value;

  const eightyCUsedWithoutPrincipal =
    structure.employeePFAnnual +
    inputs.lifeInsurance +
    inputs.ppf +
    inputs.elss +
    inputs.tuitionFees +
    inputs.taxSavingFD +
    inputs.sukanya +
    inputs.nscOther +
    inputs.stampDuty;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">Home loan and pension savings</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Two of the biggest levers there are — and they behave very differently in the two
          regimes.
        </p>
      </div>

      <h2 className="text-sm font-semibold text-[var(--text-muted)]">Home loan</h2>

      <RadioGroup
        legend="Do you have a home loan?"
        required
        layout="row"
        options={[
          { value: "yes" as const, label: "Yes" },
          { value: "no" as const, label: "No" },
        ]}
        value={toYesNo(inputs.hasHomeLoan)}
        onChange={(v) => {
          setField("hasHomeLoan", v === "yes");
          touch("hasHomeLoan");
        }}
        error={shown("hasHomeLoan")}
      />

      {inputs.hasHomeLoan === true ? (
        <RadioGroup
          legend="Do you live in that house?"
          required
          layout="column"
          options={PROPERTY_USE_OPTIONS}
          value={inputs.propertyUse}
          onChange={(v) => {
            setField("propertyUse", v);
            touch("propertyUse");
            if (v !== "selfOccupied") {
              setFields({ homeLoanInterestAnnual: 0, homeLoanPrincipal: 0 });
            }
          }}
          error={shown("propertyUse")}
        />
      ) : null}

      {inputs.propertyUse === "letOut" ? (
        <p className="rounded-[var(--radius-card)] bg-[var(--warn-soft)] px-3 py-2 text-sm text-[var(--warn)]">
          We only handle the home you live in. Rental income and let-out property losses follow
          different rules, and adding them here would give you a wrong answer. Your result will
          still be useful, but it won&apos;t include this house.
        </p>
      ) : null}

      {inputs.propertyUse === "underConstruction" ? (
        <p className="rounded-[var(--radius-card)] bg-[var(--warn-soft)] px-3 py-2 text-sm text-[var(--warn)]">
          Interest during construction is claimed in five equal instalments starting from the
          year construction finishes. That&apos;s a rule we don&apos;t handle here. If
          construction is done and you&apos;ve moved in, choose the first option instead.
        </p>
      ) : null}

      {inputs.propertyUse === "selfOccupied" ? (
        <>
          <MoneyInput
            label="How much interest did you pay on your home loan this year?"
            helper='Interest only, not the whole EMI. Your bank gives you a "provisional interest certificate" every year that shows this exact number.'
            period="annual"
            value={inputs.homeLoanInterestAnnual}
            onChange={(v) => setField("homeLoanInterestAnnual", v)}
            onBlur={() => touch("homeLoanInterestAnnual")}
            error={shown("homeLoanInterestAnnual")}
            warning={
              inputs.homeLoanInterestAnnual > LIMIT_24B_SELF_OCCUPIED
                ? `Limit: ${formatINR(LIMIT_24B_SELF_OCCUPIED)} — anything above that doesn't reduce your tax further.`
                : undefined
            }
          />

          <div>
            <MoneyInput
              label="And how much principal did you repay?"
              helper="The same certificate shows this. It counts towards the ₹1.5 lakh limit from step 5."
              period="annual"
              value={inputs.homeLoanPrincipal}
              onChange={(v) => setField("homeLoanPrincipal", v)}
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              This adds to your 80C total — you&apos;re now at{" "}
              {formatINR(Math.min(LIMIT_80C, eightyCUsedWithoutPrincipal + inputs.homeLoanPrincipal))} of{" "}
              {formatINR(LIMIT_80C)}.
            </p>
          </div>
        </>
      ) : null}

      <h2 className="mt-2 text-sm font-semibold text-[var(--text-muted)]">NPS</h2>

      <div>
        <RadioGroup
          legend="Do you have an NPS account?"
          required
          layout="row"
          options={[
            { value: "yes" as const, label: "Yes" },
            { value: "no" as const, label: "No" },
          ]}
          value={toYesNo(inputs.hasNPS)}
          onChange={(v) => {
            setField("hasNPS", v === "yes");
            touch("hasNPS");
          }}
          error={shown("hasNPS")}
        />
        <button
          type="button"
          onClick={() => setShowNPSExplainer((s) => !s)}
          className="mt-1 text-xs font-medium text-[var(--accent-text)] underline"
        >
          What is NPS?
        </button>
        {showNPSExplainer ? (
          <p className="mt-2 rounded-[var(--radius-card)] bg-[var(--accent-soft)] px-3 py-2 text-sm">
            NPS is the National Pension System — a government retirement account. You pay in
            during your working years and get a pension later. It has two tax advantages that
            nothing else has: an extra ₹50,000 deduction outside the ₹1.5 lakh limit in the old
            regime, and — uniquely — the employer&apos;s contribution is deductible in BOTH
            regimes.
          </p>
        ) : null}
      </div>

      {inputs.hasNPS === true ? (
        <div>
          <MoneyInput
            label="How much did you put into NPS yourself?"
            helper="Your own money going into your Tier-1 NPS account. Not the company's share — that's the next question."
            period="annual"
            value={inputs.ownNPS}
            onChange={(v) => setField("ownNPS", v)}
          />
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Up to {formatINR(LIMIT_80CCD_1B)} of this gets a special extra deduction, outside the
            ₹1.5 lakh limit.
          </p>
        </div>
      ) : null}

      {inputs.hasNPS === true ? (
        <RadioGroup
          legend="Does your employer contribute to your NPS?"
          helper='Some companies offer "Corporate NPS". If yours does, it shows up on your payslip as an employer contribution.'
          layout="row"
          options={EMPLOYER_NPS_OPTIONS}
          value={toEmployerNPSAnswer(inputs.employerContributesNPS)}
          onChange={(v) => {
            setField(
              "employerContributesNPS",
              v === "yes" ? true : v === "no" ? false : "unsure",
            );
            touch("employerContributesNPS");
          }}
          error={shown("employerContributesNPS")}
        />
      ) : null}

      {inputs.employerContributesNPS === true ? (
        <>
          <div>
            <MoneyInput
              label="How much does your employer put in each month?"
              period="monthly"
              value={inputs.employerNPSMonthly}
              onChange={(v) => setField("employerNPSMonthly", v)}
            />
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Up to 14% of your basic — that&apos;s {formatINR(Math.round((basicMonthly * RATE_80CCD_2_NEW)))}{" "}
              a month for you — is deductible. And this one works in the new regime too.
            </p>
          </div>

          <p className="rounded-[var(--radius-card)] border border-[var(--accent)] bg-[var(--accent-soft)] px-3 py-2 text-sm">
            <strong className="block">
              Employer NPS is the only deduction that survives in the new regime.
            </strong>
            When your employer puts money into your NPS, that money is first added to your salary
            as income, and then subtracted again as a deduction. Up to 14% of your basic salary,
            the two cancel out and you pay no tax on it. This works in both regimes — it&apos;s
            the one and only way to reduce your tax under the new regime.
          </p>
        </>
      ) : null}
    </div>
  );
});

export default Step7HomeNPS;
