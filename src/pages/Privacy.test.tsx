import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import Privacy from "./Privacy";

describe("Privacy page (PRD §25.2)", () => {
  it("shows the privacy statement verbatim", () => {
    render(
      <MemoryRouter>
        <Privacy />
      </MemoryRouter>,
    );
    expect(
      screen.getByRole("heading", { name: "Nothing you type here leaves your device." }),
    ).toBeInTheDocument();
    expect(screen.getByText(/This site has no server, no database/)).toBeInTheDocument();
    expect(
      screen.getByText(/We could not see your salary even if we wanted to/),
    ).toBeInTheDocument();
  });
});
