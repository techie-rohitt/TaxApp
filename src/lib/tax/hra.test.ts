import { describe, expect, it } from "vitest";
import { hraExemption } from "./hra";

describe("hraExemption (PRD §13.2)", () => {
  it("GT-2 — metro renter: rent-minus-10%-of-basic wins", () => {
    const r = hraExemption({
      hraReceivedAnnual: 3_00_000,
      basicPlusDaAnnual: 7_50_000,
      rentPaidAnnual: 3_00_000,
      isMetro: true,
    });
    expect(r.limbs).toEqual([3_00_000, 3_75_000, 2_25_000]);
    expect(r.winningLimb).toBe(3);
    expect(r.exempt).toBe(2_25_000);
  });

  it("GT-7 — metro renter where all three limbs tie", () => {
    const r = hraExemption({
      hraReceivedAnnual: 5_00_000,
      basicPlusDaAnnual: 10_00_000,
      rentPaidAnnual: 6_00_000,
      isMetro: true,
    });
    expect(r.limbs).toEqual([5_00_000, 5_00_000, 5_00_000]);
    expect(r.exempt).toBe(5_00_000);
  });

  it("E8 — no HRA component in salary means zero exemption", () => {
    const r = hraExemption({
      hraReceivedAnnual: 0,
      basicPlusDaAnnual: 6_00_000,
      rentPaidAnnual: 3_00_000,
      isMetro: false,
    });
    expect(r.exempt).toBe(0);
  });

  it("E9 — rent at or below 10% of basic clamps to zero, but the negative limb is still reported", () => {
    const r = hraExemption({
      hraReceivedAnnual: 2_00_000,
      basicPlusDaAnnual: 6_00_000, // 10% = 60,000
      rentPaidAnnual: 50_000, // below the 60,000 offset
      isMetro: false,
    });
    expect(r.limbs[2]).toBe(-10_000);
    expect(r.winningLimb).toBe(3);
    expect(r.exempt).toBe(0);
  });

  it("non-metro uses the 40% rate for limb 2", () => {
    const r = hraExemption({
      hraReceivedAnnual: 10_00_000,
      basicPlusDaAnnual: 6_00_000,
      rentPaidAnnual: 10_00_000,
      isMetro: false,
    });
    expect(r.limbs[1]).toBe(2_40_000);
  });
});
