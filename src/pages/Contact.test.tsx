import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import Contact from "./Contact";

function renderContact() {
  render(
    <MemoryRouter>
      <Contact />
    </MemoryRouter>,
  );
}

describe("Contact page", () => {
  let originalLocation: Location;

  beforeEach(() => {
    originalLocation = window.location;
    // Replace window.location with a plain mock so the "successful submit"
    // path can set `href` without jsdom attempting a real navigation.
    Object.defineProperty(window, "location", {
      value: { ...originalLocation, href: "" },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
      configurable: true,
    });
  });

  it("renders the name, mobile, email and message fields", () => {
    renderContact();
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^message/i)).toBeInTheDocument();
  });

  it("shows validation errors and does not navigate when submitted empty", () => {
    renderContact();
    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.getByText("Tell us your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a 10-digit mobile number.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText(/say a little more/i)).toBeInTheDocument();
    expect(window.location.href).toBe("");
  });

  it("opens a mailto link addressed to us with the message encoded, once every field is valid", () => {
    renderContact();
    fireEvent.change(screen.getByLabelText(/^name/i), { target: { value: "Asha Rao" } });
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "9876543210" } });
    fireEvent.change(screen.getByLabelText(/^email/i), { target: { value: "asha@example.com" } });
    fireEvent.change(screen.getByLabelText(/^message/i), {
      target: { value: "Loved the calculator, one small question about HRA." },
    });

    fireEvent.click(screen.getByRole("button", { name: /send message/i }));

    expect(screen.queryByText("Tell us your name.")).not.toBeInTheDocument();
    expect(window.location.href).toMatch(/^mailto:rohitinu15@gmail\.com\?subject=/);
    expect(window.location.href).toContain(encodeURIComponent("Asha Rao"));
    expect(window.location.href).toContain(encodeURIComponent("Loved the calculator"));
    expect(screen.getByText(/opening your email app/i)).toBeInTheDocument();
  });

  it("only accepts digits in the mobile field, capped at 10", () => {
    renderContact();
    const mobile = screen.getByLabelText(/mobile number/i) as HTMLInputElement;
    fireEvent.change(mobile, { target: { value: "98a76-5432109999" } });
    expect(mobile.value).toBe("9876543210");
  });
});
