import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import HowItWorks from "./HowItWorks";

function renderPage() {
  return render(
    <MemoryRouter>
      <HowItWorks />
    </MemoryRouter>,
  );
}

describe("HowItWorks page (PRD §28.3)", () => {
  it("publishes the constants table", () => {
    renderPage();
    expect(screen.getByText("Every constant we use")).toBeInTheDocument();
    expect(screen.getAllByText("₹1,50,000").length).toBeGreaterThan(0); // 80C limit
  });

  it("publishes the regime comparison table", () => {
    renderPage();
    expect(screen.getByText("What's allowed in which regime")).toBeInTheDocument();
    expect(screen.getByText("14% of basic — ALLOWED")).toBeInTheDocument();
  });

  it("publishes the computation order", () => {
    renderPage();
    expect(screen.getByText("The order we compute in")).toBeInTheDocument();
  });

  it("honestly describes the solver's marginal-relief ambiguity", () => {
    renderPage();
    expect(screen.getByText(/more than one gross salary can technically match/)).toBeInTheDocument();
  });

  it("publishes every stated simplification", () => {
    renderPage();
    expect(screen.getByText("What we've simplified")).toBeInTheDocument();
    expect(
      screen.getByText(/Basic salary is estimated at 50% of gross/),
    ).toBeInTheDocument();
    expect(screen.getByText(/A single salary figure is assumed/)).toBeInTheDocument();
  });
});
