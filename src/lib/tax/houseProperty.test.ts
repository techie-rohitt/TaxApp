import { describe, expect, it } from "vitest";
import { houseProperty } from "./houseProperty";

describe("houseProperty (PRD §13.4)", () => {
  it("E16 — caps self-occupied interest at ₹2,00,000 in the old regime", () => {
    const loss = houseProperty("old", {
      hasHomeLoan: true,
      propertyUse: "selfOccupied",
      homeLoanInterestAnnual: 3_50_000,
    });
    expect(loss).toBe(-2_00_000);
  });

  it("E16 — is zero in the new regime regardless of interest paid", () => {
    const loss = houseProperty("new", {
      hasHomeLoan: true,
      propertyUse: "selfOccupied",
      homeLoanInterestAnnual: 3_50_000,
    });
    expect(loss).toBe(0);
  });

  it("is zero when there's no home loan", () => {
    expect(
      houseProperty("old", { hasHomeLoan: false, propertyUse: "", homeLoanInterestAnnual: 50_000 }),
    ).toBe(0);
  });

  it("is zero for let-out or under-construction properties (out of scope)", () => {
    expect(
      houseProperty("old", {
        hasHomeLoan: true,
        propertyUse: "letOut",
        homeLoanInterestAnnual: 50_000,
      }),
    ).toBe(0);
    expect(
      houseProperty("old", {
        hasHomeLoan: true,
        propertyUse: "underConstruction",
        homeLoanInterestAnnual: 50_000,
      }),
    ).toBe(0);
  });
});
