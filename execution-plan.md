# Execution Plan — "Which Regime?" Tax Calculator

Derived from `tax-regime-calculator-PRD.md`. Each phase below is scoped to fit in
one working session. **Every phase ends with a working app you can open in a
browser** — nothing is "half-wired" at a phase boundary. Phases are meant to be
done in order; later phases assume earlier ones are merged.

Two running rules, carried over from the PRD, apply to every phase:
- The tax engine (`src/lib/tax/`) is the source of truth. UI never computes tax inline.
- No phase introduces a spinner, a loading state, or a network call — this app has none, ever.

---

## How to use this plan

Each phase has:
- **Builds on** — what must already exist.
- **Scope** — what gets built, tied to PRD section numbers.
- **Explicitly deferred** — what will look/feel unfinished, so it doesn't get mistaken for a bug.
- **Checkpoint (what you'll see)** — the concrete thing to open and judge before continuing.

Stop after any phase if the direction feels wrong. Nothing downstream is committed to until you say go.

---

## Phase 1 — Scaffold

**Builds on:** nothing.

**Scope:**
- Vite + React + TypeScript (strict) project.
- Tailwind installed with the color/spacing tokens from §23.2–23.4 wired as CSS variables (values only — no components use them yet).
- Client-side routing skeleton for the five routes in §5: `/`, `/calculator`, `/result`, `/how-it-works`, `/privacy` — each just a placeholder heading for now.
- `vitest` configured and running (empty test file, so CI/scripts are proven to work).

**Explicitly deferred:** all real content, all styling beyond raw tokens, the engine.

**Checkpoint:** `npm run dev` opens a page that lets you click between five nearly-blank routes. Proves the toolchain, not the product.

---

## Phase 2 — Tax engine core (salary-only) + debug calculator

This is pulled forward, ahead of any real UI, because §11–§14 (the engine) is
the riskiest and most law-sensitive part of the app. Building it first, behind
a throwaway UI, means the hardest logic gets validated before a single hour is
spent on wizard polish.

**Builds on:** Phase 1.

**Scope:**
- `src/lib/tax/constants.ts` — full constants file from §11.1–11.2 (all of it; costs nothing to include it all now).
- `src/lib/tax/slabs.ts`, `rebate.ts`, `compute.ts` for the **salary-only** path: gross salary in, standard deduction (§13.3), slab tax (§13.9), rebate + marginal relief (§13.10), cess and rounding (§13.11), for both regimes and all three age bands.
- No HRA, no Chapter VI-A, no house property yet — `computeTax` runs with those terms hard-zeroed.
- A throwaway `/calculator` page (replaced in Phase 4): one input for annual gross salary, one radio for age band, and a plain table showing both regimes' slab-by-slab tax, rebate, cess, and total.
- Vitest unit tests for GT-1, GT-4 (marginal relief boundaries), GT-5 (old-regime ₹5L cliff), and E1–E7, E19, E22, E25 from §16/§18 — every one of these is reachable with salary-only inputs.

**Explicitly deferred:** HRA, all Chapter VI-A deductions, house property, the back-solver (still asks for gross salary directly, not take-home), any real design.

**Checkpoint:** Enter a gross salary and age band, see correct old-vs-new tax broken down slab by slab, matching GT-1/4/5 by hand. This is the first moment the actual tax law is verifiable in a browser.

---

## Phase 3 — Design system + landing page

**Builds on:** Phase 1 (tokens), independent of Phase 2's engine.

**Scope:**
- Full landing page, §6.1–§6.6: hero with the static sample-result mock, the three "why this is hard" columns, the three-step strip, the "we handle / we don't handle" columns, the privacy panel, final CTA and footer with the disclaimer (§28.2).
- Typography and spacing per §23.3–23.4 applied for real (not just tokens).
- The primary CTA links to `/calculator`, which for now still shows Phase 2's debug page.

**Explicitly deferred:** the real wizard, the confidence-preview mock stays static (it's supposed to be static per spec).

**Checkpoint:** The landing page reads as a finished marketing page — scroll it, resize it to mobile, click through to the still-rough calculator.

---

## Phase 4 — Wizard shell + Step 1 (salary, with the back-solver)

The back-solver (§12) is the second riskiest piece of engineering in the PRD
(explicitly called out as such). It gets its own phase, isolated from the rest
of the wizard, while the salary-only engine from Phase 2 is still the only
consumer.

**Builds on:** Phase 2 (engine), Phase 3 (design system).

**Scope:**
- `WizardShell`, `ProgressDots` (§7.2), navigation footer with Back/Continue/Skip (§7.3), the mandatory per-step FAQ accordion (§7.4), URL-hash step addressing.
- `sessionStorage` persistence with the "we start fresh" toast (§5), and the visible "Clear my data" control (§25.1).
- Step 1 only (§8.1): monthly in-hand, TDS knowledge radio + amount, employer-regime guess, bonus, other taxable salary — with its exact FAQ content.
- `src/lib/tax/solver.ts` implementing §12.4 exactly: the coarse-scan-then-bisect algorithm, ambiguity detection, the "how did you get my gross salary?" panel (§12.5), and the exact-vs-solved distinction (§12.6).
- A minimal live preview panel showing only Block 1 (income) from §9.2, driven by the solved gross salary.
- Tests: GT-8 (solver base case) and GT-9 (ambiguity guard) from §18.

**Explicitly deferred:** steps 2–8, the full preview panel, the result page. Continuing past step 1 can dead-end for now (acceptable — it's the next phase).

**Checkpoint:** Fill in step 1 with just a monthly in-hand figure, watch the gross salary get solved live, expand the "how did you get my gross salary?" panel, and confirm it matches the arithmetic in §12.5.

---

## Phase 5 — Steps 2–3 (about you, salary structure)

**Builds on:** Phase 4.

**Scope:**
- Step 2 (§8.2): age band, city/metro, professional tax — including the ₹2,500 annual cap and the "I'm not sure" fallback behavior.
- Step 3 (§8.3): PF deduction question, the ₹1,800-cap special case forcing basic salary to be asked, "do you know your basic" branch, the basic-share slider, and the derivation priority order in §11.3/§13.1 (`resolveBasicMonthly`, `resolveEmployeePFAnnual`).
- Preview panel Block 1 now reflects age band and professional tax correctly.
- Tests: E23 (prof tax cap), E28 (₹1,800 special case), E29 (basic clamp).

**Explicitly deferred:** rent/HRA (step 3.6's HRA-received field is deliberately parked until Phase 6, per the PRD's own builder note in §8.3).

**Checkpoint:** Walk through steps 1–3, land on step 4 (still a dead end), and confirm the derived basic salary and PF figures shown match what the PRD's worked examples say for the same inputs.

---

## Phase 6 — Step 4 (rent and HRA) + HRA exemption engine

**Builds on:** Phase 5.

**Scope:**
- `src/lib/tax/hra.ts` per §13.2: the three-limb calculation, metro/non-metro rates, negative-limb clamping, and the four-city-only metro list (§11.2, called out repeatedly as a common competitor bug).
- Step 4 full flow (§8.4): pay-rent branch, months-paid stepper, all three HRA-known/unknown/absent sub-branches, the 80GG educational (not computed) panel.
- The dedicated "Your rent benefit" block in the preview showing all three limbs and the winner (§9.2 step-4 block).
- Tests: E8 (no HRA component), E9 (negative limb clamps to zero), GT-2 and GT-7's HRA figures.

**Explicitly deferred:** steps 5–8 remain dead ends.

**Checkpoint:** Enter a metro rent scenario matching GT-2 (₹15L salary, ₹25k/month rent) and confirm the three-limb breakdown and exempt HRA figure match the PRD's worked table exactly.

---

## Phase 7 — Step 5 (savings & investments) + the 80C basket

**Builds on:** Phase 6.

**Scope:**
- Step 5 full flow (§8.5): the persistent ₹1.5L running-limit bar (turns amber at 100%), the auto-included read-only PF row, all nine 80C-family inputs, the auto-link from home-loan-principal (still zero until Phase 9, shown as a plain input for now).
- `chapterVIA_Old`'s 80CCE portion from §13.6 (80C basket only — NPS/80D/etc. still stubbed to zero pending later phases), including the NPS-allocation-order rule (own NPS's 80CCD(1B)-first-then-spillover, since it's cheap to build alongside the basket even though NPS inputs arrive in Phase 9 — leave the function ready, fed zero until then).
- Preview Block 4 (deductions) appears for the first time, showing the 80C line only.
- Tests: E10 (over-limit excess called out), E11 (PF not double-counted).

**Explicitly deferred:** 80D, home loan interest, NPS inputs (the allocation function exists but has nothing to allocate yet), 80TTA/TTB, 80G, 80E.

**Checkpoint:** Fill 80C items past ₹1.5 lakh and watch the bar go amber with the correct "gave you no extra benefit" messaging; confirm the deduction line in the preview caps correctly.

---

## Phase 8 — Step 6 (health insurance) + 80D/80DD/80DDB/80U

**Builds on:** Phase 7.

**Scope:**
- Step 6 full flow (§8.6): self/family premium with the live age-based cap indicator, parents' premium with the senior-parent toggle, preventive check-up (inside-the-cap, not on top), uninsured-senior-parent medical expenditure (mutually exclusive with parents' premium per E32), the collapsed disability/illness disclosure (80DD/80U flat amounts, 80DDB with the senior-patient sub-radio).
- `chapterVIA_Old`'s 80D/80DD/80U/80DDB portions from §13.6.
- Preview Block 4 gains the 80D and disability/illness rows.
- Tests: E31 (check-up inside the cap), E32 (expenditure/premium mutual exclusivity).

**Explicitly deferred:** home loan, NPS, other-income deductions still zero.

**Checkpoint:** Enter self + senior-parent health premiums and confirm the live cap indicator and final 80D figure match §13.6's worked logic (₹25k/₹50k self, ₹25k/₹50k parents, max ₹1L total).

---

## Phase 9 — Step 7 (home loan & NPS) + 24(b), 80CCD(1B)/(2), employer-NPS gross-up

This phase closes out the trickiest deduction interaction in the whole PRD:
employer NPS as *both* income and deduction (§13.8).

**Builds on:** Phase 8.

**Scope:**
- Step 7 full flow (§8.7): home-loan branch (self-occupied / let-out / under-construction, with the two out-of-scope notices), interest and principal inputs with live caps, the NPS branch (with the inline "what is NPS?" explainer), employer-NPS question and the mandatory explainer panel when it's yes.
- `houseProperty()` (§13.4), the completed 80CCD(1B)/80CCE-spillover allocation now fed real numbers, `chapterVIA_New` (§13.7) — the new regime's *only* deduction — and the gross-up step (`annualGross += employerNPSAnnual`, §13.8) wired into the already-existing solver/derive pipeline.
- Step 5's home-loan-principal field becomes genuinely read-only and linked, closing out the auto-link left open in Phase 7.
- Preview Blocks 1 (gross now includes employer NPS), 3 (house property), and 4 (80CCD1B/2) complete.
- Tests: E12/E13 (NPS allocation order), E16 (interest cap), E20/E21 (employer NPS over-cap and govt-vs-private rate).

**Explicitly deferred:** step 8, the full slab tables in the preview, the result page.

**Checkpoint:** Set up GT-7's inputs (home loan + NPS + high income) through the wizard and confirm the old-regime and new-regime totals in the preview match the PRD's worked table for GT-7.

---

## Phase 10 — Step 8 (other income) + the complete live preview panel

**Builds on:** Phase 9.

**Scope:**
- Step 8 full flow (§8.8): savings/FD interest with age-based cap indicators, other income, donations with the 100%/50% sub-radio, education loan interest.
- `otherSources()`, 80TTA/80TTB mutual exclusivity (§13.6, E14/E15), 80G flat-rate application, 80E (uncapped).
- The **complete** preview panel per §9.2: all of Blocks 0–8 now populated for real, including the full slab-by-slab tables (Block 6, every row rendered even at zero) and the live nudges (Block 8, top two by rupee value using a first cut of the suggestion rules from §21).
- Mobile/tablet collapsed preview bar (§7.1, §9.3).
- Tests: E14, E15, and re-run GT-1, GT-2, GT-6, GT-7 end-to-end through the full wizard (not just the engine) for the first time.

**Explicitly deferred:** the result page itself — finishing the wizard still has nowhere dedicated to land besides the preview panel.

**Checkpoint:** Complete the entire 8-step wizard for a realistic profile (e.g. GT-2's numbers) on both desktop and a narrow/mobile viewport, and see the fully populated preview panel with correct slab tables on both.

---

## Phase 11 — Result page (verdict, comparison, slab breakdown)

**Builds on:** Phase 10.

**Scope:**
- `/result` route guard (redirects to `/calculator` if the wizard isn't complete, §5).
- Verdict card (§10.1) with all three copy variants (clear winner / near-tie / both-zero) and the winner-picking logic (§14.1, ties-go-to-new).
- Side-by-side comparison table with a difference column (§10.2).
- Slab-by-slab breakdown with the narrative line under each table (§10.3).
- Practical next-steps checklist, regime-specific (§10.6).
- Disclaimer footer (§10.7 / §28.2), always visible.

**Explicitly deferred:** the explanation engine and suggestions engine (§20–21) — result page shows correct numbers but no personalized narrative yet.

**Checkpoint:** Finish the wizard and land on `/result`; confirm the verdict copy, comparison table, and slab breakdown are internally consistent with the preview panel you just saw, for at least one clear-winner and one near-tie scenario.

---

## Phase 12 — Explanation engine + suggestions engine

**Builds on:** Phase 11.

**Scope:**
- `src/lib/tax/impact.ts`: the counterfactual `impactOf` function (§20.1) with full re-derivation (not field-swap), run across the field list in §20.2, sorted and filtered per spec, rendered as cards with the exact templates from §20.4, plus the summary line (§20.5).
- `src/lib/tax/suggestions.ts`: the marginal-rate helper (§21.1) and all 17 rules S1–S17 (§21.2), each carrying a rupee figure, capped at five shown, sorted by saving, with the closing disclaimer line (§21.3).
- Both sections rendered on `/result` (§10.4, §10.5).

**Explicitly deferred:** nothing functionally — this is the last content phase. Polish and hardening come next.

**Checkpoint:** Run a scenario where rent is the dominant factor (e.g. GT-2 or GT-7) and confirm the "what each answer did" summary correctly names rent as the deciding factor, and that suggestion cards fire the expected rules (e.g. S1 if 80C isn't maxed, S3 if no employer NPS) with plausible rupee figures.

---

## Phase 13 — Full validation, warnings, and edge-case hardening

**Builds on:** Phase 12 (all inputs and screens now exist).

**Scope:**
- Every field-level validation rule from §17.1 wired to real inline errors (on blur/submit, never mid-typing).
- Every soft warning from §17.2 wired as non-blocking inline messages.
- Cross-field validation (§17.3) and the out-of-scope detection banner (§17.4) for surcharge/let-out/under-construction/capital-gains triggers.
- Remaining edge cases from §16 not already covered by earlier phases' tests (sweep E1–E32 and confirm each has a passing test — most will already be covered incidentally; this phase closes the gaps).
- All 9 golden vectors (§18) passing end-to-end with zero deviation (±₹100 for the solver).
- Property tests from §27.1: new-regime Chapter VI-A invariant, monotonicity sweep, age-band invariance in the new regime.

**Explicitly deferred:** nothing new-feature — this is a correctness/robustness pass.

**Checkpoint:** Deliberately try to break it — absurd rent, PF over the cap, income over ₹50L, a let-out property — and confirm every case shows the right warning/banner instead of a wrong number or a crash. Run the full test suite green.

---

## Phase 14 — Static pages: how-it-works and privacy

**Builds on:** Phase 13 (content it references now stable).

**Scope:**
- `/how-it-works` (§28.3): full constants table, the regime comparison table, the computation order, an honest description of the solver's marginal-relief ambiguity, and every stated simplification.
- `/privacy` (§25.2): the full privacy statement verbatim.
- Footer links wired everywhere they're specified (landing, wizard, result).
- CSP header configuration for the static host (§25.1) and a manual/automated check that zero network requests occur after initial load.

**Explicitly deferred:** nothing — this closes out content requirements.

**Checkpoint:** Open `/how-it-works` and `/privacy` directly, and open the browser Network tab while using the whole app end-to-end to confirm no requests fire after the initial page load.

---

## Phase 15 — Accessibility, motion, responsive and performance polish

**Builds on:** everything above (this is the final pass before calling it done).

**Scope:**
- Full accessibility pass against §26: keyboard navigation, focus rings, labels, `aria-live` on the preview panel and error messages, real `<table>` semantics on slab tables, native/accessible FAQ accordions, contrast check on muted text, accessible progress-dot labels, 44px touch targets.
- Motion per §23.6: value tweens, step transitions, winner-flip animation, and `prefers-reduced-motion` fallback.
- Responsive verification across desktop/tablet/mobile breakpoints exactly as specified in §7.1 and §9.3.
- Performance pass against §24.4 targets (bundle size, FCP, recalculation time, Lighthouse scores).
- Full sweep of the acceptance criteria checklist in §27.

**Checkpoint:** Run Lighthouse and confirm the §24.4/§27.5 targets; test with a screen reader (VoiceOver or NVDA) through one full wizard pass; resize to 360px width and confirm full usability. At this point every checkbox in §27 should be checkable.

---

## Summary table

| # | Phase | What becomes visible |
|---|---|---|
| 1 | Scaffold | Five routes, empty shell |
| 2 | Engine core + debug calculator | Correct salary-only tax, both regimes |
| 3 | Landing page | Full marketing page |
| 4 | Wizard shell + Step 1 | Live back-solved gross salary |
| 5 | Steps 2–3 | Age/city/PF/basic resolved correctly |
| 6 | Step 4 + HRA | Three-limb rent benefit shown live |
| 7 | Step 5 + 80C | Running ₹1.5L limit bar |
| 8 | Step 6 + 80D family | Health insurance caps shown live |
| 9 | Step 7 + home loan/NPS | Employer NPS gross-up working |
| 10 | Step 8 + full preview | Entire wizard + full live preview panel |
| 11 | Result page | Verdict, comparison, slab breakdown |
| 12 | Explanation + suggestions | Personalized narrative and advice |
| 13 | Validation hardening | Can't be broken by bad input |
| 14 | Static pages | /how-it-works, /privacy live |
| 15 | Polish | Accessible, fast, responsive, done |
