import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OutOfScopeBanner } from "./OutOfScopeBanner";
import { DEFAULT_WIZARD_INPUTS } from "../lib/tax/defaults";
import type { Computed } from "../lib/tax/types";

function computed(overrides: Partial<Computed> = {}): Computed {
  return {
    ...DEFAULT_WIZARD_INPUTS,
    basicMonthly: 0,
    basicSource: "estimated",
    basicPlusDaAnnual: 0,
    employeePFAnnual: 0,
    employerNPSAnnual: 0,
    ownNPSAnnual: 0,
    professionalTaxAnnualResolved: 0,
    annualRent: 0,
    hraReceivedAnnual: 0,
    hraExempt: 0,
    hraLimbs: [0, 0, 0],
    hraWinningLimb: 1,
    isMetro: false,
    annualGross: 0,
    grossDerivation: "exact",
    grossAmbiguous: false,
    ...overrides,
  };
}

describe("OutOfScopeBanner (PRD §17.4)", () => {
  it("shows nothing when no trigger condition is met", () => {
    render(<OutOfScopeBanner computed={computed({ annualGross: 10_00_000 })} />);
    expect(screen.queryByText(/surcharge/)).not.toBeInTheDocument();
  });

  it("E26 — shows the surcharge banner above ₹50 lakh gross", () => {
    render(<OutOfScopeBanner computed={computed({ annualGross: 51_00_000 })} />);
    expect(screen.getByText(/surcharge/)).toBeInTheDocument();
  });

  it("shows the let-out property notice", () => {
    render(<OutOfScopeBanner computed={computed({ propertyUse: "letOut" })} />);
    expect(screen.getByText(/We only handle the home you live in/)).toBeInTheDocument();
  });

  it("shows the under-construction notice", () => {
    render(<OutOfScopeBanner computed={computed({ propertyUse: "underConstruction" })} />);
    expect(screen.getByText(/under construction/)).toBeInTheDocument();
  });

  it("can show more than one banner at once, and each dismisses independently", () => {
    render(
      <OutOfScopeBanner computed={computed({ annualGross: 51_00_000, propertyUse: "letOut" })} />,
    );
    expect(screen.getByText(/surcharge/)).toBeInTheDocument();
    expect(screen.getByText(/We only handle the home you live in/)).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Dismiss" })[0]);
    expect(screen.queryByText(/surcharge/)).not.toBeInTheDocument();
    expect(screen.getByText(/We only handle the home you live in/)).toBeInTheDocument();
  });
});
