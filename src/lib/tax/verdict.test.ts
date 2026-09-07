import { describe, expect, it } from "vitest";
import { pickWinner } from "./verdict";
import type { FullTaxResult } from "./compute";

function result(totalTax: number): FullTaxResult {
  return { totalTax } as FullTaxResult;
}

describe("pickWinner (PRD §14.1)", () => {
  it("E30 — an exact tie (identical tax to the rupee) goes to the new regime", () => {
    const { winner, saving, verdict } = pickWinner(result(50_000), result(50_000));
    expect(winner).toBe("new");
    expect(saving).toBe(0);
    expect(verdict).toBe("tie");
  });

  it("treats a difference within ₹1,000 as a tie, still favouring the new regime", () => {
    const { winner, verdict } = pickWinner(result(50_500), result(50_000));
    expect(winner).toBe("new");
    expect(verdict).toBe("tie");
  });

  it("picks the genuinely cheaper regime once the difference exceeds ₹1,000", () => {
    expect(pickWinner(result(60_000), result(50_000)).winner).toBe("new");
    expect(pickWinner(result(50_000), result(60_000)).winner).toBe("old");
  });
});
