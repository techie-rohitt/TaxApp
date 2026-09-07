import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App scaffold", () => {
  it("renders the landing page at the root route", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: "Find out which tax regime saves you more money." }),
    ).toBeInTheDocument();
  });

  it("links to the calculator, how-it-works and privacy routes", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: /calculate my tax/i })).toHaveAttribute(
      "href",
      "/calculator",
    );
    expect(screen.getByRole("link", { name: /see how we calculate it/i })).toHaveAttribute(
      "href",
      "/how-it-works",
    );
    expect(screen.getByRole("link", { name: /read the full privacy note/i })).toHaveAttribute(
      "href",
      "/privacy",
    );
  });
});
