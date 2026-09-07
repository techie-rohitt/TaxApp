import { forwardRef, useImperativeHandle } from "react";
import { MoneyInput } from "../MoneyInput";
import { RadioGroup } from "../RadioGroup";
import { useWizardStore } from "../../../store/wizard";
import type { StepHandle } from "./StepHandle";

type DonationRateAnswer = "full" | "half" | "unsure";
const DONATION_RATE_OPTIONS: { value: DonationRateAnswer; label: string }[] = [
  { value: "full", label: "100% deductible (e.g. PM National Relief Fund)" },
  { value: "half", label: "50% deductible (most registered NGOs)" },
  { value: "unsure", label: "I'm not sure" },
];

const Step8OtherIncome = forwardRef<StepHandle>(function Step8OtherIncome(_props, ref) {
  const inputs = useWizardStore((s) => s.inputs);
  const setField = useWizardStore((s) => s.setField);

  useImperativeHandle(ref, () => ({ validate: () => true })); // every field on this step is optional

  const isSenior = inputs.ageBand !== "below60";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[24px] font-semibold">Interest and other income</h1>
        <p className="mt-1 text-[var(--text-muted)]">
          Almost everyone forgets this one. Bank interest is taxable, and the bank has already
          told the tax department about it.
        </p>
      </div>

      <div>
        <MoneyInput
          label="How much interest did your savings accounts pay you this year?"
          helper="Add up every savings account you hold. It's in your bank statement, usually credited every three months. Not your FDs — those come next."
          period="annual"
          value={inputs.savingsInterest}
          onChange={(v) => setField("savingsInterest", v)}
          warning={
            inputs.savingsInterest > 1_00_000
              ? "That's a lot of savings interest. Make sure you haven't included FD interest here — that's the next box."
              : undefined
          }
        />
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {isSenior
            ? "As a senior citizen, up to ₹50,000 of all your interest is deductible in the old regime — savings and FDs together."
            : "Up to ₹10,000 of savings interest is deductible in the old regime."}
        </p>
      </div>

      <div>
        <MoneyInput
          label="And interest from fixed deposits or recurring deposits?"
          helper="Interest for the year, even if the FD hasn't matured yet — it's taxed as it accrues, not when you withdraw. Check your Form 26AS or AIS on the income tax website if you're unsure."
          period="annual"
          value={inputs.fdInterest}
          onChange={(v) => setField("fdInterest", v)}
        />
        {!isSenior ? (
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            FD interest is fully taxable. The ₹10,000 savings-interest deduction does not cover
            FDs — a very common mistake.
          </p>
        ) : null}
      </div>

      <MoneyInput
        label="Any other income you need to declare?"
        helper="Interest on bonds or NSC, family pension, income from a gift. Leave blank if none. Don't include capital gains from shares, mutual funds or property — this calculator can't handle those."
        period="annual"
        value={inputs.otherIncome}
        onChange={(v) => setField("otherIncome", v)}
      />

      <div className="flex flex-col gap-3">
        <MoneyInput
          label="Did you donate to a registered charity or relief fund?"
          helper="Only donations to institutions registered under Section 80G, with a receipt showing their registration number. Donations above ₹2,000 must be non-cash."
          period="annual"
          value={inputs.donations}
          onChange={(v) => setField("donations", v)}
        />

        {inputs.donations > 0 ? (
          <RadioGroup
            legend="What kind of donation was it?"
            helper="Not sure? Choose the last option — we'll assume 50%, which covers most charities. Your receipt will say which category actually applies."
            layout="column"
            options={DONATION_RATE_OPTIONS}
            value={inputs.donationRate === 1 ? "full" : inputs.donationRate === 0.5 ? "half" : ""}
            onChange={(v) => setField("donationRate", v === "full" ? 1 : 0.5)}
          />
        ) : null}
      </div>

      <MoneyInput
        label="Are you paying interest on an education loan?"
        helper="For higher education — yours, your spouse's or your children's. There's no upper limit on this one, and it runs for up to eight years."
        period="annual"
        value={inputs.educationLoanInterest}
        onChange={(v) => setField("educationLoanInterest", v)}
      />
    </div>
  );
});

export default Step8OtherIncome;
