import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { WizardShell } from "./WizardShell";
import { useWizardStore } from "../../store/wizard";

function renderWizard() {
  return render(
    <MemoryRouter>
      <WizardShell />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useWizardStore.getState().clearAll();
  // WizardShell restores its step from the URL hash on mount (PRD §7.3), and
  // jsdom's `window.location` persists across tests in this file — reset it
  // too, so each test starts like a genuinely fresh page load.
  window.history.replaceState(null, "", "/");
});

describe("WizardShell — step 1", () => {
  it("shows step 1 of 8 and a not-yet-populated preview panel", () => {
    renderWizard();
    expect(screen.getByText(/Step 1 of 8/)).toBeInTheDocument();
    expect(screen.getByText("Your numbers will appear here as you answer.")).toBeInTheDocument();
  });

  it("populates the preview panel's gross salary as soon as monthly in-hand is entered", () => {
    renderWizard();
    const input = screen.getByLabelText(/How much money lands in your bank account each month/i);
    fireEvent.change(input, { target: { value: "100000" } });

    expect(
      screen.queryByText("Your numbers will appear here as you answer."),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Gross salary")).toBeInTheDocument();
  });

  it("blocks Continue until the required fields are answered", () => {
    renderWizard();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Please enter the amount your salary credit shows.")).toBeInTheDocument();
    expect(screen.getByText("Please choose one of the options above.")).toBeInTheDocument();
    // Still on step 1.
    expect(screen.getByText(/Step 1 of 8/)).toBeInTheDocument();
  });

  it("advances to step 2 once required fields are valid", () => {
    renderWizard();
    fireEvent.change(screen.getByLabelText(/How much money lands in your bank account each month/i), {
      target: { value: "100000" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "No tax is deducted" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText(/Step 2 of 8/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "A few things about you" })).toBeInTheDocument();
  });

  it("clears an entered value when Clear my data is pressed", () => {
    renderWizard();
    const input = screen.getByLabelText(/How much money lands in your bank account each month/i);
    fireEvent.change(input, { target: { value: "100000" } });
    expect((input as HTMLInputElement).value).not.toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Clear my data" }));

    const inputAfterClear = screen.getByLabelText(
      /How much money lands in your bank account each month/i,
    );
    expect((inputAfterClear as HTMLInputElement).value).toBe("");
    expect(screen.getByText("Your numbers will appear here as you answer.")).toBeInTheDocument();
  });

  it("shows the known-TDS amount field only when that option is selected", () => {
    renderWizard();
    expect(screen.queryByLabelText(/How much tax is deducted each month/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Yes, and I know the amount" }));
    expect(screen.getByLabelText(/How much tax is deducted each month/i)).toBeInTheDocument();
  });

  it("renders the step 1 FAQ with all five questions", () => {
    renderWizard();
    expect(screen.getByText("Common doubts on this step")).toBeInTheDocument();
    expect(screen.getByText("Why don't you just ask for my CTC?")).toBeInTheDocument();
    expect(screen.getByText("What if I changed jobs this year?")).toBeInTheDocument();
  });
});

function fillStep1AndContinue() {
  fireEvent.change(screen.getByLabelText(/How much money lands in your bank account each month/i), {
    target: { value: "100000" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "No tax is deducted" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("WizardShell — step 2 (about you)", () => {
  it("shows the professional tax amount field only when Yes is chosen, with the ₹2,500 cap note", () => {
    renderWizard();
    fillStep1AndContinue();

    expect(screen.queryByLabelText("How much per month?")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    const profTaxInput = screen.getByLabelText("How much per month?");
    fireEvent.change(profTaxInput, { target: { value: "250" } });

    expect(
      screen.getByText("The law caps professional tax at ₹2,500 a year, so we've used ₹2,500."),
    ).toBeInTheDocument();
  });

  it("blocks Continue until city and professional-tax questions are answered, then advances to step 3", () => {
    renderWizard();
    fillStep1AndContinue();

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getAllByText("Please choose one of the options above.").length).toBe(2);
    expect(screen.getByText(/Step 2 of 8/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Any other city" }));
    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText(/Step 3 of 8/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "How your salary is put together" }),
    ).toBeInTheDocument();
  });
});

function advanceToStep3() {
  fillStep1AndContinue();
  fireEvent.click(screen.getByRole("radio", { name: "Any other city" }));
  fireEvent.click(screen.getByRole("radio", { name: "No" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("WizardShell — step 3 (salary structure)", () => {
  it("forces the basic salary question when PF is exactly ₹1,800, and blocks Continue until it's filled", () => {
    renderWizard();
    advanceToStep3();

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    fireEvent.change(
      screen.getByLabelText(/How much PF is deducted from your salary each month/i),
      { target: { value: "1800" } },
    );

    expect(
      screen.getByText(/₹1,800 is the standard capped amount/),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/What is your monthly basic salary/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "No — please estimate it for me" }));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Please enter your basic salary.")).toBeInTheDocument();
    expect(screen.getByText(/Step 3 of 8/)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/What is your monthly basic salary/i), {
      target: { value: "20000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText(/Step 4 of 8/)).toBeInTheDocument();
  });

  it("shows the basic-share slider when PF and basic are both unknown, and updates its readout live", () => {
    renderWizard();
    advanceToStep3();

    fireEvent.click(screen.getByRole("radio", { name: "No" })); // PF not deducted
    fireEvent.click(screen.getByRole("radio", { name: "No — please estimate it for me" }));

    expect(screen.getByText(/50% of .* basic per month/)).toBeInTheDocument();

    fireEvent.change(screen.getByRole("slider"), { target: { value: "40" } });
    expect(screen.getByText(/40% of .* basic per month/)).toBeInTheDocument();
  });
});

/** Reaches step 4 with an exact (TDS-known) gross of ₹15,00,000 and a known basic of ₹62,500/month, metro city. */
function advanceToStep4WithGT2Salary() {
  fireEvent.change(screen.getByLabelText(/How much money lands in your bank account each month/i), {
    target: { value: "100000" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "Yes, and I know the amount" }));
  fireEvent.change(screen.getByLabelText(/How much tax is deducted each month/i), {
    target: { value: "25000" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));

  fireEvent.click(screen.getByRole("radio", { name: "Delhi, Mumbai, Kolkata or Chennai" }));
  fireEvent.click(screen.getByRole("radio", { name: "No" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));

  fireEvent.click(screen.getByRole("radio", { name: "No" })); // PF not deducted
  fireEvent.click(screen.getByRole("radio", { name: "Yes, I know it" }));
  fireEvent.change(screen.getByLabelText(/What is your monthly basic salary/i), {
    target: { value: "62500" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("WizardShell — step 4 (rent and HRA)", () => {
  it("GT-2 — matches the worked HRA example exactly through the real wizard flow", () => {
    renderWizard();
    advanceToStep4WithGT2Salary();
    expect(screen.getByText(/Step 4 of 8/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Yes" })); // pays rent
    fireEvent.change(screen.getByLabelText(/How much rent do you pay each month/i), {
      target: { value: "25000" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Yes, all year" }));
    fireEvent.click(screen.getByRole("radio", { name: "Yes, and I know the amount" }));
    fireEvent.change(screen.getByLabelText(/How much HRA do you get each month/i), {
      target: { value: "25000" },
    });

    expect(screen.getByText("Your rent benefit (old regime only)")).toBeInTheDocument();
    expect(screen.getByText("₹3,00,000")).toBeInTheDocument(); // limb 1 / annual rent
    expect(screen.getByText("₹3,75,000")).toBeInTheDocument(); // limb 2
    expect(screen.getByText("Tax-free HRA")).toBeInTheDocument();
    // ₹2,25,000 appears at least twice: the winning limb 3, and the Tax-free HRA total
    // (it may also coincide with a slab-table "income here" figure at these numbers).
    expect(screen.getAllByText("₹2,25,000").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("₹75,000")).toBeInTheDocument(); // taxable HRA
  });

  it('shows the estimated HRA and a working "change it" link when the amount is unknown', () => {
    renderWizard();
    advanceToStep4WithGT2Salary();

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    fireEvent.change(screen.getByLabelText(/How much rent do you pay each month/i), {
      target: { value: "25000" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Yes, all year" }));
    fireEvent.click(screen.getByRole("radio", { name: "Yes, but I don't know the amount" }));

    // 50% of ₹62,500 basic (metro) = ₹31,250.
    expect(screen.getByText(/We've assumed your HRA is ₹31,250 a month/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Change it →" }));
    expect(screen.getByLabelText(/How much HRA do you get each month/i)).toHaveValue("31,250");
  });

  it("shows the Section 80GG panel and zero exemption when there's no HRA line", () => {
    renderWizard();
    advanceToStep4WithGT2Salary();

    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    fireEvent.change(screen.getByLabelText(/How much rent do you pay each month/i), {
      target: { value: "25000" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Yes, all year" }));
    fireEvent.click(screen.getByRole("radio", { name: "No, there's no HRA line" }));

    expect(screen.getByText(/Section 80GG/)).toBeInTheDocument();
  });

  it("skips step 4 without requiring an answer, resetting rent fields", () => {
    renderWizard();
    advanceToStep4WithGT2Salary();

    fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));
    expect(screen.getByText(/Step 5 of 8/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(screen.queryByText("Your rent benefit (old regime only)")).not.toBeInTheDocument();
  });
});

/** Reaches step 5 with a known PF of ₹3,600/month (₹43,200/year) and a known basic of ₹50,000/month. */
function advanceToStep5WithKnownPF() {
  fillStep1AndContinue();
  fireEvent.click(screen.getByRole("radio", { name: "Any other city" }));
  fireEvent.click(screen.getByRole("radio", { name: "No" }));
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));

  fireEvent.click(screen.getByRole("radio", { name: "Yes" })); // PF deducted
  fireEvent.change(screen.getByLabelText(/How much PF is deducted from your salary each month/i), {
    target: { value: "3600" },
  });
  fireEvent.click(screen.getByRole("radio", { name: "Yes, I know it" }));
  fireEvent.change(screen.getByLabelText(/What is your monthly basic salary/i), {
    target: { value: "50000" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));

  fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));
}

describe("WizardShell — step 5 (savings and investments)", () => {
  it("shows the auto-included PF row and never asks for it again", () => {
    renderWizard();
    advanceToStep5WithKnownPF();

    expect(screen.getByText("Your PF for the year (added automatically)")).toBeInTheDocument();
    expect(screen.getByText("₹43,200")).toBeInTheDocument();
  });

  it("E10 — the limit bar turns amber and calls out the excess once ₹1.5 lakh is crossed", () => {
    renderWizard();
    advanceToStep5WithKnownPF();

    fireEvent.change(screen.getByLabelText(/How much did you put into PPF this year/i), {
      target: { value: "140000" },
    });

    // raw80C = 43,200 (PF) + 1,40,000 (PPF) = 1,83,200 → excess = 33,200.
    expect(
      screen.getByText("You've hit the ₹1.5 lakh limit. Anything more won't save you extra tax under this rule."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("₹33,200 of your investments gave you no extra tax benefit."),
    ).toBeInTheDocument();
  });

  it("shows the capped 80C figure in the preview panel's deductions block", () => {
    renderWizard();
    advanceToStep5WithKnownPF();

    fireEvent.change(screen.getByLabelText(/How much did you put into PPF this year/i), {
      target: { value: "140000" },
    });

    expect(screen.getByText("Deductions (Chapter VI-A)")).toBeInTheDocument();
    // Appears twice: the 80C row and the (currently identical) total deductions row.
    expect(screen.getAllByText("−₹1,50,000").length).toBe(2);
  });

  it("skips step 5 without requiring an answer, zeroing the 80C fields", () => {
    renderWizard();
    advanceToStep5WithKnownPF();
    fireEvent.change(screen.getByLabelText(/How much did you put into PPF this year/i), {
      target: { value: "140000" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));
    expect(screen.getByText(/Step 6 of 8/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect((screen.getByLabelText(/How much did you put into PPF this year/i) as HTMLInputElement).value).toBe("");
  });
});

function advanceToStep6() {
  advanceToStep5WithKnownPF();
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("WizardShell — step 6 (health insurance and medical)", () => {
  it("shows the live self-cap indicator (₹25,000 under 60)", () => {
    renderWizard();
    advanceToStep6();
    expect(screen.getByText("Limit for you: ₹25,000")).toBeInTheDocument();
  });

  it("E31 — a preventive check-up sits inside the self cap in the deductions block", () => {
    renderWizard();
    advanceToStep6();

    fireEvent.change(
      screen.getByLabelText(
        /How much health insurance premium do you pay for yourself, your spouse and your children/i,
      ),
      { target: { value: "25000" } },
    );
    fireEvent.change(screen.getByLabelText(/Did you pay for any preventive health check-ups/i), {
      target: { value: "5000" },
    });

    expect(screen.getByText("80D — health insurance")).toBeInTheDocument();
    expect(screen.getByText("−₹25,000")).toBeInTheDocument(); // unchanged by the check-up
  });

  it("warns when preventive check-up spend exceeds ₹5,000", () => {
    renderWizard();
    advanceToStep6();

    fireEvent.change(screen.getByLabelText(/Did you pay for any preventive health check-ups/i), {
      target: { value: "8000" },
    });
    expect(screen.getByText("Only ₹5,000 of this can be counted.")).toBeInTheDocument();
  });

  it("E32 — the medical-expenditure field only appears for senior parents with no premium", () => {
    renderWizard();
    advanceToStep6();

    const parentsPremium = screen.getByLabelText(
      /Do you pay health insurance premiums for your parents/i,
    );
    expect(
      screen.queryByLabelText(/Did you pay medical bills for a parent aged 60\+/i),
    ).not.toBeInTheDocument();

    // Enter a placeholder premium to reveal the senior question, then clear it —
    // this is the only way §8.4's own gating (6.3 shown only if 6.2 > 0) lets a
    // "no premium at all" senior parent reach the expenditure field (E32).
    fireEvent.change(parentsPremium, { target: { value: "20000" } });
    fireEvent.click(screen.getByRole("radio", { name: "Yes, at least one is 60 or older" }));
    fireEvent.change(parentsPremium, { target: { value: "" } });

    expect(
      screen.getByLabelText(/Did you pay medical bills for a parent aged 60\+/i),
    ).toBeInTheDocument();

    // Re-entering a premium makes the two mutually exclusive again.
    fireEvent.change(parentsPremium, { target: { value: "10000" } });
    expect(
      screen.queryByLabelText(/Did you pay medical bills for a parent aged 60\+/i),
    ).not.toBeInTheDocument();
  });

  it("skips step 6 without requiring an answer, zeroing the health fields", () => {
    renderWizard();
    advanceToStep6();
    fireEvent.change(
      screen.getByLabelText(
        /How much health insurance premium do you pay for yourself, your spouse and your children/i,
      ),
      { target: { value: "25000" } },
    );

    fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));
    expect(screen.getByText(/Step 7 of 8/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "← Back" }));
    expect(
      (
        screen.getByLabelText(
          /How much health insurance premium do you pay for yourself, your spouse and your children/i,
        ) as HTMLInputElement
      ).value,
    ).toBe("");
  });
});

function advanceToStep7() {
  advanceToStep6();
  fireEvent.click(screen.getByRole("button", { name: "Continue" }));
}

describe("WizardShell — step 7 (home loan and NPS)", () => {
  it("shows the let-out notice and zeroes home loan values when the property isn't self-occupied", () => {
    renderWizard();
    advanceToStep7();

    fireEvent.click(screen.getAllByRole("radio", { name: "Yes" })[0]); // has home loan
    fireEvent.click(screen.getByRole("radio", { name: "Yes, I live in it" }));
    fireEvent.change(
      screen.getByLabelText(/How much interest did you pay on your home loan this year/i),
      { target: { value: "50000" } },
    );
    fireEvent.click(screen.getByRole("radio", { name: "No, it's rented out" }));

    // Appears twice: the step's own inline notice, and the persistent out-of-scope banner (§17.4).
    expect(screen.getAllByText(/We only handle the home you live in/).length).toBeGreaterThanOrEqual(1);
    expect(
      screen.queryByLabelText(/How much interest did you pay on your home loan this year/i),
    ).not.toBeInTheDocument();
  });

  it("shows the critical explainer panel only once employer NPS is confirmed", () => {
    renderWizard();
    advanceToStep7();

    // At this point exactly two radios are labelled "Yes": has-home-loan (index 0)
    // and has-NPS (index 1).
    fireEvent.click(screen.getAllByRole("radio", { name: "Yes" })[1]);
    expect(
      screen.queryByText(/Employer NPS is the only deduction that survives/),
    ).not.toBeInTheDocument();

    // Answering "yes" reveals a third "Yes" radio (employer contributes), appended last.
    const yesRadios = screen.getAllByRole("radio", { name: "Yes" });
    fireEvent.click(yesRadios[yesRadios.length - 1]);

    expect(
      screen.getByText(/Employer NPS is the only deduction that survives/),
    ).toBeInTheDocument();
  });

  it("toggles the NPS explainer without storing an answer", () => {
    renderWizard();
    advanceToStep7();

    expect(screen.queryByText(/National Pension System/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "What is NPS?" }));
    expect(screen.getByText(/National Pension System/)).toBeInTheDocument();
  });

  it("skips step 7 without requiring an answer", () => {
    renderWizard();
    advanceToStep7();

    fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));
    expect(screen.getByText(/Step 8 of 8/)).toBeInTheDocument();
  });
});

function advanceToStep8() {
  advanceToStep7();
  fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));
}

describe("WizardShell — step 8 (interest and other income)", () => {
  it("shows the donation-rate question only once a donation amount is entered", () => {
    renderWizard();
    advanceToStep8();

    expect(screen.queryByText("What kind of donation was it?")).not.toBeInTheDocument();
    fireEvent.change(
      screen.getByLabelText(/Did you donate to a registered charity or relief fund/i),
      { target: { value: "10000" } },
    );
    expect(screen.getByText("What kind of donation was it?")).toBeInTheDocument();
  });

  it('shows the "See my result" label on the last step', () => {
    renderWizard();
    advanceToStep8();
    expect(screen.getByRole("button", { name: "See my result →" })).toBeInTheDocument();
  });
});

describe("WizardShell — end-to-end golden vectors through the complete wizard", () => {
  it("GT-2 — the full wizard produces the exact worked totals (₹1,31,820 old, ₹97,500 new)", () => {
    renderWizard();

    // Step 1 — exact gross of ₹15,00,000. The exact-TDS formula also folds in
    // the raw (uncapped) monthly professional tax entered on step 2 below, so
    // TDS is ₹300/month lighter than the round figure to compensate:
    // 12 × (1,00,000 + 300 profTax + 24,700 TDS) = 15,00,000.
    fireEvent.change(
      screen.getByLabelText(/How much money lands in your bank account each month/i),
      { target: { value: "100000" } },
    );
    fireEvent.click(screen.getByRole("radio", { name: "Yes, and I know the amount" }));
    fireEvent.change(screen.getByLabelText(/How much tax is deducted each month/i), {
      target: { value: "24700" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Step 2 — metro, professional tax capped at ₹2,500.
    fireEvent.click(screen.getByRole("radio", { name: "Delhi, Mumbai, Kolkata or Chennai" }));
    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    fireEvent.change(screen.getByLabelText("How much per month?"), { target: { value: "300" } });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Step 3 — no PF, known basic of ₹62,500/month (₹7,50,000/year).
    fireEvent.click(screen.getByRole("radio", { name: "No" }));
    fireEvent.click(screen.getByRole("radio", { name: "Yes, I know it" }));
    fireEvent.change(screen.getByLabelText(/What is your monthly basic salary/i), {
      target: { value: "62500" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Step 4 — ₹25,000/month rent, known HRA of ₹25,000/month.
    fireEvent.click(screen.getByRole("radio", { name: "Yes" }));
    fireEvent.change(screen.getByLabelText(/How much rent do you pay each month/i), {
      target: { value: "25000" },
    });
    fireEvent.click(screen.getByRole("radio", { name: "Yes, all year" }));
    fireEvent.click(screen.getByRole("radio", { name: "Yes, and I know the amount" }));
    fireEvent.change(screen.getByLabelText(/How much HRA do you get each month/i), {
      target: { value: "25000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Step 5 — ₹1.5 lakh of PPF fills the 80C basket exactly.
    fireEvent.change(screen.getByLabelText(/How much did you put into PPF this year/i), {
      target: { value: "150000" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Step 6 — ₹25,000 self health premium.
    fireEvent.change(
      screen.getByLabelText(
        /How much health insurance premium do you pay for yourself, your spouse and your children/i,
      ),
      { target: { value: "25000" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    // Steps 7 and 8 — nothing else in this scenario.
    fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));
    fireEvent.click(screen.getByRole("button", { name: "Skip this — doesn't apply to me" }));

    expect(screen.getByText("Total tax for the year")).toBeInTheDocument();
    // Both the desktop sidebar and the mobile bar's markup exist in the DOM at
    // once (jsdom doesn't apply the CSS that hides one or the other).
    expect(screen.getAllByText("₹1,31,820").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹97,500").length).toBeGreaterThan(0);
  });
});
