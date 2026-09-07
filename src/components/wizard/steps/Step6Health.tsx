import { forwardRef, useImperativeHandle } from "react";
import { MoneyInput } from "../MoneyInput";
import { RadioGroup } from "../RadioGroup";
import { useWizardStore } from "../../../store/wizard";
import {
  LIMIT_80D_PREVENTIVE,
  LIMIT_80D_SELF_60_PLUS,
  LIMIT_80D_SELF_BELOW_60,
} from "../../../lib/tax/constants";
import { formatINR } from "../../../lib/tax/format";
import type { StepHandle } from "./StepHandle";
import type { Disability } from "../../../lib/tax/types";

type YesNo = "yes" | "no";
function toYesNo(v: boolean | ""): YesNo | "" {
  if (v === "") return "";
  return v ? "yes" : "no";
}

const DEPENDANT_DISABILITY_OPTIONS: { value: Disability; label: string }[] = [
  { value: "none", label: "None" },
  { value: "normal", label: "40% to 79% disability — ₹75,000 flat" },
  { value: "severe", label: "80% or more — ₹1,25,000 flat" },
];

const SELF_DISABILITY_OPTIONS: { value: Disability; label: string }[] = [
  { value: "none", label: "None" },
  { value: "normal", label: "40% to 79% — ₹75,000 flat" },
  { value: "severe", label: "80% or more — ₹1,25,000 flat" },
];

const Step6Health = forwardRef<StepHandle>(function Step6Health(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);

  useImperativeHandle(ref, () => ({ validate: () => true })); // every field on this step is optional

  const selfCap = inputs.ageBand === "below60" ? LIMIT_80D_SELF_BELOW_60 : LIMIT_80D_SELF_60_PLUS;
  const showParentsAreSenior = inputs.healthPremiumParents > 0;
  const showMedicalExpenditure =
    inputs.parentsAreSenior === true && inputs.healthPremiumParents === 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">Health insurance and medical costs</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          A separate limit, on top of the ₹1.5 lakh. Old regime only.
        </p>
      </div>

      <div>
        <MoneyInput
          label="How much health insurance premium do you pay for yourself, your spouse and your children?"
          helper="The annual premium. If your company provides it free, enter zero — you can only claim what you personally pay."
          period="annual"
          value={inputs.healthPremiumSelf}
          onChange={(v) => setField("healthPremiumSelf", v)}
          warning={
            inputs.healthPremiumSelf > selfCap
              ? `Only ${formatINR(selfCap)} of this can be claimed.`
              : undefined
          }
        />
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          Limit for you: {formatINR(selfCap)}
        </p>
      </div>

      <MoneyInput
        label="Do you pay health insurance premiums for your parents?"
        period="annual"
        value={inputs.healthPremiumParents}
        onChange={(v) => setField("healthPremiumParents", v)}
      />

      {showParentsAreSenior ? (
        <RadioGroup
          legend="Are your parents 60 or older?"
          helper="If either parent is 60 or above, the limit for their premium doubles from ₹25,000 to ₹50,000."
          layout="column"
          options={[
            { value: "yes" as const, label: "Yes, at least one is 60 or older" },
            { value: "no" as const, label: "No, both are under 60" },
          ]}
          value={toYesNo(inputs.parentsAreSenior)}
          onChange={(v) => setField("parentsAreSenior", v === "yes")}
        />
      ) : null}

      <MoneyInput
        label="Did you pay for any preventive health check-ups?"
        helper="Full body check-ups, annual screenings. Up to ₹5,000 counts — but it sits inside the limits above, not on top of them."
        period="annual"
        value={inputs.preventiveCheckup}
        onChange={(v) => setField("preventiveCheckup", v)}
        warning={
          inputs.preventiveCheckup > LIMIT_80D_PREVENTIVE
            ? "Only ₹5,000 of this can be counted."
            : undefined
        }
      />

      {showMedicalExpenditure ? (
        <MoneyInput
          label="Did you pay medical bills for a parent aged 60+ who has no health insurance?"
          helper="If a senior citizen parent has no policy at all, actual medical spending can be claimed instead, up to ₹50,000."
          period="annual"
          value={inputs.parentsMedicalExpenditure}
          onChange={(v) => setField("parentsMedicalExpenditure", v)}
        />
      ) : null}

      <details className="rounded-[var(--radius-card)] border border-[var(--border)] px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium">
          I have a disability or a serious illness in the family
        </summary>
        <div className="mt-4 flex flex-col gap-5">
          <RadioGroup
            legend="Disability of a dependant"
            helper="A flat amount, regardless of what you actually spent. Needs a certificate from a government medical authority."
            layout="column"
            options={DEPENDANT_DISABILITY_OPTIONS}
            value={inputs.disabilityDependant}
            onChange={(v) => setField("disabilityDependant", v)}
          />

          <RadioGroup
            legend="Your own disability"
            layout="column"
            options={SELF_DISABILITY_OPTIONS}
            value={inputs.disabilitySelf}
            onChange={(v) => setField("disabilitySelf", v)}
          />

          <MoneyInput
            label="Treatment of a specified serious illness"
            helper="Cancer, kidney failure, certain neurological conditions and a few others, for you or a dependant. Limit is ₹40,000, or ₹1,00,000 if the patient is 60 or older."
            period="annual"
            value={inputs.specifiedIllnessSpend}
            onChange={(v) => setField("specifiedIllnessSpend", v)}
          />

          {inputs.specifiedIllnessSpend > 0 ? (
            <RadioGroup
              legend="Is the patient 60 or older?"
              layout="row"
              options={[
                { value: "yes" as const, label: "Yes" },
                { value: "no" as const, label: "No" },
              ]}
              value={inputs.illnessPatientIsSenior ? "yes" : "no"}
              onChange={(v) => setField("illnessPatientIsSenior", v === "yes")}
            />
          ) : null}
        </div>
      </details>
    </div>
  );
});

export default Step6Health;
