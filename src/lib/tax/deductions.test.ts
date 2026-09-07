import { describe, expect, it } from "vitest";
import { chapterVIANew, chapterVIAOld, type ChapterVIAOldInput } from "./deductions";

function input(overrides: Partial<ChapterVIAOldInput> = {}): ChapterVIAOldInput {
  return {
    employeePFAnnual: 0,
    lifeInsurance: 0,
    ppf: 0,
    elss: 0,
    tuitionFees: 0,
    taxSavingFD: 0,
    sukanya: 0,
    nscOther: 0,
    homeLoanPrincipal: 0,
    stampDuty: 0,
    ownNPS: 0,
    basicPlusDaAnnual: 0,
    ageBand: "below60",
    healthPremiumSelf: 0,
    healthPremiumParents: 0,
    parentsAreSenior: false,
    preventiveCheckup: 0,
    parentsMedicalExpenditure: 0,
    disabilityDependant: "none",
    disabilitySelf: "none",
    specifiedIllnessSpend: 0,
    illnessPatientIsSenior: false,
    employerNPSAnnual: 0,
    isGovtEmployee: false,
    savingsInterest: 0,
    fdInterest: 0,
    educationLoanInterest: 0,
    donations: 0,
    donationRate: 0.5,
    ...overrides,
  };
}

describe("chapterVIAOld — 80CCE basket (PRD §13.6)", () => {
  it("E10 — caps the basket at ₹1.5 lakh and reports the excess explicitly", () => {
    const r = chapterVIAOld(input({ ppf: 2_14_000 }));
    expect(r.ded80CCE).toBe(1_50_000);
    expect(r.excess80C).toBe(64_000);
  });

  it("E11 — employee PF is summed exactly once alongside the user's own 80C items", () => {
    const r = chapterVIAOld(input({ employeePFAnnual: 43_200, ppf: 50_000 }));
    expect(r.raw80C).toBe(93_200);
    expect(r.ded80CCE).toBe(93_200);
  });

  it("E12 — own NPS fills 80CCD(1B) first; the spillover into an already-full 80CCE basket yields nothing", () => {
    const r = chapterVIAOld(
      input({ employeePFAnnual: 1_50_000, ownNPS: 80_000, basicPlusDaAnnual: 10_00_000 }),
    );
    expect(r.ded80CCD1B).toBe(50_000);
    expect(r.ded80CCE).toBe(1_50_000); // unchanged by the 30,000 spillover — basket was already full
    expect(r.total).toBe(2_00_000);
  });

  it("E13 — own NPS always fills 80CCD(1B) first even when 80CCE has room to spare", () => {
    const r = chapterVIAOld(
      input({ employeePFAnnual: 1_10_000, ownNPS: 30_000, basicPlusDaAnnual: 10_00_000 }),
    );
    expect(r.ded80CCD1B).toBe(30_000); // all of it — 80CCE room is irrelevant here
    expect(r.ded80CCE).toBe(1_10_000); // untouched — nothing spilled over
  });

  it("has zero excess and zero deduction when nothing is entered", () => {
    const r = chapterVIAOld(input());
    expect(r.ded80CCE).toBe(0);
    expect(r.excess80C).toBe(0);
    expect(r.total).toBe(0);
  });
});

describe("chapterVIAOld — 80D (PRD §13.6)", () => {
  it("caps self premium at ₹25,000 under 60, ₹50,000 at 60+", () => {
    expect(chapterVIAOld(input({ healthPremiumSelf: 30_000, ageBand: "below60" })).ded80D).toBe(
      25_000,
    );
    expect(chapterVIAOld(input({ healthPremiumSelf: 30_000, ageBand: "senior" })).ded80D).toBe(
      30_000,
    );
  });

  it("caps parents' premium at ₹25,000, or ₹50,000 if either parent is a senior citizen", () => {
    expect(
      chapterVIAOld(input({ healthPremiumParents: 30_000, parentsAreSenior: false })).ded80D,
    ).toBe(25_000);
    expect(
      chapterVIAOld(input({ healthPremiumParents: 30_000, parentsAreSenior: true })).ded80D,
    ).toBe(30_000);
  });

  it("the biggest possible 80D total is ₹1,00,000 (self 60+ and senior parents)", () => {
    const r = chapterVIAOld(
      input({
        ageBand: "senior",
        healthPremiumSelf: 60_000,
        healthPremiumParents: 60_000,
        parentsAreSenior: true,
      }),
    );
    expect(r.ded80D).toBe(1_00_000);
  });

  it("E31 — a preventive check-up sits inside the self cap, not on top of it", () => {
    const r = chapterVIAOld(input({ healthPremiumSelf: 25_000, preventiveCheckup: 5_000 }));
    expect(r.ded80D).toBe(25_000); // unchanged — the check-up added nothing
  });

  it("only ₹5,000 of a larger preventive check-up spend counts", () => {
    const r = chapterVIAOld(input({ healthPremiumSelf: 10_000, preventiveCheckup: 8_000 }));
    expect(r.ded80D).toBe(15_000); // 10,000 + min(8,000, 5,000)
  });

  it("E32 — parents' medical expenditure and their premium both feed the same capped bucket", () => {
    // The UI is responsible for making these mutually exclusive (E32); the engine
    // just applies the formula it's given, so this documents what happens if it isn't.
    const r = chapterVIAOld(
      input({
        healthPremiumParents: 20_000,
        parentsMedicalExpenditure: 20_000,
        parentsAreSenior: true,
      }),
    );
    expect(r.ded80D).toBe(40_000); // min(50,000, 40,000) — still capped, not double-counted beyond the limit
  });
});

describe("chapterVIAOld — 80DD / 80U / 80DDB flat and capped deductions (PRD §13.6)", () => {
  it("80DD (dependant's disability) is a flat amount by severity", () => {
    expect(chapterVIAOld(input({ disabilityDependant: "normal" })).ded80DD).toBe(75_000);
    expect(chapterVIAOld(input({ disabilityDependant: "severe" })).ded80DD).toBe(1_25_000);
    expect(chapterVIAOld(input({ disabilityDependant: "none" })).ded80DD).toBe(0);
  });

  it("80U (own disability) is a flat amount by severity", () => {
    expect(chapterVIAOld(input({ disabilitySelf: "normal" })).ded80U).toBe(75_000);
    expect(chapterVIAOld(input({ disabilitySelf: "severe" })).ded80U).toBe(1_25_000);
  });

  it("80DDB caps at ₹40,000, or ₹1,00,000 if the patient is a senior citizen", () => {
    expect(
      chapterVIAOld(input({ specifiedIllnessSpend: 60_000, illnessPatientIsSenior: false }))
        .ded80DDB,
    ).toBe(40_000);
    expect(
      chapterVIAOld(input({ specifiedIllnessSpend: 60_000, illnessPatientIsSenior: true }))
        .ded80DDB,
    ).toBe(60_000);
  });
});

describe("chapterVIAOld — 80TTA / 80TTB (PRD §13.6)", () => {
  it("E14 — a senior citizen with both savings and FD interest uses 80TTB only, capped at ₹50,000", () => {
    const r = chapterVIAOld(
      input({ ageBand: "senior", savingsInterest: 12_000, fdInterest: 60_000 }),
    );
    expect(r.ded80TT).toBe(50_000);
  });

  it("E15 — under 60, FD interest gets nothing; only the ₹10,000-capped savings interest counts", () => {
    const r = chapterVIAOld(
      input({ ageBand: "below60", savingsInterest: 4_000, fdInterest: 80_000 }),
    );
    expect(r.ded80TT).toBe(4_000);
  });
});

describe("chapterVIAOld — 80E and 80G (PRD §13.6)", () => {
  it("80E (education loan interest) is uncapped", () => {
    expect(chapterVIAOld(input({ educationLoanInterest: 2_00_000 })).ded80E).toBe(2_00_000);
  });

  it("80G applies the resolved donation rate (100% or 50%)", () => {
    expect(chapterVIAOld(input({ donations: 10_000, donationRate: 1 })).ded80G).toBe(10_000);
    expect(chapterVIAOld(input({ donations: 10_000, donationRate: 0.5 })).ded80G).toBe(5_000);
  });
});

describe("chapterVIAOld — 80CCD(2) employer NPS (PRD §13.6)", () => {
  it("E21 — private employer: capped at 10% of basic in the old regime", () => {
    const r = chapterVIAOld(
      input({ employerNPSAnnual: 2_00_000, basicPlusDaAnnual: 10_00_000, isGovtEmployee: false }),
    );
    expect(r.ded80CCD2).toBe(1_00_000); // 10% of 10,00,000, not the full 2,00,000 contributed
  });

  it("government employees get 14% in the old regime too", () => {
    const r = chapterVIAOld(
      input({ employerNPSAnnual: 2_00_000, basicPlusDaAnnual: 10_00_000, isGovtEmployee: true }),
    );
    expect(r.ded80CCD2).toBe(1_40_000);
  });
});

describe("chapterVIAOld — s.80A(2) GTI clamp (E17)", () => {
  it("never lets total deductions exceed gross total income", () => {
    const r = chapterVIAOld(input({ ppf: 1_50_000, healthPremiumSelf: 25_000 }), 1_00_000);
    expect(r.total).toBe(1_00_000);
  });
});

describe("chapterVIANew (PRD §13.7) — the new regime's only deduction", () => {
  it("caps employer NPS at 14% of basic for every employer type", () => {
    const r = chapterVIANew(2_00_000, 10_00_000);
    expect(r.ded80CCD2).toBe(1_40_000);
  });

  it("clamps to GTI per s.80A(2)", () => {
    const r = chapterVIANew(2_00_000, 10_00_000, 50_000);
    expect(r.total).toBe(50_000);
  });
});
