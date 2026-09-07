import { Link } from "react-router-dom";
import { BarChartIcon } from "../components/icons";
import {
  CESS_RATE,
  EPF_EMPLOYEE_RATE,
  EPF_WAGE_CEILING_MONTHLY,
  HRA_METRO_CITIES,
  HRA_METRO_RATE,
  HRA_NON_METRO_RATE,
  HRA_RENT_OFFSET,
  LIMIT_24B_SELF_OCCUPIED,
  LIMIT_80C,
  LIMIT_80CCD_1B,
  LIMIT_80D_PARENTS_60_PLUS,
  LIMIT_80D_PARENTS_BELOW_60,
  LIMIT_80D_PREVENTIVE,
  LIMIT_80D_SELF_60_PLUS,
  LIMIT_80D_SELF_BELOW_60,
  LIMIT_80DD_NORMAL,
  LIMIT_80DD_SEVERE,
  LIMIT_80DDB_NORMAL,
  LIMIT_80DDB_SENIOR,
  LIMIT_80TTA,
  LIMIT_80TTB,
  LIMIT_80U_NORMAL,
  LIMIT_80U_SEVERE,
  NEW_MARGINAL_RELIEF_BREAKEVEN,
  PROF_TAX_ANNUAL_CAP,
  RATE_80CCD_1_SALARIED,
  RATE_80CCD_2_NEW,
  RATE_80CCD_2_OLD_GOVT,
  RATE_80CCD_2_OLD_PRIVATE,
  REBATE_87A_NEW,
  REBATE_87A_OLD,
  STD_DEDUCTION_NEW,
  STD_DEDUCTION_OLD,
} from "../lib/tax/constants";
import { formatINR } from "../lib/tax/format";

const CONSTANTS: { label: string; value: string; section: string }[] = [
  { label: "Health & Education Cess", value: `${CESS_RATE * 100}%`, section: "Cess" },
  { label: "Standard deduction, old regime", value: formatINR(STD_DEDUCTION_OLD), section: "s.16(ia)" },
  { label: "Standard deduction, new regime", value: formatINR(STD_DEDUCTION_NEW), section: "s.16(ia)" },
  { label: "Professional tax, annual cap", value: formatINR(PROF_TAX_ANNUAL_CAP), section: "s.16(iii)" },
  {
    label: "Rebate u/s 87A, old regime",
    value: `${formatINR(REBATE_87A_OLD.maxRebate)}, up to ${formatINR(REBATE_87A_OLD.incomeLimit)} total income — no marginal relief`,
    section: "s.87A",
  },
  {
    label: "Rebate u/s 87A, new regime",
    value: `${formatINR(REBATE_87A_NEW.maxRebate)}, up to ${formatINR(REBATE_87A_NEW.incomeLimit)} total income, with marginal relief up to ~${formatINR(NEW_MARGINAL_RELIEF_BREAKEVEN)}`,
    section: "s.87A",
  },
  { label: "80C / 80CCC / 80CCD(1) combined limit", value: formatINR(LIMIT_80C), section: "s.80CCE" },
  { label: "Own NPS, extra slot", value: formatINR(LIMIT_80CCD_1B), section: "s.80CCD(1B)" },
  {
    label: "Own NPS within 80CCE, cap",
    value: `${RATE_80CCD_1_SALARIED * 100}% of basic + DA`,
    section: "s.80CCD(1)",
  },
  {
    label: "Employer NPS, new regime",
    value: `${RATE_80CCD_2_NEW * 100}% of basic + DA, every employer`,
    section: "s.80CCD(2)",
  },
  {
    label: "Employer NPS, old regime",
    value: `${RATE_80CCD_2_OLD_PRIVATE * 100}% (private) / ${RATE_80CCD_2_OLD_GOVT * 100}% (government)`,
    section: "s.80CCD(2)",
  },
  {
    label: "Health insurance, self",
    value: `${formatINR(LIMIT_80D_SELF_BELOW_60)} under 60, ${formatINR(LIMIT_80D_SELF_60_PLUS)} at 60+`,
    section: "s.80D",
  },
  {
    label: "Health insurance, parents",
    value: `${formatINR(LIMIT_80D_PARENTS_BELOW_60)} under 60, ${formatINR(LIMIT_80D_PARENTS_60_PLUS)} at 60+`,
    section: "s.80D",
  },
  { label: "Preventive check-up, inside the above", value: formatINR(LIMIT_80D_PREVENTIVE), section: "s.80D" },
  { label: "Savings interest, under 60", value: formatINR(LIMIT_80TTA), section: "s.80TTA" },
  { label: "All deposit interest, 60+", value: formatINR(LIMIT_80TTB), section: "s.80TTB" },
  {
    label: "Home loan interest, self-occupied",
    value: formatINR(LIMIT_24B_SELF_OCCUPIED),
    section: "s.24(b) / s.71(3A)",
  },
  {
    label: "Disability of a dependant",
    value: `${formatINR(LIMIT_80DD_NORMAL)} (40-79%) / ${formatINR(LIMIT_80DD_SEVERE)} (80%+)`,
    section: "s.80DD",
  },
  {
    label: "Own disability",
    value: `${formatINR(LIMIT_80U_NORMAL)} (40-79%) / ${formatINR(LIMIT_80U_SEVERE)} (80%+)`,
    section: "s.80U",
  },
  {
    label: "Specified serious illness",
    value: `${formatINR(LIMIT_80DDB_NORMAL)}, ${formatINR(LIMIT_80DDB_SENIOR)} if the patient is 60+`,
    section: "s.80DDB",
  },
  {
    label: "HRA exemption rate",
    value: `${HRA_METRO_RATE * 100}% of basic (metro) / ${HRA_NON_METRO_RATE * 100}% (non-metro); rent minus ${HRA_RENT_OFFSET * 100}% of basic`,
    section: "s.10(13A)",
  },
  { label: "Metro cities (FY 2025-26)", value: HRA_METRO_CITIES.join(", "), section: "Rule 2A" },
  {
    label: "Employee PF",
    value: `${EPF_EMPLOYEE_RATE * 100}% of basic, wage ceiling ${formatINR(EPF_WAGE_CEILING_MONTHLY)}/month`,
    section: "EPF Act",
  },
];

const REGIME_TABLE: { item: string; section: string; old: string; new: string }[] = [
  { item: "Standard deduction", section: "16(ia)", old: formatINR(STD_DEDUCTION_OLD), new: formatINR(STD_DEDUCTION_NEW) },
  { item: "Professional tax", section: "16(iii)", old: `Actual, max ${formatINR(PROF_TAX_ANNUAL_CAP)}`, new: "Not allowed" },
  { item: "HRA exemption", section: "10(13A)", old: "Allowed", new: "Not allowed" },
  { item: "Home loan interest, self-occupied", section: "24(b)", old: `Up to ${formatINR(LIMIT_24B_SELF_OCCUPIED)}`, new: "Not allowed" },
  { item: "80C basket", section: "80C / 80CCE", old: formatINR(LIMIT_80C), new: "Not allowed" },
  { item: "Own NPS, extra slot", section: "80CCD(1B)", old: formatINR(LIMIT_80CCD_1B), new: "Not allowed" },
  {
    item: "Employer NPS",
    section: "80CCD(2)",
    old: "10% of basic (private) / 14% (govt)",
    new: "14% of basic — ALLOWED",
  },
  { item: "Health insurance", section: "80D", old: "Up to ₹1,00,000", new: "Not allowed" },
  { item: "Disabled dependant / self", section: "80DD / 80U", old: "Flat amount", new: "Not allowed" },
  { item: "Specified illness", section: "80DDB", old: "Capped", new: "Not allowed" },
  { item: "Education loan interest", section: "80E", old: "Unlimited, 8 years", new: "Not allowed" },
  { item: "Donations", section: "80G", old: "50% / 100%", new: "Not allowed" },
  { item: "Savings / deposit interest", section: "80TTA / 80TTB", old: "Capped", new: "Not allowed" },
  {
    item: "Age-based exemption limit",
    section: "—",
    old: "Yes (₹2.5L / ₹3L / ₹5L)",
    new: "No — ₹4L for everyone",
  },
  {
    item: "Rebate u/s 87A",
    section: "87A",
    old: `${formatINR(REBATE_87A_OLD.maxRebate)} if TI ≤ ${formatINR(REBATE_87A_OLD.incomeLimit)}`,
    new: `${formatINR(REBATE_87A_NEW.maxRebate)} if TI ≤ ${formatINR(REBATE_87A_NEW.incomeLimit)}, plus marginal relief`,
  },
];

const SIMPLIFICATIONS = [
  "Basic salary is estimated at 50% of gross when you don't know it.",
  '"Basic + DA" is treated as just basic.',
  "The 10%-of-basic offset in the HRA calculation uses your full-year basic, even for rent paid for only part of the year.",
  "The 80G qualifying-limit test (10% of adjusted gross total income) is not applied.",
  "Employer PF above the ₹7.5 lakh combined perquisite threshold is ignored.",
  "A single salary figure is assumed for all twelve months of the year.",
];

export default function HowItWorks() {
  return (
    <div className="mx-auto flex max-w-[900px] flex-col gap-10 px-4 py-10 sm:px-6 sm:py-12 md:gap-12">
      <div>
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
          <BarChartIcon width={24} height={24} className="text-[var(--accent)]" />
        </span>
        <h1 className="text-[28px] font-semibold sm:text-[32px]">How we calculate your tax</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Rules as per the Income-tax Act, 1961 and the Finance Act, 2025, for FY 2025-26 (AY
          2026-27). This page publishes every constant, every rule, and every simplification the
          calculator makes — nothing here is hidden.
        </p>
      </div>

      <section>
        <h2 className="mb-3 text-xl font-semibold">The order we compute in</h2>
        <ol className="list-decimal space-y-2 pl-5 text-sm text-[var(--text-muted)]">
          <li>Start from your gross salary (already includes any employer NPS contribution).</li>
          <li>Subtract HRA and LTA exemptions (old regime only), then the standard deduction and professional tax, to get income from salary.</li>
          <li>Add income from house property (self-occupied home loan interest, old regime only) and other sources (interest, etc).</li>
          <li>That total is your gross total income.</li>
          <li>Subtract every Chapter VI-A deduction you qualify for (old regime has many; new regime has only employer NPS).</li>
          <li>Round the result to the nearest ₹10 (s.288A) to get your total income.</li>
          <li>Apply the slab rates for your regime (and age band, old regime only) to get tax before rebate.</li>
          <li>Apply the rebate under s.87A, or marginal relief in the new regime above ₹12 lakh.</li>
          <li>Add 4% Health &amp; Education Cess.</li>
          <li>Round the final figure to the nearest ₹10 (s.288B).</li>
        </ol>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Working backwards from your take-home pay</h2>
        <p className="text-sm text-[var(--text-muted)]">
          If you don&apos;t know your exact TDS, we solve for the gross salary that would produce
          your take-home pay, assuming your employer uses the new regime (or the regime you told
          us) and treating any professional tax or PF you&apos;ve told us about as known monthly
          deductions. We scan a wide range of possible gross salaries in ₹500 steps and refine
          each sign change with bisection to within ₹1.
        </p>
        <p className="mt-3 text-sm text-[var(--text-muted)]">
          Honestly: there is one narrow zone — total income between ₹12,00,000 and about{" "}
          {formatINR(NEW_MARGINAL_RELIEF_BREAKEVEN)} — where marginal relief makes a rupee of
          extra gross salary produce almost no extra take-home pay. In that zone, more than one
          gross salary can technically match the same take-home figure. When that happens we use
          the smaller of the possible salaries and say so on screen — if that matters to you,
          entering your exact monthly TDS on step 1 removes the ambiguity entirely.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">What&apos;s allowed in which regime</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--text-muted)]">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 font-medium">Section</th>
                <th className="py-2 font-medium">Old regime</th>
                <th className="py-2 font-medium">New regime</th>
              </tr>
            </thead>
            <tbody>
              {REGIME_TABLE.map((row) => (
                <tr key={row.item} className="border-t border-[var(--border)]">
                  <td className="py-2">{row.item}</td>
                  <td className="py-2 text-[var(--text-muted)]">{row.section}</td>
                  <td className="py-2">{row.old}</td>
                  <td className="py-2">{row.new}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">Every constant we use</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-[var(--text-muted)]">
                <th className="py-2 font-medium">Rule</th>
                <th className="py-2 font-medium">Value</th>
                <th className="py-2 font-medium">Section</th>
              </tr>
            </thead>
            <tbody>
              {CONSTANTS.map((row) => (
                <tr key={row.label} className="border-t border-[var(--border)]">
                  <td className="py-2 text-[var(--text-muted)]">{row.label}</td>
                  <td className="py-2 tabular-nums">{row.value}</td>
                  <td className="py-2 text-[var(--text-muted)]">{row.section}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">What we&apos;ve simplified</h2>
        <p className="mb-3 text-sm text-[var(--text-muted)]">
          Publishing our limitations isn&apos;t a weakness — it&apos;s the reason a careful reader
          can trust the parts we do compute.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--text-muted)]">
          {SIMPLIFICATIONS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-xl font-semibold">One more thing</h2>
        <p className="text-sm text-[var(--text-muted)]">
          A new, consolidated Income Tax Act takes effect from 1 April 2026 and renumbers many of
          these sections (80D, for instance, becomes Section 126). FY 2025-26 — the year this
          calculator covers — is still governed by the Income-tax Act, 1961, so the section
          numbers above are the ones that actually apply to you.
        </p>
      </section>

      <Link to="/privacy" className="text-sm font-medium text-[var(--accent-text)] hover:underline">
        Read the privacy note →
      </Link>
    </div>
  );
}
