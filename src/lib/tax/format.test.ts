import { describe, expect, it } from "vitest";
import { formatIndianGrouping, parseIndianMoneyInput, roundToNearest } from "./format";

describe("roundToNearest (s.288A / s.288B rounding)", () => {
  it("E25 — rounds a total income of ₹6,72,004 down to ₹6,72,000", () => {
    expect(roundToNearest(672_004, 10)).toBe(672_000);
  });

  it("E25 — locks in half-up behaviour for a value ending in exactly 5", () => {
    // 675 / 10 = 67.5 → half-up rounds to 68 → 680, not 670.
    expect(roundToNearest(675, 10)).toBe(680);
  });
});

describe("formatIndianGrouping", () => {
  it("groups by lakh/crore, not by thousands", () => {
    expect(formatIndianGrouping(150_000)).toBe("1,50,000");
    expect(formatIndianGrouping(12_345_678)).toBe("1,23,45,678");
  });
});

describe("parseIndianMoneyInput (PRD §7.5 accepted paste formats)", () => {
  it.each([
    ["1,50,000", 150_000],
    ["150000", 150_000],
    ["1.5L", 150_000],
    ["1.5 lakh", 150_000],
    ["₹150000", 150_000],
    ["", 0],
  ])("parses %s as %i", (raw, expected) => {
    expect(parseIndianMoneyInput(raw)).toBe(expected);
  });

  it("clamps a negative entry to zero — money is never negative", () => {
    expect(parseIndianMoneyInput("-5000")).toBe(0);
  });

  it("falls back to zero for unparseable, non-numeric text", () => {
    expect(parseIndianMoneyInput("abc")).toBe(0);
  });

  it("falls back to zero for a lakh-suffixed value with no real number in it", () => {
    expect(parseIndianMoneyInput("...lakh")).toBe(0);
  });
});
