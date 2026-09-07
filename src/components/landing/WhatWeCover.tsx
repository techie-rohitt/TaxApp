import { Reveal } from "../Reveal";
import { CheckIcon, DashIcon } from "../icons";

const WE_HANDLE = [
  "Both regimes with FY 2025-26 slabs",
  "Rent and HRA",
  "PF, PPF, ELSS, life insurance, tuition fees, home loan principal",
  "Health insurance for you and your parents",
  "Home loan interest on the house you live in",
  "NPS — yours and your employer's",
  "Savings account and fixed deposit interest",
  "Senior and super senior citizen rates",
  "The ₹12 lakh rebate and marginal relief",
];

const WE_DONT_HANDLE = [
  "Income above ₹50 lakh (surcharge kicks in)",
  "Capital gains — shares, mutual funds, property, crypto",
  "Freelance or business income",
  "Rental income from a second property",
  "Non-resident (NRI) taxation",
];

export function WhatWeCover() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <h2 className="mb-10 text-center text-[24px] font-semibold md:mb-12">What we cover</h2>
      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <Reveal
          as="div"
          className="rounded-[var(--radius-card)] border border-[var(--new-regime)]/30 bg-[var(--new-soft)] p-6 md:p-8"
        >
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--new-regime)] uppercase">
            We handle
          </h3>
          <ul className="space-y-3">
            {WE_HANDLE.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckIcon width={18} height={18} className="mt-0.5 shrink-0 text-[var(--new-regime)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal
          as="div"
          delayMs={120}
          className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface-sunk)] p-6 md:p-8"
        >
          <h3 className="mb-4 text-sm font-semibold tracking-wide text-[var(--text-muted)] uppercase">
            We don&apos;t handle
          </h3>
          <ul className="space-y-3 text-[var(--text-muted)]">
            {WE_DONT_HANDLE.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <DashIcon width={18} height={18} className="mt-0.5 shrink-0 text-[var(--text-faint)]" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
