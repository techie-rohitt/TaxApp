import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import Result from "./Result";
import { useWizardStore } from "../store/wizard";

function renderResult() {
  return render(
    <MemoryRouter initialEntries={["/result"]}>
      <Routes>
        <Route path="/result" element={<Result />} />
        <Route path="/calculator" element={<div>Calculator placeholder</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useWizardStore.getState().clearAll();
});

describe("Result page — route guard (PRD §5)", () => {
  it("redirects to /calculator when the wizard has no data", () => {
    renderResult();
    expect(screen.getByText("Calculator placeholder")).toBeInTheDocument();
  });
});

describe("Result page — GT-2 scenario", () => {
  beforeEach(() => {
    useWizardStore.getState().setFields({
      monthlyInHand: 1_00_000,
      tdsKnowledge: "known",
      // 300/month raw professional tax feeds the exact-gross formula too, so
      // TDS is trimmed by that amount to land on an exact ₹15,00,000 gross.
      monthlyTDS: 24_700,
      cityType: "metro",
      basicKnown: true,
      basicMonthly: 62_500,
      paysRent: true,
      monthlyRent: 25_000,
      rentPaidWholeYear: true,
      hasHRAComponent: "yesKnown",
      monthlyHRA: 25_000,
      ppf: 1_50_000,
      paysProfessionalTax: true,
      professionalTaxMonthly: 300,
      healthPremiumSelf: 25_000,
    });
  });

  it("shows the imperative verdict heading and both regime figures", () => {
    renderResult();
    expect(screen.getByRole("heading", { name: /Pick the NEW REGIME/ })).toBeInTheDocument();
    expect(screen.getAllByText("₹97,500").length).toBeGreaterThan(0);
    expect(screen.getAllByText("₹1,31,820").length).toBeGreaterThan(0);
  });

  it("shows the full comparison table with a difference column", () => {
    renderResult();
    expect(screen.getByText("Side by side, in full")).toBeInTheDocument();
    expect(screen.getByText("Difference")).toBeInTheDocument();
    expect(screen.getByText(/New saves ₹34,320/)).toBeInTheDocument();
  });

  it("shows the slab breakdown with a narrative line", () => {
    renderResult();
    expect(screen.getByText("Slab by slab")).toBeInTheDocument();
    expect(screen.getByText(/bracket/)).toBeInTheDocument();
  });

  it('names rent in "what each of your answers did"', () => {
    renderResult();
    expect(screen.getByText("What each of your answers did")).toBeInTheDocument();
    expect(screen.getAllByText(/rent/i).length).toBeGreaterThan(0);
  });

  it("shows suggestion cards with a rupee figure and the estimate disclaimer", () => {
    renderResult();
    expect(screen.getByText("What you could do next")).toBeInTheDocument();
    expect(screen.getAllByText("estimated yearly saving").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/not financial advice/),
    ).toBeInTheDocument();
  });

  it("shows the new-regime next-steps checklist since new wins here", () => {
    renderResult();
    expect(screen.getByText("What to do next")).toBeInTheDocument();
    expect(screen.getByText(/the new regime is the default/i)).toBeInTheDocument();
  });

  it("always shows the disclaimer footer", () => {
    renderResult();
    expect(screen.getByText(/not a substitute for a qualified chartered accountant/)).toBeInTheDocument();
  });
});

describe("Result page — old regime wins", () => {
  it("shows the old-regime checklist and recommendation", () => {
    useWizardStore.getState().setFields({
      monthlyInHand: 1_50_000,
      tdsKnowledge: "unsure",
      cityType: "metro",
      basicKnown: true,
      basicMonthly: 83_333,
      paysRent: true,
      monthlyRent: 50_000,
      rentPaidWholeYear: true,
      hasHRAComponent: "yesKnown",
      monthlyHRA: 41_667,
      hasHomeLoan: true,
      propertyUse: "selfOccupied",
      homeLoanInterestAnnual: 2_00_000,
      ppf: 50_000,
    });
    renderResult();
    expect(screen.getByRole("heading", { name: /Pick the OLD REGIME/ })).toBeInTheDocument();
    expect(screen.getByText("What to do next")).toBeInTheDocument();
    expect(screen.getByText(/Form 10-IEA/)).toBeInTheDocument();
  });
});
