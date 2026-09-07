import { forwardRef, useImperativeHandle, useState } from "react";
import { MoneyInput } from "../MoneyInput";
import { RunningLimitBar } from "../RunningLimitBar";
import { useWizardStore } from "../../../store/wizard";
import { deriveChapterVIAOld, deriveSalaryStructure } from "../../../lib/tax/derive";
import { formatINR } from "../../../lib/tax/format";
import { LIMIT_80C } from "../../../lib/tax/constants";
import type { StepHandle } from "./StepHandle";
import type { WizardInputs } from "../../../lib/tax/types";

// PRD §17.1 — "any 80C item | 0 – ₹1,50,00,000 | 'Please check this amount.'"
const MAX_80C_ITEM = 1_50_00_000;
const RANGE_MESSAGE = "Please check this amount.";

const EIGHTY_C_FIELDS: (keyof WizardInputs)[] = [
  "lifeInsurance",
  "ppf",
  "elss",
  "tuitionFees",
  "taxSavingFD",
  "sukanya",
  "homeLoanPrincipal",
  "stampDuty",
  "nscOther",
];

function validate(inputs: WizardInputs, homeLoanPrincipalEditable: boolean) {
  const errors: Partial<Record<keyof WizardInputs, string>> = {};
  for (const field of EIGHTY_C_FIELDS) {
    if (field === "homeLoanPrincipal" && !homeLoanPrincipalEditable) continue;
    if ((inputs[field] as number) > MAX_80C_ITEM) errors[field] = RANGE_MESSAGE;
  }
  return errors;
}

const Step5Investments = forwardRef<StepHandle>(function Step5Investments(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);
  const [touched, setTouched] = useState<Partial<Record<keyof WizardInputs, boolean>>>({});

  const structure = deriveSalaryStructure(inputs);
  const chapterVIA = deriveChapterVIAOld(inputs, structure.employeePFAnnual, structure.basic.value);
  const homeLoanPrincipalEditable = !(inputs.hasHomeLoan === true && inputs.propertyUse === "selfOccupied");

  const errors = validate(inputs, homeLoanPrincipalEditable);
  const touch = (field: keyof WizardInputs) => setTouched((t) => ({ ...t, [field]: true }));
  const shown = (field: keyof WizardInputs) => (touched[field] ? errors[field] : undefined);

  useImperativeHandle(ref, () => ({
    validate: () => {
      setTouched((t) => ({ ...t, ...Object.fromEntries(EIGHTY_C_FIELDS.map((f) => [f, true])) }));
      return Object.keys(errors).length === 0;
    },
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">Where do you put your savings?</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          In the old regime, some savings reduce your tax — up to ₹1.5 lakh a year in total.
        </p>
      </div>

      <RunningLimitBar
        limit={LIMIT_80C}
        used={chapterVIA.raw80C}
        atLimitMessage="You've hit the ₹1.5 lakh limit. Anything more won't save you extra tax under this rule."
      />

      {chapterVIA.excess80C > 0 ? (
        <p className="rounded-[var(--radius-input)] bg-[var(--warn-soft)] px-2 py-1.5 text-xs text-[var(--warn)]">
          {formatINR(chapterVIA.excess80C)} of your investments gave you no extra tax benefit.
        </p>
      ) : null}

      {structure.employeePFAnnual > 0 ? (
        <div className="flex items-baseline justify-between gap-4 rounded-[var(--radius-card)] bg-[var(--surface-sunk)] px-3 py-2 text-sm">
          <span className="text-[var(--text-muted)]">
            Your PF for the year (added automatically)
            <span className="mt-0.5 block text-xs">
              Your PF already counts towards the ₹1.5 lakh limit, so we&apos;ve included it for
              you. Don&apos;t add it again below.
            </span>
          </span>
          <span className="shrink-0 font-medium tabular-nums">
            {formatINR(structure.employeePFAnnual)}
          </span>
        </div>
      ) : null}

      <MoneyInput
        label="Do you pay premiums on any life insurance policy?"
        helper="LIC, term insurance, endowment, ULIP — for yourself, your spouse or your children. Health insurance is a different thing and comes on the next step."
        period="annual"
        value={inputs.lifeInsurance}
        onChange={(v) => setField("lifeInsurance", v)}
        onBlur={() => touch("lifeInsurance")}
        error={shown("lifeInsurance")}
      />

      <MoneyInput
        label="How much did you put into PPF this year?"
        helper="Public Provident Fund — the 15-year government savings account."
        period="annual"
        value={inputs.ppf}
        onChange={(v) => setField("ppf", v)}
        onBlur={() => touch("ppf")}
        error={shown("ppf")}
        warning={inputs.ppf > 1_50_000 ? "The PPF limit itself is ₹1.5 lakh a year." : undefined}
      />

      <MoneyInput
        label="Did you invest in ELSS or “tax-saving” mutual funds?"
        helper="These are equity mutual funds with a three-year lock-in. Regular SIPs in normal mutual funds do NOT count."
        period="annual"
        value={inputs.elss}
        onChange={(v) => setField("elss", v)}
        onBlur={() => touch("elss")}
        error={shown("elss")}
      />

      <MoneyInput
        label="Do you pay school or college tuition fees for your children?"
        helper="Only the tuition portion, for up to two children, at an Indian institution. Bus fees, donations and development fees don't count."
        period="annual"
        value={inputs.tuitionFees}
        onChange={(v) => setField("tuitionFees", v)}
        onBlur={() => touch("tuitionFees")}
        error={shown("tuitionFees")}
      />

      <MoneyInput
        label="Do you have a five-year tax-saving fixed deposit?"
        helper="Only FDs specifically labelled “tax-saving” with a five-year lock-in. A normal FD doesn't count."
        period="annual"
        value={inputs.taxSavingFD}
        onChange={(v) => setField("taxSavingFD", v)}
        onBlur={() => touch("taxSavingFD")}
        error={shown("taxSavingFD")}
      />

      <MoneyInput
        label="Do you contribute to a Sukanya Samriddhi account?"
        helper="The government savings scheme for a girl child."
        period="annual"
        value={inputs.sukanya}
        onChange={(v) => setField("sukanya", v)}
        onBlur={() => touch("sukanya")}
        error={shown("sukanya")}
      />

      {!homeLoanPrincipalEditable ? (
        <div className="flex items-baseline justify-between gap-4 rounded-[var(--radius-card)] bg-[var(--surface-sunk)] px-3 py-2 text-sm">
          <span className="text-[var(--text-muted)]">
            Home loan principal repaid this year
            <span className="mt-0.5 block text-xs">
              Linked from step 7 — go back there to change it.
            </span>
          </span>
          <span className="shrink-0 font-medium tabular-nums">
            {formatINR(inputs.homeLoanPrincipal)}
          </span>
        </div>
      ) : (
        <MoneyInput
          label="Home loan principal repaid this year"
          helper="The principal part of your EMI, not the interest. Your bank's provisional interest certificate splits it for you."
          period="annual"
          value={inputs.homeLoanPrincipal}
          onChange={(v) => setField("homeLoanPrincipal", v)}
          onBlur={() => touch("homeLoanPrincipal")}
          error={shown("homeLoanPrincipal")}
        />
      )}

      <MoneyInput
        label="Did you pay stamp duty or registration charges on a house this year?"
        helper="Only in the year you actually bought the property."
        period="annual"
        value={inputs.stampDuty}
        onChange={(v) => setField("stampDuty", v)}
        onBlur={() => touch("stampDuty")}
        error={shown("stampDuty")}
      />

      <MoneyInput
        label="Anything else — NSC, senior citizen savings scheme, post office deposits?"
        period="annual"
        value={inputs.nscOther}
        onChange={(v) => setField("nscOther", v)}
        onBlur={() => touch("nscOther")}
        error={shown("nscOther")}
      />
    </div>
  );
});

export default Step5Investments;
