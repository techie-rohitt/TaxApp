# Product Requirements Document
# "Which Regime?" — Income Tax Regime Comparison Wizard for Salaried Indians
### FY 2025-26 (Assessment Year 2026-27)

**Document version:** 1.0
**Status:** Ready for build
**Target audience of this document:** A developer or AI coding tool building the entire app from scratch, with no prior context.

---

## 0. How to read this document

This PRD is written so that a developer (human or AI) can build the full app without asking a single follow-up question. It is organised as:

| Part | Sections | What it covers |
|---|---|---|
| A | 1 – 4 | Product definition, scope, users, principles |
| B | 5 – 9 | Every screen, every input, every piece of copy |
| C | 10 – 15 | The tax engine: constants, formulas, algorithms, pseudocode |
| D | 16 – 18 | Edge cases, validations, golden test vectors |
| E | 19 – 22 | Explanation engine and suggestions engine |
| F | 23 – 28 | Design system, tech stack, data model, privacy, a11y, acceptance criteria |

**Rule for the builder:** Part C is law. If the UI and the tax engine ever disagree, the tax engine wins. Every number the UI shows must come from a pure function in the engine — never from a calculation written inline in a component.

---

# PART A — PRODUCT DEFINITION

## 1. The problem

Every year, crores of salaried Indians must choose between the Old Tax Regime and the New Tax Regime. Most of them guess.

The reason they guess is not laziness. It is that every existing calculator is built for people who already understand tax:

1. **They ask for the wrong starting number.** They ask for "CTC" or "Gross Salary" or "Total Income." A 23-year-old two months into their first job does not know their CTC. They have never opened their offer letter since the day they signed it. What they *do* know, with total certainty, is the number that lands in their bank account on the 1st of every month.

2. **They speak in section numbers.** "Enter your 80C deductions." "HRA exemption u/s 10(13A)." "Deduction under 80CCD(1B)." These are labels from a form, not questions a human would ask.

3. **They give an answer, not an understanding.** They print a number. They do not say *why*. So the user learns nothing and cannot check whether the answer is sane.

4. **They are one long form.** Twenty fields on a white page. High drop-off, high error rate, no feedback until the very end.

## 2. The product

A single-page, browser-only web app that:

- Starts from **"how much money lands in your bank account each month?"** and works backwards to gross salary, using a numerical solver.
- Asks **one topic at a time**, in plain language, in a wizard with a visible progress indicator.
- Puts a **small FAQ at the bottom of every single step**, answering the doubts people actually have on that step.
- Shows a **live, detailed preview panel** on the right that recalculates on every keystroke — full income breakdown, full deduction breakdown, slab-by-slab tables for both regimes, and a running verdict.
- Ends with a **plain verdict** ("Pick the New Regime. You save ₹34,320 this year."), a side-by-side comparison, slab-by-slab tables, a **personalised explanation of how each answer they gave changed their tax**, and **practical, rupee-quantified suggestions**.
- Runs **100% in the browser**. No backend, no network calls, no analytics, no accounts. Salary data never leaves the device.

## 3. Scope

### 3.1 In scope

| Area | Detail |
|---|---|
| Financial year | FY 2025-26 only (AY 2026-27) |
| Taxpayer type | Resident individual, salaried or pensioner |
| Regimes | Old Regime and New Regime (Section 115BAC) |
| Age handling | Below 60 / 60–79 (senior) / 80+ (super senior) |
| Income heads | Salary; House Property (self-occupied loss only); Other Sources (savings interest, FD/RD interest, other interest) |
| Exemptions | HRA u/s 10(13A), LTA u/s 10(5) |
| Salary deductions | Standard deduction 16(ia), Professional tax 16(iii) |
| Chapter VI-A | 80C, 80CCC, 80CCD(1), 80CCD(1B), 80CCD(2), 80D, 80DD, 80DDB, 80E, 80G, 80TTA, 80TTB, 80U |
| House property | Section 24(b) self-occupied interest, with Section 71(3A) set-off cap |
| Rebate | Section 87A, both regimes, including New Regime marginal relief |
| Cess | Health & Education Cess @ 4% |
| Rounding | Section 288A (income) and Section 288B (tax) |

### 3.2 Explicitly out of scope

Do not build these. Do not add input fields for them. If a user's situation needs them, show the "This calculator may not fit you" notice (Section 17.4).

- Surcharge (income above ₹50 lakh)
- Capital gains of any kind (equity, property, crypto/VDA)
- Business or professional income, freelance income, presumptive taxation
- Rental income from let-out property (only *self-occupied* home loan interest is handled)
- Non-residents / NRIs / RNOR
- HUF, firms, companies
- Agricultural income and its rate-aggregation rules
- Relief u/s 89 (arrears), Foreign tax credit, Clubbing of income
- Advance tax / TDS reconciliation / interest u/s 234A/B/C
- Employer contributions above the ₹7.5 lakh combined perquisite threshold
- ITR filing, Form 10-IEA, or any submission to the Income Tax portal
- PDF export, downloadable reports, email, sharing
- Section 80GG (rent paid with no HRA component) — *educate about it, do not compute it*

### 3.3 Non-goals

- This is not a tax filing product.
- This is not a payroll or CTC-structuring tool.
- This is not a general-purpose calculator with 60 fields. Every field must earn its place.

## 4. Design principles

These five principles resolve every design argument in this document.

**P1 — Start where the user already is.**
The first question is about the bank account, not the offer letter. If we must know something the user does not know (basic salary, gross salary), we *derive* it or *estimate* it and let them correct us. We never block them on a number they cannot find.

**P2 — No jargon on the surface, full rigour underneath.**
The label says "Do you pay rent?" The engine computes Section 10(13A) read with Rule 2A. Section numbers may appear in *secondary* text ("this is called 80C") because seeing the term once teaches it — but never in a primary label or a required field name.

**P3 — Show the work, always.**
The preview panel is not decoration. It is the product. Every rupee of the final number must be traceable to a line the user can see.

**P4 — Answer doubts where they happen.**
Every step carries its own FAQ. A user who is confused on step 4 should never have to leave step 4.

**P5 — Trust is a design output.**
Generous whitespace, one accent colour, no stock photos, no countdown timers, no "10,000 people calculated today" badges, no email capture. A visible, honest privacy statement. The user should think "someone careful built this."

---

# PART B — SCREENS

## 5. Information architecture

```
/                    Landing page (full page, scrollable, 6 sections)
/calculator          Wizard shell (steps 1..8) + live preview panel
/result              Result page
/how-it-works        Static page: methodology + full rule reference
/privacy             Static page: privacy statement
```

Routing is client-side. Wizard state lives in memory (React context / Zustand store). Refreshing on `/calculator` restores from `sessionStorage` if present, otherwise returns to step 1 with a toast: "We start fresh each time — your data is never stored on a server."

`/result` is not reachable unless the wizard is complete; a direct visit redirects to `/calculator`.

---

## 6. Landing page

The landing page must feel like a finished product, not a form with a heading. It is a **full-height, scrollable page with six sections**. No blank white void.

### 6.1 Section 1 — Hero (full viewport height)

**Layout:** Two-column on desktop (55% text / 45% visual). Single column on mobile, visual below text.

**Left column:**

- **Eyebrow chip:** `FY 2025-26 · AY 2026-27 · Updated for Budget 2025`
- **H1:** `Find out which tax regime saves you more money.`
- **Sub-headline:** `Old regime or new regime — most salaried people are guessing. Answer a few simple questions about your salary and we'll show you the exact difference, in rupees.`
- **Reassurance line, directly under the sub-headline, with a lock icon:** `Start with what lands in your bank account. No CTC needed. Nothing leaves your browser.`
- **Primary CTA button:** `Calculate my tax — it's free` → `/calculator`
- **Secondary text link:** `See how we calculate it` → `/how-it-works`
- **Trust row (three small items with icons, horizontally arranged):**
  - `Takes about 3 minutes`
  - `No sign-up, no email`
  - `Runs entirely on your device`

**Right column — the confidence preview.**
This is the single most important element on the landing page. It is a **static, non-interactive mock of the actual result card**, rendered with realistic sample data and a small caption. It answers the user's silent question: *"what am I going to get at the end of this?"*

The mock shows:

```
┌──────────────────────────────────────────────┐
│  ● Sample result                             │
│                                              │
│  Pick the NEW REGIME                         │
│  You save ₹34,320 this year                  │
│  (about ₹2,860 every month)                  │
│                                              │
│  ┌───────────────┐  ┌───────────────┐        │
│  │ NEW REGIME    │  │ OLD REGIME    │        │
│  │ ₹97,500       │  │ ₹1,31,820     │        │
│  │ ✓ Lower       │  │               │        │
│  └───────────────┘  └───────────────┘        │
│                                              │
│  Based on ₹15,00,000 salary, ₹25,000/mo      │
│  rent in a metro city, ₹1.5L in 80C.         │
└──────────────────────────────────────────────┘
```

Caption under the mock, in small muted text: `This is an example. Your numbers will replace these.`

The card should be lightly tilted (2–3 degrees) or given a soft layered shadow so it reads as a product artefact, not a table.

### 6.2 Section 2 — "Why this is hard" (the problem)

Three columns, each with a simple line icon, a short heading, and two lines of copy.

| Heading | Copy |
|---|---|
| `Every calculator asks for your CTC` | `And almost nobody knows their CTC by heart. You know your salary credit. We start there and work backwards.` |
| `Tax forms don't speak human` | `"Enter your 80C deductions" is not a question. "Do you put money in PPF or ELSS?" is. We ask the second kind.` |
| `A number without a reason is useless` | `We show you the slab-by-slab maths for both regimes and explain what each of your answers actually did.` |

### 6.3 Section 3 — How it works (3 steps)

A horizontal three-step strip with connecting line.

1. **Tell us your salary** — `Start with the amount that hits your bank account each month. We figure out the rest.`
2. **Answer a few simple questions** — `Rent, PF, insurance, investments. One topic at a time, with help on every screen.`
3. **Get your answer** — `A clear verdict, the full breakdown, and specific ideas to pay less next year.`

### 6.4 Section 4 — What we cover

Two columns: **"We handle"** (green check marks) and **"We don't handle"** (neutral dashes). Being open about limits builds more trust than pretending to cover everything.

**We handle:**
- Both regimes with FY 2025-26 slabs
- Rent and HRA
- PF, PPF, ELSS, life insurance, tuition fees, home loan principal
- Health insurance for you and your parents
- Home loan interest on the house you live in
- NPS — yours and your employer's
- Savings account and fixed deposit interest
- Senior and super senior citizen rates
- The ₹12 lakh rebate and marginal relief

**We don't handle:**
- Income above ₹50 lakh (surcharge kicks in)
- Capital gains — shares, mutual funds, property, crypto
- Freelance or business income
- Rental income from a second property
- Non-resident (NRI) taxation

### 6.5 Section 5 — Privacy, stated plainly

A single wide panel with a lock icon.

**Heading:** `Your salary never leaves this browser.`

**Body:** `There is no server. There is no database. There is no account to create. Every calculation on this site runs in JavaScript on your own device. We do not use analytics, we do not use cookies for tracking, and we could not see your numbers even if we wanted to. Close the tab and it's gone.`

**Link:** `Read the full privacy note →`

### 6.6 Section 6 — Final CTA + footer

Centred CTA repeat: `Find out which regime saves you more →`

Footer contains:
- `Rules as per the Income-tax Act, 1961 and the Finance Act, 2025, for FY 2025-26 (AY 2026-27).`
- **Mandatory disclaimer** (Section 28.2)
- Links: How it works · Privacy · Last updated `<date>`

---

## 7. Wizard — general behaviour

### 7.1 Layout

**Desktop (≥1024px):** Two columns.
- Left, 58% width: the question card (current step).
- Right, 42% width: the live preview panel, `position: sticky; top: 24px`.

**Tablet (768–1023px):** Single column. The preview panel becomes a **collapsible bar pinned to the bottom** of the viewport, showing the verdict line and current tax figures. Tapping it expands to a full-height sheet.

**Mobile (<768px):** Same as tablet. The pinned bar shows only: `New ₹97,500 · Old ₹1,31,820 · New saves ₹34,320 ▲`.

### 7.2 Progress indicator

At the top of the question card: **eight dots** in a row, plus a text label.

- Completed steps: filled accent dot.
- Current step: filled accent dot with a ring.
- Future steps: hollow grey dot.
- Steps skipped by conditional logic: hollow dot with a small dash inside, and the label "skipped" on hover.

Text label to the right of the dots: `Step 3 of 8 · Rent and HRA`.

Also render a thin progress bar (2px) under the dots at `(currentStep - 1) / 8 * 100%`.

### 7.3 Navigation

- **Back** button (text/ghost style) on every step except step 1. Never loses entered data.
- **Continue** button (primary, right-aligned). Label changes to `See my result →` on step 8.
- Enter key submits the step if valid.
- A `Skip this — doesn't apply to me` ghost link on every optional step, which zeroes all fields on that step and advances.
- Steps are addressable by URL hash (`/calculator#step-4`) to support browser back/forward.

### 7.4 The per-step FAQ (mandatory on every step)

At the bottom of every question card, below the Continue button, separated by a hairline rule:

- Small heading: `Common doubts on this step`
- Three to five items rendered as an **accordion** (`<details>`/`<summary>` or an accessible equivalent). All collapsed by default.
- Each answer: two to four sentences, plain language, no section numbers in the question, section numbers permitted in the answer.

The exact FAQ content for each step is specified in Sections 8.1–8.8. This content is a requirement, not a placeholder.

### 7.5 Input conventions

- All money inputs are **Indian-numbered** with live formatting: `₹1,50,000` (lakh/crore grouping, not thousands grouping).
- Accept paste of `1,50,000`, `150000`, `1.5L`, `1.5 lakh`, `₹150000`. Normalise on blur.
- Each money input has a small live sub-label converting the value: monthly inputs show `= ₹7,20,000 per year`, annual inputs show `= ₹60,000 per month`.
- Numeric keyboard on mobile (`inputmode="numeric"`).
- Quick-fill chips under common inputs, e.g. rent: `₹10,000` `₹15,000` `₹20,000` `₹30,000`.
- Every input has a persistent one-line helper below it, not a tooltip. Tooltips are unusable on touch.
- Errors appear inline, below the field, in red, on blur and on submit — never while the user is mid-typing.
- Empty optional field = zero. Never block on an empty optional field.

---

## 8. Wizard — step by step

### Step map

| # | Internal id | Title | Shown when | Required? |
|---|---|---|---|---|
| 1 | `salary` | Your salary | Always | Yes |
| 2 | `about-you` | About you | Always | Yes |
| 3 | `salary-structure` | Your salary structure | Always | Yes |
| 4 | `rent` | Rent and HRA | Always (fields conditional) | No |
| 5 | `investments` | Savings and investments | Always | No |
| 6 | `health` | Health insurance and medical | Always | No |
| 7 | `home-nps` | Home loan and NPS | Always | No |
| 8 | `other-income` | Interest and other income | Always | No |

---

### 8.1 Step 1 — Your salary

**Card heading:** `Let's start with your salary`
**Card sub-heading:** `Don't worry about CTC or gross salary. We'll work those out ourselves.`

#### Inputs

**1.1 — Monthly in-hand salary** *(required)*
- Label: `How much money lands in your bank account each month?`
- Helper: `The exact amount your salary credit shows. After PF, after tax, after everything.`
- Type: money, monthly
- Sub-label: `= ₹X,XX,XXX per year (before we add back your deductions)`
- Validation: required; integer; min `1,000`; max `50,00,000`
- Warning (not an error) if > `₹4,16,667`/month: `That works out to over ₹50 lakh a year. Above that, an extra charge called surcharge applies, which this calculator doesn't handle. Your result will be understated.` (See 17.4.)

**1.2 — Does your payslip show income tax / TDS being deducted?** *(required, radio)*
- Options: `Yes, and I know the amount` / `Yes, but I don't know the amount` / `No tax is deducted` / `I'm not sure`
- Helper: `On your payslip it's usually called "TDS", "Income Tax" or "IT".`

**1.3 — Monthly tax deducted** *(shown only if 1.2 = "Yes, and I know the amount")*
- Label: `How much tax is deducted each month?`
- Type: money, monthly
- Validation: min `0`; must be `< monthlyInHand × 3` (sanity)

**1.4 — Which regime is your employer using right now?** *(shown only if 1.2 ≠ "No tax is deducted")*
- Options: `New regime` / `Old regime` / `I don't know`
- Default: `I don't know`
- Helper: `If you never submitted investment proofs to HR, it's almost certainly the new regime — that's the default.`
- **Engine use:** this only affects the back-solve for gross salary (Section 12). If `I don't know`, assume New Regime.

**1.5 — Annual bonus, variable pay or incentives** *(optional)*
- Label: `Do you get a bonus or variable pay on top of your monthly salary?`
- Helper: `Enter the total you expect to receive this financial year, before tax. Leave blank if none.`
- Type: money, annual
- Validation: min `0`; max `5,00,00,000`

**1.6 — Other taxable salary money** *(optional, behind a "Add something else" disclosure)*
- Label: `Anything else from your employer that's taxable?`
- Helper: `Joining bonus, retention bonus, notice-pay recovery reversal, taxable reimbursements. Skip if unsure.`
- Type: money, annual

#### Derived and shown immediately in the preview
`Estimated annual gross salary` — computed per Section 12.

#### Step 1 FAQ

| Question | Answer |
|---|---|
| `Why don't you just ask for my CTC?` | `Because most people don't know it, and the ones who do usually quote a number that includes things which aren't even taxable — like the employer's PF share and gratuity. Your bank credit is a number you're certain about, so we start there and add back the deductions we know about.` |
| `My salary changed mid-year. What do I enter?` | `Enter the amount you're receiving now. This calculator assumes the same salary for all twelve months, so if you got a big raise in October the answer will be a rough guide, not an exact figure. If you want to be precise, work out your total gross for the year and divide by twelve.` |
| `I can't find my payslip. Can I still use this?` | `Yes. Choose "I'm not sure" for the tax question and we'll estimate your gross salary by working backwards from your bank credit. The estimate is usually within a few thousand rupees.` |
| `Should I include my bonus in the monthly amount?` | `No. Keep the monthly box for your regular monthly credit only, and put the bonus in the separate bonus box. Bonuses are taxed in the year you receive them, but they don't come every month.` |
| `What if I changed jobs this year?` | `Add up the gross salary from both employers for the full financial year, divide by twelve, and enter that. Also remember that both employers probably each gave you the basic exemption, so your actual tax may be higher than what was deducted.` |

---

### 8.2 Step 2 — About you

**Card heading:** `A few things about you`
**Card sub-heading:** `Your age changes the tax rates in the old regime. Your city changes how much rent benefit you get.`

#### Inputs

**2.1 — Age group** *(required, radio, three cards)*
- Label: `How old will you be on 31 March 2026?`
- Options:
  - `Under 60` (subtitle: `Standard rates`)
  - `60 to 79` (subtitle: `Senior citizen — higher exempt limit in the old regime`)
  - `80 or above` (subtitle: `Super senior citizen — highest exempt limit in the old regime`)
- Default: `Under 60`
- Helper: `If you turn 60 at any point during this financial year, choose "60 to 79".`

**2.2 — City** *(required, radio)*
- Label: `Which city do you live and work in?`
- Options:
  - `Delhi, Mumbai, Kolkata or Chennai`
  - `Any other city`
- Helper: `For the rent benefit, only these four cities count as "metro" for FY 2025-26. Bengaluru, Hyderabad, Pune, Gurugram, Noida, Jaipur and every other city fall in the second group.`
- **Important note for the builder:** From FY 2026-27 the metro list expands to eight cities (adding Bengaluru, Pune, Hyderabad, Ahmedabad). This app is FY 2025-26 only, so it must use the **four-city list**. Many competing calculators get this wrong.

**2.3 — Do you pay professional tax?** *(required, radio)*
- Label: `Does your payslip show a "Professional Tax" or "PT" deduction?`
- Options: `Yes` / `No` / `I'm not sure`
- Helper: `Some states charge it, some don't. Maharashtra, Karnataka, West Bengal, Tamil Nadu, Telangana, Gujarat and Madhya Pradesh do. Delhi, Haryana, Uttar Pradesh, Rajasthan, Punjab and Bihar do not.`

**2.4 — Professional tax amount** *(shown only if 2.3 = Yes)*
- Label: `How much per month?`
- Type: money, monthly
- Default value: `200`
- Validation: min `0`; max `208`; if the annual total would exceed `₹2,500`, cap it silently in the engine and show an info note: `The law caps professional tax at ₹2,500 a year, so we've used ₹2,500.`
- If 2.3 = `I'm not sure`: treat as `₹0` and show the note `We've assumed no professional tax. It's a small amount — at most ₹2,500 a year — so this barely changes the answer.`

#### Step 2 FAQ

| Question | Answer |
|---|---|
| `Why does my age matter?` | `In the old regime, the amount you can earn tax-free before any tax starts depends on age: ₹2.5 lakh under 60, ₹3 lakh from 60 to 79, and ₹5 lakh at 80 and above. The new regime ignores age completely — everyone gets ₹4 lakh.` |
| `I turn 60 in December. Which do I pick?` | `Pick "60 to 79". If you reach 60 at any point during the financial year, you count as a senior citizen for that whole year.` |
| `Why is Bengaluru not a metro?` | `For the rent benefit, the law names only four cities: Delhi, Mumbai, Kolkata and Chennai. It's an old rule and it hasn't caught up with where people actually live. From April 2026 four more cities get added, but that's the next financial year, not this one.` |
| `I live in one city and my office is in another. Which do I choose?` | `Choose the city where you pay the rent. The rent benefit is about the house you actually live in, not the office you report to.` |
| `What is professional tax and why is it on my payslip?` | `It's a small state-level tax on having a job — usually ₹200 a month, capped at ₹2,500 a year. It's deducted by your employer and paid to the state. Under the old regime you can deduct it from your income; under the new regime you cannot.` |

---

### 8.3 Step 3 — Your salary structure

**Card heading:** `How your salary is put together`
**Card sub-heading:** `Two numbers matter here: your basic salary and your PF. We'll help you find both.`

#### Inputs

**3.1 — Does your company deduct PF?** *(required, radio)*
- Label: `Does your company deduct PF (Provident Fund) from your salary?`
- Options: `Yes` / `No` / `I'm not sure`
- Helper: `On your payslip it says "PF", "EPF" or "Provident Fund" on the deductions side.`

**3.2 — Monthly PF deducted from your salary** *(shown if 3.1 = Yes)*
- Label: `How much PF is deducted from your salary each month?`
- Helper: `Just your share, not the company's. If your payslip shows two PF lines, use the one in the deductions column.`
- Type: money, monthly
- Validation: min `0`; max `1,00,000`
- **Special behaviour:** if the entered value is exactly `1800`, show an info note: `₹1,800 is the standard capped amount. That means your basic salary is at least ₹15,000 a month, but we can't tell exactly how much. Please tell us your basic salary below.` — and force 3.4 to be shown and required.

**3.3 — Do you know your basic salary?** *(required, radio)*
- Label: `Do you know your basic salary?`
- Options: `Yes, I know it` / `No — please estimate it for me`
- Helper: `It's the biggest single line on your payslip, usually 40% to 50% of your gross.`

**3.4 — Monthly basic salary** *(shown if 3.3 = Yes, or if PF = ₹1,800)*
- Label: `What is your monthly basic salary?`
- Helper: `Basic pay plus DA if your payslip shows DA separately.`
- Type: money, monthly
- Validation: required when shown; min `1,000`; must be `≤ monthlyGross` (computed); if it exceeds gross, error: `Your basic can't be more than your total salary. Please check the number.`
- Warning if `basic / gross < 0.25`: `That's an unusually low basic. Double-check it — it affects your rent benefit a lot.`
- Warning if `basic / gross > 0.85`: `That's an unusually high basic. Double-check it.`

**3.5 — Basic salary estimate slider** *(shown if 3.3 = No AND PF is unknown or not exactly ₹1,800)*
- Label: `We'll assume your basic is this share of your salary:`
- Slider: 30% to 60%, default **50%**, step 1%
- Live readout: `50% of ₹1,25,000 = ₹62,500 basic per month`
- Note under the slider: `50% is the most common split in Indian payroll. Change it if you know better. This only affects the old regime, through your rent benefit and PF.`

**3.6 — HRA received** *(shown only if the user answers Yes on step 4.1 — see note)*
> **Builder note:** HRA-received is placed on Step 4 (Rent), not here, because it is only meaningful when rent is being paid. See 8.4.

#### Derivation rules (see Section 11.3 for full pseudocode)

Basic salary is resolved with this priority:
1. **User entered it** (3.4) → use it.
2. **PF is known and NOT exactly ₹1,800** → `basicMonthly = pfMonthly / 0.12`, rounded to nearest ₹10. Show as a derived value with an edit affordance: `We worked out your basic as ₹30,000 from your PF. Not right? Change it.`
3. **Otherwise** → `basicMonthly = grossMonthly × sliderPercent` (default 50%).

Employee PF is resolved as:
1. **User entered it** → use it.
2. **PF = Yes but amount unknown** → `min(basicMonthly × 0.12, 1800)` if the user also says their company caps PF; otherwise `basicMonthly × 0.12`. Ask which via 3.2b below.
3. **PF = No or Not sure** → `0`.

**3.2b — PF capping question** *(shown if 3.1 = Yes and 3.2 left blank)*
- Label: `Roughly how much PF is deducted?`
- Options: `₹1,800 a month (the standard cap)` / `12% of my basic salary` / `I really don't know`
- `I really don't know` → assume `12% of basic`.

#### Step 3 FAQ

| Question | Answer |
|---|---|
| `What is basic salary and why do you need it?` | `Your salary is split into parts — basic, HRA, special allowance and so on. Basic is the foundation. Your PF is 12% of it, and your rent benefit is calculated as a percentage of it. So a higher basic usually means a bigger rent benefit in the old regime.` |
| `Where do I find my basic salary?` | `Open any payslip. On the earnings side, the first and largest line is almost always "Basic" or "Basic Pay". If your payslip shows "DA" or "Dearness Allowance" too, add the two together.` |
| `Why is my PF exactly ₹1,800 every month?` | `The law only requires PF on the first ₹15,000 of basic salary a month. 12% of ₹15,000 is ₹1,800, and many companies stop there. If yours does, your basic is above ₹15,000 but we can't tell how much above — so please type it in.` |
| `Does PF reduce my tax?` | `Your own PF contribution counts towards the ₹1.5 lakh 80C limit in the old regime, so yes, it reduces your old-regime tax. In the new regime it does not help at all. The company's PF share is a separate thing and is generally not taxed.` |
| `My company doesn't deduct PF. Is that a problem?` | `Not for this calculator. PF isn't compulsory for every employer — small companies and some contracts are outside it. It just means you have one less thing counting towards 80C.` |
| `I contribute extra to PF (VPF). Where does that go?` | `Add it to the PF amount here. Voluntary PF counts towards the same ₹1.5 lakh 80C limit as regular PF.` |

---

### 8.4 Step 4 — Rent and HRA

**Card heading:** `Do you pay rent?`
**Card sub-heading:** `Rent can be a big tax saver — but only in the old regime.`

#### Inputs

**4.1 — Do you pay rent?** *(required, radio)*
- Label: `Do you pay rent for the place you live in?`
- Options: `Yes` / `No`
- If `No`: hide 4.2–4.5, show the info panel below, and enable Continue.
  - Info panel: `No rent means no rent benefit — that's fine, it just removes one advantage the old regime had. If you live in a house you own and have a home loan, we'll ask about that in a couple of steps.`

**4.2 — Monthly rent** *(shown if 4.1 = Yes; required)*
- Label: `How much rent do you pay each month?`
- Helper: `The rent you actually pay to your landlord. Don't include maintenance or electricity paid separately.`
- Type: money, monthly
- Quick chips: `₹8,000` `₹12,000` `₹18,000` `₹25,000` `₹35,000`
- Validation: min `0`; max `10,00,000`
- Warning if `annualRent > annualGross`: `Your rent is more than your entire salary. Please check the amount.`

**4.3 — Did you pay rent for the whole year?** *(shown if 4.1 = Yes)*
- Label: `Did you pay this rent for all twelve months?`
- Options: `Yes, all year` / `No, only part of the year`
- If `No`: show a month-count stepper, `How many months?` (1–12, default 12).
- Engine: `annualRent = monthlyRent × monthsPaid`.

**4.4 — Does your salary have an HRA component?** *(shown if 4.1 = Yes; required)*
- Label: `Does your payslip have a line called HRA or House Rent Allowance?`
- Options: `Yes, and I know the amount` / `Yes, but I don't know the amount` / `No, there's no HRA line`
- Helper: `HRA is on the earnings side of your payslip, usually the second-largest line.`

**4.5 — Monthly HRA received** *(shown if 4.4 = "Yes, and I know the amount")*
- Label: `How much HRA do you get each month?`
- Type: money, monthly
- Validation: min `0`; must be `≤ monthlyGross − monthlyBasic`; error text: `HRA plus basic can't be more than your total salary.`

**Handling of "Yes, but I don't know the amount":**
Assume `hraMonthly = basicMonthly × 0.50` if metro, `basicMonthly × 0.40` if non-metro. Show a visible, editable derived line:
`We've assumed your HRA is ₹31,250 a month (50% of your basic). That's the most common setup. Change it →`

**Handling of "No, there's no HRA line":**
- Set `hraReceived = 0`. HRA exemption is therefore `₹0`.
- Show an educational panel (do **not** compute it):
  `Because your salary has no HRA component, the usual rent benefit doesn't apply to you. There's a separate rule called Section 80GG for people in exactly your situation — it can give up to ₹60,000 a year in the old regime, but it has strict conditions and we don't calculate it here. Worth asking a CA about, or asking HR to add an HRA component to your salary structure.`

#### What the preview must show for this step

A dedicated "Rent benefit" block showing all three limbs of the calculation and which one won:

```
Your rent benefit (old regime only)
  1. HRA you receive                    ₹3,00,000
  2. 50% of your basic (metro)          ₹3,75,000
  3. Rent paid − 10% of basic           ₹2,25,000   ← lowest, so this is used
  ──────────────────────────────────────────────
  Tax-free HRA                          ₹2,25,000
  Taxable HRA                             ₹75,000
```

#### Step 4 FAQ

| Question | Answer |
|---|---|
| `How is the rent benefit actually worked out?` | `The law takes three amounts and gives you the smallest one: the HRA you actually receive, 50% of your basic (40% outside the four metro cities), and your rent minus 10% of your basic. Whichever is lowest is the amount that becomes tax-free.` |
| `Why did I get zero rent benefit even though I pay rent?` | `Two common reasons. Either your salary has no HRA component at all, or your rent is less than 10% of your basic salary — in that case the third calculation comes out negative and the benefit is nil.` |
| `Does the rent benefit work in the new regime?` | `No. This is the single biggest thing the old regime has that the new one doesn't. If you pay high rent in a metro city, that's usually what tips the answer towards the old regime.` |
| `I pay rent to my parents. Does that count?` | `Yes, it's allowed if you genuinely pay them and they own the house. But it has to be real — actual bank transfers, and your parents must declare that rent as their own income. A paper arrangement can be rejected.` |
| `Do I need my landlord's PAN?` | `If your rent is more than ₹1,00,000 for the year, your employer will ask for your landlord's PAN before giving you the benefit in your payslip. Without it, you can still claim it while filing your return, but be ready to justify it.` |
| `I live in a company-provided flat. What do I enter?` | `Choose "No" for paying rent. Company accommodation is treated as a perquisite and taxed differently — this calculator doesn't handle that, so your result will be approximate.` |

---

### 8.5 Step 5 — Savings and investments

**Card heading:** `Where do you put your savings?`
**Card sub-heading:** `In the old regime, some savings reduce your tax — up to ₹1.5 lakh a year in total.`

#### The running counter (required UI element)

At the top of this step, a persistent bar:

```
₹1,50,000 limit    [████████████░░░░]  ₹1,12,000 used   ₹38,000 left
```

- Turns amber at 100% and shows: `You've hit the ₹1.5 lakh limit. Anything more won't save you extra tax under this rule.`
- The bar includes the auto-added PF from step 3.

#### Inputs

**5.0 — Auto-included PF (read-only row, shown if PF > 0)**
- Label: `Your PF for the year (added automatically)` — value `₹43,200`
- Helper: `Your PF already counts towards the ₹1.5 lakh limit, so we've included it for you. Don't add it again below.`

**5.1 — Life insurance premiums**
- Label: `Do you pay premiums on any life insurance policy?`
- Helper: `LIC, term insurance, endowment, ULIP — for yourself, your spouse or your children. Health insurance is a different thing and comes on the next step.`
- Type: money, annual

**5.2 — PPF**
- Label: `How much did you put into PPF this year?`
- Helper: `Public Provident Fund — the 15-year government savings account.`
- Type: money, annual
- Validation: warn if `> 1,50,000`: `The PPF limit itself is ₹1.5 lakh a year.`

**5.3 — ELSS / tax-saving mutual funds**
- Label: `Did you invest in ELSS or "tax-saving" mutual funds?`
- Helper: `These are equity mutual funds with a three-year lock-in. Regular SIPs in normal mutual funds do NOT count.`
- Type: money, annual

**5.4 — Children's school or college fees**
- Label: `Do you pay school or college tuition fees for your children?`
- Helper: `Only the tuition portion, for up to two children, at an Indian institution. Bus fees, donations and development fees don't count.`
- Type: money, annual

**5.5 — Five-year tax-saving fixed deposit**
- Label: `Do you have a five-year tax-saving fixed deposit?`
- Helper: `Only FDs specifically labelled "tax-saving" with a five-year lock-in. A normal FD doesn't count.`
- Type: money, annual

**5.6 — Sukanya Samriddhi**
- Label: `Do you contribute to a Sukanya Samriddhi account?`
- Helper: `The government savings scheme for a girl child.`
- Type: money, annual

**5.7 — Home loan principal repaid** *(auto-linked from step 7)*
- Read-only if step 7 has been filled; otherwise shown as an input.
- Label: `Home loan principal repaid this year`
- Helper: `The principal part of your EMI, not the interest. Your bank's provisional interest certificate splits it for you.`

**5.8 — Stamp duty and registration**
- Label: `Did you pay stamp duty or registration charges on a house this year?`
- Helper: `Only in the year you actually bought the property.`
- Type: money, annual

**5.9 — NSC, and anything else**
- Label: `Anything else — NSC, senior citizen savings scheme, post office deposits?`
- Type: money, annual

**5.10 — Your own NPS contribution** *(this feeds 80CCD(1B), not 80C)*
> Placed on Step 7 with the rest of NPS. See 8.7.

#### Step 5 FAQ

| Question | Answer |
|---|---|
| `What is this ₹1.5 lakh limit everyone talks about?` | `It's called Section 80C. The government lets you subtract up to ₹1.5 lakh a year from your income if you put that money into certain approved places — PF, PPF, ELSS, life insurance, children's tuition, home loan principal and a few others. It's a single shared limit, not ₹1.5 lakh per item.` |
| `Do my regular SIPs count?` | `Only if they're in an ELSS fund, which has a three-year lock-in. A SIP in a regular index fund or flexi-cap fund gives you no 80C benefit, even though it's a great way to invest.` |
| `Is my health insurance part of this ₹1.5 lakh?` | `No. Health insurance has its own separate limit and its own rule. We'll ask about it on the very next step.` |
| `I've already crossed ₹1.5 lakh. Should I invest more?` | `Not for tax reasons under this rule — the extra gives you nothing back. There is one separate route: ₹50,000 in NPS sits outside the ₹1.5 lakh limit. We'll ask about that shortly.` |
| `Does any of this help in the new regime?` | `No. The new regime removes all of it. That's the trade — lower rates, but no reward for saving. This is exactly the comparison we're running for you.` |
| `Is the home loan EMI I pay counted here?` | `Only the principal part. The interest part is a separate and usually much bigger benefit, and we'll ask about it in two steps.` |

---

### 8.6 Step 6 — Health insurance and medical

**Card heading:** `Health insurance and medical costs`
**Card sub-heading:** `A separate limit, on top of the ₹1.5 lakh. Old regime only.`

#### Inputs

**6.1 — Health insurance for yourself and your family**
- Label: `How much health insurance premium do you pay for yourself, your spouse and your children?`
- Helper: `The annual premium. If your company provides it free, enter zero — you can only claim what you personally pay.`
- Type: money, annual
- Live cap indicator: `Limit for you: ₹25,000` (or `₹50,000` if age group is 60+)

**6.2 — Health insurance for your parents**
- Label: `Do you pay health insurance premiums for your parents?`
- Type: money, annual

**6.3 — Are your parents 60 or older?** *(shown if 6.2 > 0)*
- Options: `Yes, at least one is 60 or older` / `No, both are under 60`
- Helper: `If either parent is 60 or above, the limit for their premium doubles from ₹25,000 to ₹50,000.`

**6.4 — Preventive health check-ups**
- Label: `Did you pay for any preventive health check-ups?`
- Helper: `Full body check-ups, annual screenings. Up to ₹5,000 counts — but it sits inside the limits above, not on top of them.`
- Type: money, annual
- Validation: warn if `> 5,000`: `Only ₹5,000 of this can be counted.`

**6.5 — Medical expenses for uninsured senior citizen parents** *(shown if 6.3 = Yes and 6.2 = 0)*
- Label: `Did you pay medical bills for a parent aged 60+ who has no health insurance?`
- Helper: `If a senior citizen parent has no policy at all, actual medical spending can be claimed instead, up to ₹50,000.`
- Type: money, annual

**6.6 — Advanced medical deductions** *(collapsed disclosure: "I have a disability or a serious illness in the family")*
- **6.6a — Disability of a dependant (80DD):** radio `None` / `40% to 79% disability — ₹75,000 flat` / `80% or more — ₹1,25,000 flat`
  - Helper: `A flat amount, regardless of what you actually spent. Needs a certificate from a government medical authority.`
- **6.6b — Your own disability (80U):** radio `None` / `40% to 79% — ₹75,000 flat` / `80% or more — ₹1,25,000 flat`
- **6.6c — Treatment of a specified serious illness (80DDB):** money input, annual
  - Helper: `Cancer, kidney failure, certain neurological conditions and a few others, for you or a dependant. Limit is ₹40,000, or ₹1,00,000 if the patient is 60 or older.`
  - Sub-radio: `Is the patient 60 or older?` `Yes` / `No`

#### Step 6 FAQ

| Question | Answer |
|---|---|
| `How much health insurance can I actually claim?` | `₹25,000 for you, your spouse and your children — or ₹50,000 if you yourself are 60 or above. On top of that, another ₹25,000 for your parents, or ₹50,000 if either parent is 60 or above. The biggest possible total is ₹1,00,000.` |
| `My company gives me health insurance. Can I claim it?` | `Only the part you pay for yourself. If the company pays the whole premium, there's nothing for you to claim. If they deduct a "top-up" premium from your salary, that part counts.` |
| `Does the ₹5,000 check-up amount get added on top?` | `No, and this trips up a lot of people. The ₹5,000 sits inside your ₹25,000 or ₹50,000 limit, not above it. It is the only part of this rule you're allowed to pay for in cash.` |
| `Can I pay the premium in cash?` | `No. Insurance premiums must be paid by card, UPI, net banking or cheque to be claimed. Cash is only allowed for the ₹5,000 preventive check-up portion.` |
| `Does health insurance help in the new regime?` | `No. Like everything else on this step, it only works in the old regime.` |
| `What counts as a "serious illness" for the extra deduction?` | `The law names a specific list — including cancer, chronic kidney failure, AIDS, haemophilia, thalassaemia and certain neurological conditions such as Parkinson's and motor neurone disease. You need a prescription from a specialist doctor.` |

---

### 8.7 Step 7 — Home loan and NPS

**Card heading:** `Home loan and pension savings`
**Card sub-heading:** `Two of the biggest levers there are — and they behave very differently in the two regimes.`

#### Part A — Home loan

**7.1 — Do you have a home loan?** *(required, radio)*
- Options: `Yes` / `No`

**7.2 — Do you live in that house?** *(shown if 7.1 = Yes; required)*
- Options: `Yes, I live in it` / `No, it's rented out` / `It's empty / under construction`
- **If `No, it's rented out`:** show the out-of-scope notice — `We only handle the home you live in. Rental income and let-out property losses follow different rules, and adding them here would give you a wrong answer. Your result will still be useful, but it won't include this house.` Set all home loan values to zero.
- **If `It's empty / under construction`:** show — `Interest during construction is claimed in five equal instalments starting from the year construction finishes. That's a rule we don't handle here. If construction is done and you've moved in, choose the first option instead.` Set values to zero.

**7.3 — Home loan interest paid this year** *(shown if 7.2 = "Yes, I live in it")*
- Label: `How much interest did you pay on your home loan this year?`
- Helper: `Interest only, not the whole EMI. Your bank gives you a "provisional interest certificate" every year that shows this exact number.`
- Type: money, annual
- Live cap indicator: `Limit: ₹2,00,000` — turns amber when exceeded, with `Anything above ₹2 lakh doesn't reduce your tax further.`

**7.4 — Home loan principal repaid this year** *(shown if 7.2 = "Yes, I live in it")*
- Label: `And how much principal did you repay?`
- Helper: `The same certificate shows this. It counts towards the ₹1.5 lakh limit from step 5.`
- Type: money, annual
- Shows a live link back: `This adds to your 80C total — you're now at ₹1,42,000 of ₹1,50,000.`

#### Part B — NPS

**7.5 — Do you have an NPS account?** *(required, radio)*
- Options: `Yes` / `No` / `What is NPS?`
- `What is NPS?` opens an inline explainer, then re-asks:
  `NPS is the National Pension System — a government retirement account. You pay in during your working years and get a pension later. It has two tax advantages that nothing else has: an extra ₹50,000 deduction outside the ₹1.5 lakh limit in the old regime, and — uniquely — the employer's contribution is deductible in BOTH regimes.`

**7.6 — Your own NPS contribution this year** *(shown if 7.5 = Yes)*
- Label: `How much did you put into NPS yourself?`
- Helper: `Your own money going into your Tier-1 NPS account. Not the company's share — that's the next question.`
- Type: money, annual
- Live indicator: `Up to ₹50,000 of this gets a special extra deduction, outside the ₹1.5 lakh limit.`

**7.7 — Does your employer contribute to your NPS?** *(shown if 7.5 = Yes)*
- Options: `Yes` / `No` / `I'm not sure`
- Helper: `Some companies offer "Corporate NPS". If yours does, it shows up on your payslip as an employer contribution.`

**7.8 — Employer's monthly NPS contribution** *(shown if 7.7 = Yes)*
- Label: `How much does your employer put in each month?`
- Type: money, monthly
- Live indicator, updated live: `Up to 14% of your basic — that's ₹8,750 a month for you — is deductible. And this one works in the new regime too.`

#### The critical explainer panel (must be shown on this step when 7.7 = Yes)

> **Employer NPS is the only deduction that survives in the new regime.**
> When your employer puts money into your NPS, that money is first added to your salary as income, and then subtracted again as a deduction. Up to 14% of your basic salary, the two cancel out and you pay no tax on it. This works in both regimes — it's the one and only way to reduce your tax under the new regime.

#### Step 7 FAQ

| Question | Answer |
|---|---|
| `Where do I find my home loan interest amount?` | `Log in to your bank or housing finance company's website and look for "provisional interest certificate" or "home loan statement". It's a one-page document that splits your year's EMIs into principal and interest. Your employer asks for the same document.` |
| `Why can I only claim ₹2 lakh of interest?` | `That's the cap the law sets for a house you live in yourself. If you paid ₹3 lakh of interest, only ₹2 lakh reduces your income. The cap applies across all the houses you live in, not per house.` |
| `Does my home loan help in the new regime?` | `Not for the home you live in — neither the interest nor the principal. This is often the single biggest reason a home-loan borrower is better off in the old regime.` |
| `What's the difference between the ₹50,000 NPS deduction and the ₹1.5 lakh one?` | `Money you put into NPS yourself can be claimed in two places. The first ₹1.5 lakh shares the crowded 80C limit with your PF and everything else. But there's a special extra ₹50,000 that sits completely outside it — so if your ₹1.5 lakh is already full, NPS is the only way to deduct more.` |
| `Is NPS a good investment or just a tax trick?` | `It's genuinely low-cost and it invests in market instruments, but the money is locked until you turn 60, and at retirement you must use at least 40% of it to buy an annuity. It's a real retirement product with a tax benefit attached, not a short-term saving. Decide on the merits, not only the deduction.` |
| `My employer doesn't offer NPS. Can I ask for it?` | `Yes, and it costs your employer nothing extra if it's carved out of your existing CTC. Many HR teams will do it on request. It's the only deduction left in the new regime, so it's worth asking about.` |

---

### 8.8 Step 8 — Interest and other income

**Card heading:** `Interest and other income`
**Card sub-heading:** `Almost everyone forgets this one. Bank interest is taxable, and the bank has already told the tax department about it.`

#### Inputs

**8.1 — Savings account interest**
- Label: `How much interest did your savings accounts pay you this year?`
- Helper: `Add up every savings account you hold. It's in your bank statement, usually credited every three months. Not your FDs — those come next.`
- Type: money, annual
- Live indicator (age < 60): `Up to ₹10,000 of savings interest is deductible in the old regime.`
- Live indicator (age ≥ 60): `As a senior citizen, up to ₹50,000 of all your interest is deductible in the old regime — savings and FDs together.`

**8.2 — Fixed deposit and recurring deposit interest**
- Label: `And interest from fixed deposits or recurring deposits?`
- Helper: `Interest for the year, even if the FD hasn't matured yet — it's taxed as it accrues, not when you withdraw. Check your Form 26AS or AIS on the income tax website if you're unsure.`
- Type: money, annual
- Live indicator (age < 60): `FD interest is fully taxable. The ₹10,000 savings-interest deduction does not cover FDs — a very common mistake.`

**8.3 — Any other taxable income**
- Label: `Any other income you need to declare?`
- Helper: `Interest on bonds or NSC, family pension, income from a gift. Leave blank if none. Don't include capital gains from shares, mutual funds or property — this calculator can't handle those.`
- Type: money, annual

**8.4 — Donations to charity**
- Label: `Did you donate to a registered charity or relief fund?`
- Helper: `Only donations to institutions registered under Section 80G, with a receipt showing their registration number. Donations above ₹2,000 must be non-cash.`
- Type: money, annual
- Sub-radio: `What kind of donation was it?` → `100% deductible (e.g. PM National Relief Fund)` / `50% deductible (most registered NGOs)` / `I'm not sure`
- `I'm not sure` → treat as **50%**, and show: `We've assumed 50%, which covers most charities. Your receipt will say which category applies.`
- **Engine note:** The 10%-of-adjusted-GTI qualifying limit for certain 80G categories is **out of scope**. Apply only the flat 100% or 50% rate and note this in `/how-it-works`.

**8.5 — Education loan interest**
- Label: `Are you paying interest on an education loan?`
- Helper: `For higher education — yours, your spouse's or your children's. There's no upper limit on this one, and it runs for up to eight years.`
- Type: money, annual

#### Step 8 FAQ

| Question | Answer |
|---|---|
| `The bank already deducted TDS on my FD. Do I still have to declare it?` | `Yes. TDS is usually only 10%, but your FD interest is taxed at your slab rate, which could be 20% or 30%. So TDS is a part payment, not the final settlement. You still declare the full interest and pay any difference.` |
| `Where can I find my total interest for the year?` | `Log in to the income tax website and open your AIS — the Annual Information Statement. It lists interest reported by every bank against your PAN. It's the same data the department has, so it's the safest source.` |
| `What's the difference between savings interest and FD interest?` | `For tax, a lot. If you're under 60, up to ₹10,000 of savings account interest is deductible in the old regime — but FD interest gets nothing. If you're 60 or above, a bigger ₹50,000 deduction covers both together.` |
| `Is PPF interest taxable?` | `No. PPF interest is completely tax-free and you don't declare it here. Same for EPF interest in most cases, and for interest on tax-free bonds.` |
| `Does any of this help in the new regime?` | `The interest itself is taxable in both regimes. But the deductions on it — the ₹10,000 or ₹50,000 — only exist in the old regime.` |
| `I have capital gains from selling shares. What do I do?` | `This calculator doesn't handle capital gains, so your result will understate your tax. The regime comparison will still be roughly right for your salary, but please get the final number from a CA or the income tax portal.` |

---

## 9. The live preview panel

The preview panel is the emotional core of the product. It must recalculate on **every keystroke** (debounced 120ms) and must never show a spinner — the calculation is sub-millisecond.

### 9.1 Behaviour rules

- **Never blank.** From the moment step 1 has a salary figure, the panel is populated. Before that, it shows a ghosted skeleton with the caption `Your numbers will appear here as you answer.`
- **Animate value changes.** When a number changes, tween it over 400ms and briefly highlight the changed row with a background flash. This is the "something is happening" signal the product depends on.
- **Highlight the active section.** The block corresponding to the current wizard step gets a subtle accent left-border, so the user sees which part of the answer they are currently affecting.
- **Rows that are zero stay visible but muted**, with `—` instead of `₹0`. Hiding them makes the panel jump around and destroys the sense of a stable document.
- **Never show a "winner" before step 3 is complete.** Until then, show `Still gathering your details…` in the verdict slot. An early, wrong verdict destroys trust.

### 9.2 Panel structure (top to bottom)

**Block 0 — Verdict strip (sticky at the top of the panel)**
```
NEW REGIME is ahead        saving you ₹34,320
```
- Background tinted with the winning regime's colour.
- When the winner flips as the user types, animate the flip and show a small transient badge: `Changed!`
- If the two are within ₹1,000: `It's basically a tie` with a neutral background.

**Block 1 — Your income**
| Row | Old regime | New regime |
|---|---|---|
| Monthly salary (gross) | ₹1,25,000 | ₹1,25,000 |
| Annual salary | ₹15,00,000 | ₹15,00,000 |
| Bonus / variable | ₹0 | ₹0 |
| Employer NPS added to salary | ₹0 | ₹0 |
| **Gross salary** | **₹15,00,000** | **₹15,00,000** |

Under this block, a small expandable link: `How did you get my gross salary?` → opens a panel showing the back-solve working (Section 12.5).

**Block 2 — Exemptions and salary deductions**
| Row | Old | New |
|---|---|---|
| Less: Tax-free HRA | −₹2,25,000 | Not allowed |
| Less: LTA | −₹0 | Not allowed |
| Less: Standard deduction | −₹50,000 | −₹75,000 |
| Less: Professional tax | −₹2,500 | Not allowed |
| **Income from salary** | **₹12,22,500** | **₹14,25,000** |

Cells reading `Not allowed` are rendered in muted grey with a small strikethrough treatment, so the user can *see* what the new regime takes away.

**Block 3 — Other income and house property**
| Row | Old | New |
|---|---|---|
| Savings interest | ₹0 | ₹0 |
| FD / RD interest | ₹0 | ₹0 |
| Other income | ₹0 | ₹0 |
| Home loan interest (house you live in) | −₹0 | Not allowed |
| **Gross total income** | **₹12,22,500** | **₹14,25,000** |

**Block 4 — Deductions (Chapter VI-A)**
| Row | Old | New |
|---|---|---|
| 80C — PF, PPF, ELSS, insurance, tuition | −₹1,50,000 | Not allowed |
| 80CCD(1B) — your NPS | −₹0 | Not allowed |
| 80CCD(2) — employer's NPS | −₹0 | −₹0 |
| 80D — health insurance | −₹25,000 | Not allowed |
| 80TTA / 80TTB — interest | −₹0 | Not allowed |
| 80E — education loan | −₹0 | Not allowed |
| 80G — donations | −₹0 | Not allowed |
| 80DD / 80DDB / 80U | −₹0 | Not allowed |
| **Total deductions** | **−₹1,75,000** | **−₹0** |

**Block 5 — Taxable income**
```
                       OLD              NEW
Taxable income     ₹10,47,500       ₹14,25,000
```

**Block 6 — Slab-by-slab tables (both regimes, side by side or stacked)**

This block is mandatory and must show every slab, including the ones that produce zero tax.

```
OLD REGIME — Under 60
┌────────────────────────┬──────┬─────────────┬──────────┐
│ Slab                   │ Rate │ Income here │ Tax      │
├────────────────────────┼──────┼─────────────┼──────────┤
│ Up to ₹2,50,000        │  0%  │  ₹2,50,000  │       ₹0 │
│ ₹2,50,001 – ₹5,00,000  │  5%  │  ₹2,50,000  │  ₹12,500 │
│ ₹5,00,001 – ₹10,00,000 │ 20%  │  ₹5,00,000  │ ₹1,00,000│
│ Above ₹10,00,000       │ 30%  │    ₹47,500  │  ₹14,250 │
├────────────────────────┴──────┴─────────────┼──────────┤
│ Tax before rebate                           │₹1,26,750 │
│ Less: Rebate u/s 87A                        │       ₹0 │
│ Health & Education Cess @ 4%                │   ₹5,070 │
│ TOTAL TAX                                   │₹1,31,820 │
└─────────────────────────────────────────────┴──────────┘
```

The New Regime table has the same shape, with extra rows for `Less: Rebate u/s 87A` and, when applicable, `Less: Marginal relief`.

**Block 7 — Bottom line**
```
                         OLD              NEW
Total tax for the year   ₹1,31,820       ₹97,500   ✓ lower
Tax per month            ₹10,985         ₹8,125
Take-home per month      ₹1,10,415       ₹1,13,275
```

**Block 8 — Live nudges (max two at a time)**
Small inline cards that appear as conditions are met, e.g.:
- `₹38,000 of your ₹1.5 lakh limit is still unused.`
- `You're ₹22,000 above the ₹12 lakh line — marginal relief is protecting you here.`
These use the same rule engine as the final suggestions (Section 21), filtered to the top two by rupee value.

### 9.3 Mobile collapsed bar

```
┌────────────────────────────────────────────┐
│ NEW ₹97,500  ·  OLD ₹1,31,820              │
│ New saves ₹34,320                       ⌃  │
└────────────────────────────────────────────┘
```
Tapping opens a full-height sheet containing blocks 1–8, with a close affordance.

---

## 10. Result page

### 10.1 Section 1 — The verdict (above the fold)

A single large card. This is the whole point of the product, so it gets the whole screen width.

```
        Pick the NEW REGIME

        You save ₹34,320 this year
        That's about ₹2,860 every month

   ┌──────────────────┐    ┌──────────────────┐
   │  NEW REGIME      │    │  OLD REGIME      │
   │                  │    │                  │
   │   ₹97,500        │    │   ₹1,31,820      │
   │   for the year    │    │   for the year   │
   │                  │    │                  │
   │  ✓ RECOMMENDED   │    │                  │
   └──────────────────┘    └──────────────────┘

   Based on a gross salary of ₹15,00,000
```

**Copy rules:**
- Heading is always `Pick the OLD REGIME` or `Pick the NEW REGIME` — imperative, no hedging.
- If the difference is **≤ ₹1,000**: heading becomes `It's almost a tie — go with the NEW REGIME`, sub-line: `The difference is only ₹840 a year. The new regime needs no investment proofs and no paperwork, so it's the easier choice.`
- If **both are zero tax**: heading `You pay no tax either way`, sub-line: `Your income is below the taxable limit under both regimes. Pick the new regime — it's the default and needs no paperwork.`
- Never write "may", "might", "could be". The user asked for a decision.

Below the card, a row of secondary actions:
`Change my answers` (returns to step 1 with data intact) · `Start over` (clears everything, with a confirm dialog) · `See how this was calculated` (→ /how-it-works)

### 10.2 Section 2 — Side-by-side comparison

The full comparison table — identical in content to preview blocks 1–5, but rendered at full width with more breathing room, and with a third column showing the **difference**.

| | Old regime | New regime | Difference |
|---|---|---|---|
| Gross salary | ₹15,00,000 | ₹15,00,000 | — |
| Tax-free HRA | ₹2,25,000 | ₹0 | Old is better by ₹2,25,000 |
| Standard deduction | ₹50,000 | ₹75,000 | New is better by ₹25,000 |
| … | | | |
| **Total tax** | **₹1,31,820** | **₹97,500** | **New saves ₹34,320** |

### 10.3 Section 3 — Slab-by-slab breakdown

Both full slab tables, side by side on desktop, stacked with a toggle on mobile. Same format as preview block 6, but with an added narrative line under each:

> *In the old regime, ₹47,500 of your income falls in the 30% bracket. In the new regime, nothing does — the 30% bracket doesn't start until ₹24 lakh.*

### 10.4 Section 4 — "What each of your answers did"

The personalised education section. Full spec in Section 20. Rendered as a vertical list of cards, sorted by absolute rupee impact, largest first.

### 10.5 Section 5 — "What you could do next"

The suggestions section. Full spec in Section 21. Rendered as up to five cards, each with a rupee figure.

### 10.6 Section 6 — Practical next steps

A short, plain checklist tailored to the winning regime.

**If New Regime wins:**
> - You don't need to do anything special. The new regime is the default — if you never tell your employer otherwise, this is what you get.
> - You don't need to collect rent receipts, investment proofs or insurance certificates.
> - You can still change your mind when you file your return in July 2026. Salaried people get to choose fresh every year.

**If Old Regime wins:**
> - Tell your HR or payroll team you want the old regime, ideally at the start of the financial year.
> - Start collecting proofs now: rent receipts and your landlord's PAN if rent is over ₹1 lakh a year, 80C investment statements, insurance premium receipts, and your bank's home loan interest certificate.
> - When you file your return, you'll need to submit Form 10-IEA to choose the old regime. Your filing portal or CA handles this.
> - If your employer has already been deducting tax under the new regime all year, you can still switch when you file — you'll get the extra tax back as a refund.

### 10.7 Section 7 — Disclaimer footer

Full disclaimer text from Section 28.2, always visible, not collapsed.

---

# PART C — THE TAX ENGINE

## 11. Constants (FY 2025-26 / AY 2026-27)

All constants live in one file, `src/lib/tax/constants.ts`, and are `as const`. No magic numbers anywhere else in the codebase.

### 11.1 Slabs

```ts
export const FY = "2025-26";
export const AY = "2026-27";

// Slabs are [upperBound, rate]. Infinity marks the top slab.
export const NEW_REGIME_SLABS = [
  { upTo:   400_000, rate: 0.00 },
  { upTo:   800_000, rate: 0.05 },
  { upTo: 1_200_000, rate: 0.10 },
  { upTo: 1_600_000, rate: 0.15 },
  { upTo: 2_000_000, rate: 0.20 },
  { upTo: 2_400_000, rate: 0.25 },
  { upTo:  Infinity, rate: 0.30 },
] as const;

export const OLD_REGIME_SLABS = {
  below60: [
    { upTo:   250_000, rate: 0.00 },
    { upTo:   500_000, rate: 0.05 },
    { upTo: 1_000_000, rate: 0.20 },
    { upTo:  Infinity, rate: 0.30 },
  ],
  senior: [                    // 60 to 79
    { upTo:   300_000, rate: 0.00 },
    { upTo:   500_000, rate: 0.05 },
    { upTo: 1_000_000, rate: 0.20 },
    { upTo:  Infinity, rate: 0.30 },
  ],
  superSenior: [               // 80 and above
    { upTo:   500_000, rate: 0.00 },
    { upTo: 1_000_000, rate: 0.20 },
    { upTo:  Infinity, rate: 0.30 },
  ],
} as const;
```

**Note:** the New Regime slabs are **identical for all ages**. There is no senior citizen benefit in the new regime. This is a frequent source of bugs.

### 11.2 Every other constant

```ts
export const CESS_RATE = 0.04;                    // Health & Education Cess

export const STD_DEDUCTION_OLD = 50_000;          // s.16(ia)
export const STD_DEDUCTION_NEW = 75_000;          // s.16(ia)

export const PROF_TAX_ANNUAL_CAP = 2_500;         // s.16(iii), Art. 276(2)

export const REBATE_87A_OLD = {
  incomeLimit: 500_000,
  maxRebate:    12_500,
  marginalRelief: false,                          // no marginal relief in old regime
} as const;

export const REBATE_87A_NEW = {
  incomeLimit: 1_200_000,
  maxRebate:     60_000,
  marginalRelief: true,
  marginalReliefThreshold: 1_200_000,
} as const;

export const LIMIT_80C  = 150_000;                // s.80CCE: 80C + 80CCC + 80CCD(1)
export const LIMIT_80CCD_1B = 50_000;             // own NPS, over and above 80CCE
export const RATE_80CCD_1_SALARIED = 0.10;        // own NPS sub-limit within 80CCE
export const RATE_80CCD_2_NEW = 0.14;             // employer NPS, new regime, all employers
export const RATE_80CCD_2_OLD_PRIVATE = 0.10;     // employer NPS, old regime, non-govt
export const RATE_80CCD_2_OLD_GOVT = 0.14;        // employer NPS, old regime, govt

export const LIMIT_80D_SELF_BELOW_60 = 25_000;
export const LIMIT_80D_SELF_60_PLUS  = 50_000;
export const LIMIT_80D_PARENTS_BELOW_60 = 25_000;
export const LIMIT_80D_PARENTS_60_PLUS  = 50_000;
export const LIMIT_80D_PREVENTIVE       =  5_000; // inside the above, not on top

export const LIMIT_80TTA = 10_000;                // savings interest, under 60
export const LIMIT_80TTB = 50_000;                // all deposit interest, 60+

export const LIMIT_24B_SELF_OCCUPIED = 200_000;   // s.24(b)
export const LIMIT_HP_LOSS_SETOFF    = 200_000;   // s.71(3A)

export const LIMIT_80DD_NORMAL   =  75_000;       // 40–79% disability, flat
export const LIMIT_80DD_SEVERE   = 125_000;       // 80%+ disability, flat
export const LIMIT_80U_NORMAL    =  75_000;
export const LIMIT_80U_SEVERE    = 125_000;
export const LIMIT_80DDB_NORMAL  =  40_000;
export const LIMIT_80DDB_SENIOR  = 100_000;

export const HRA_METRO_RATE     = 0.50;
export const HRA_NON_METRO_RATE = 0.40;
export const HRA_RENT_OFFSET    = 0.10;
export const HRA_METRO_CITIES   = ["Delhi", "Mumbai", "Kolkata", "Chennai"] as const;

export const EPF_EMPLOYEE_RATE  = 0.12;
export const EPF_WAGE_CEILING_MONTHLY = 15_000;
export const EPF_CAPPED_MONTHLY = 1_800;          // 12% of 15,000

export const ROUNDING_INCOME = 10;                // s.288A
export const ROUNDING_TAX    = 10;                // s.288B

// Derived, useful for tests and for the "cliff" warning
export const NEW_MARGINAL_RELIEF_BREAKEVEN = 1_270_588; // see §14.4
```

### 11.3 What is allowed in which regime — the master table

This table is the authority. The engine must have a matching lookup so that no deduction is ever silently applied to the wrong regime.

| Item | Section | Old regime | New regime |
|---|---|---|---|
| Standard deduction | 16(ia) | ₹50,000 | ₹75,000 |
| Professional tax | 16(iii) | Actual, max ₹2,500 | **Not allowed** |
| HRA exemption | 10(13A) + Rule 2A | Allowed | **Not allowed** |
| LTA exemption | 10(5) | Allowed | **Not allowed** |
| Family pension deduction | 57(iia) | ⅓ or ₹15,000, lower | ⅓ or ₹25,000, lower |
| Home loan interest, self-occupied | 24(b) | Up to ₹2,00,000 | **Not allowed** |
| Home loan interest, let-out | 24(b) | Allowed, loss set-off ≤ ₹2L | Allowed vs rent only, **no set-off vs salary** *(out of scope)* |
| 80C basket | 80C / 80CCE | ₹1,50,000 | **Not allowed** |
| Own NPS, within 80CCE | 80CCD(1) | Within ₹1.5L | **Not allowed** |
| Own NPS, extra | 80CCD(1B) | ₹50,000 | **Not allowed** |
| **Employer NPS** | **80CCD(2)** | **10% of basic+DA (private) / 14% (govt)** | **14% of basic+DA — ALLOWED** |
| Agniveer Corpus | 80CCH | Allowed | Allowed *(out of scope)* |
| Health insurance | 80D | Up to ₹1,00,000 | **Not allowed** |
| Disabled dependant | 80DD | ₹75,000 / ₹1,25,000 | **Not allowed** |
| Specified illness | 80DDB | ₹40,000 / ₹1,00,000 | **Not allowed** |
| Education loan interest | 80E | Unlimited, 8 years | **Not allowed** |
| Donations | 80G | 50% / 100% | **Not allowed** |
| Savings interest | 80TTA | ₹10,000 | **Not allowed** |
| Senior deposit interest | 80TTB | ₹50,000 | **Not allowed** |
| Own disability | 80U | ₹75,000 / ₹1,25,000 | **Not allowed** |
| Rebate | 87A | ₹12,500 if TI ≤ ₹5L | ₹60,000 if TI ≤ ₹12L + marginal relief |
| Age-based exemption limit | — | Yes (₹2.5L / ₹3L / ₹5L) | **No — ₹4L for everyone** |

---

## 12. Working backwards from take-home pay

This is the product's defining feature and the trickiest piece of engineering in it. Read this section twice before implementing.

### 12.1 The relationship

For a salaried person:

```
monthlyInHand = monthlyGross
              − monthlyEmployeePF
              − monthlyProfessionalTax
              − monthlyTDS
```

So:

```
annualGross = 12 × (monthlyInHand + monthlyEmployeePF + monthlyProfessionalTax)
            + annualTDS
            + annualBonus
            + otherTaxableSalary
```

### 12.2 The circularity problem

If the user knows their TDS, this is simple arithmetic — one line of code, done.

If they don't, we have a circular dependency: **gross depends on tax, and tax depends on gross.** We solve it numerically.

Define, for a candidate annual gross `G`:

```
f(G) = G − annualEmployeePF(G) − annualProfessionalTax − annualTax(G) − 12 × monthlyInHand − annualBonus − otherSalary
```

We need the `G` where `f(G) = 0`.

### 12.3 Why naive bisection is not enough

`f` is *almost* monotonically increasing, because the marginal tax rate is never above 30% (plus cess = 31.2%), so `df/dG ≈ 1 − 0.312 > 0`.

**But there is one region where it breaks: the marginal relief band in the new regime.**

Between a total income of ₹12,00,000 and roughly ₹12,70,588, marginal relief caps the tax at exactly `(totalIncome − 12,00,000)`. Inside that band:

- `dTax/dG = 1.04` (the excess, plus 4% cess on it)
- therefore `df/dG = 1 − 1.04 = −0.04`

`f` is **slightly decreasing** in that band. Economically this is real: in that band, a rise in gross salary produces a *tiny fall* in take-home pay. So there can be up to three values of `G` for one take-home figure.

The band is narrow — roughly ₹70,600 of gross salary, mapping to about ₹2,800 of take-home — but a naive `while (lo < hi)` bisection can land anywhere in it or fail to converge.

### 12.4 The required algorithm

```ts
function solveGrossFromInHand(input: SolverInput): SolverResult {
  const base = 12 * (input.monthlyInHand + input.monthlyProfTax)
             + input.annualBonus + input.otherSalary;

  // 1. Bracket. Lower bound: gross can never be below what already lands in hand.
  //    Upper bound: even at the top marginal rate, gross < base / (1 - 0.312) * 1.5.
  const lo = base;
  const hi = base * 2.2 + 500_000;

  // 2. Coarse scan in ₹500 steps to find every sign change.
  const STEP = 500;
  const roots: number[] = [];
  let prevG = lo, prevF = f(lo);
  for (let G = lo + STEP; G <= hi; G += STEP) {
    const curF = f(G);
    if (prevF === 0) roots.push(prevG);
    else if (Math.sign(prevF) !== Math.sign(curF)) {
      roots.push(bisect(prevG, G, 60));   // refine to ±₹1
    }
    prevG = G; prevF = curF;
  }

  // 3. If multiple roots, take the SMALLEST. It is the conservative,
  //    most-likely-true answer, and it is the one below the relief band.
  if (roots.length === 0) return { ok: false, reason: "NO_SOLUTION" };

  const gross = Math.round(roots[0] / 10) * 10;
  return {
    ok: true,
    annualGross: gross,
    ambiguous: roots.length > 1,
    ambiguityRange: roots.length > 1 ? [roots[0], roots[roots.length - 1]] : null,
  };
}
```

Where `f(G)` internally recomputes employee PF from `G` (via the basic-salary rule of Section 11.3 / 13.1) and computes tax under the regime the user said their employer is using (defaulting to New Regime).

**Iteration cap:** the coarse scan is bounded by `(hi − lo) / 500`, which for any input inside our validation range is under 20,000 iterations of a sub-microsecond function. This runs in well under 10ms. Do not attempt to optimise it prematurely.

**If `ambiguous === true`,** show this note under the derived gross figure:
> `Your take-home lands in an unusual zone where a small pay rise wouldn't increase your take-home at all. We've used the lower of the two possible salaries: ₹12,45,600. If your actual gross is different, enter your monthly TDS on step 1 for an exact answer.`

**If `ok === false`,** fall back to `annualGross = base` and show:
> `We couldn't work backwards reliably from that number. We've used ₹X as your gross salary. For an exact result, please enter your monthly TDS amount.`

### 12.5 The "How did you get my gross salary?" panel

Because the whole product rests on this derivation, the user must be able to inspect it. The expandable panel shows:

```
Working out your gross salary

  What lands in your bank                ₹1,00,000 × 12  =  ₹12,00,000
  Add back: your PF                        ₹3,600 × 12  =     ₹43,200
  Add back: professional tax                 ₹200 × 12  =      ₹2,400
  Add back: income tax deducted                            +   ₹52,000
  Add: annual bonus                                        +        ₹0
  ────────────────────────────────────────────────────────────────────
  Your gross salary for the year                            ₹12,97,600

  We worked out the tax figure ourselves, assuming your employer is
  using the new regime. If your payslip shows a different TDS amount,
  go back to step 1 and enter it — it'll make this exact.
```

### 12.6 When the user knows their TDS

No solver. Direct arithmetic:
```
annualGross = 12 × (inHand + employeePF + profTax + monthlyTDS) + bonus + otherSalary
```
Mark the result as `derivation: "exact"` and show a small green tick next to the gross figure in the preview.

---

## 13. Component calculations

Each of these is a pure function. Each is separately unit-tested.

### 13.1 Basic salary and employee PF

```ts
function resolveBasicMonthly(i: Inputs, grossMonthly: number): { value: number; source: string } {
  if (i.basicKnown && i.basicMonthly > 0)
    return { value: i.basicMonthly, source: "user" };

  if (i.pfDeducted && i.pfMonthly > 0 && i.pfMonthly !== 1800)
    return { value: round10(i.pfMonthly / EPF_EMPLOYEE_RATE), source: "derivedFromPF" };

  return { value: grossMonthly * i.basicSharePercent, source: "estimated" }; // default 0.50
}

function resolveEmployeePFAnnual(i: Inputs, basicMonthly: number): number {
  if (!i.pfDeducted) return 0;
  if (i.pfMonthly > 0) return i.pfMonthly * 12;
  if (i.pfCappedAtCeiling)
    return Math.min(basicMonthly, EPF_WAGE_CEILING_MONTHLY) * EPF_EMPLOYEE_RATE * 12;
  return basicMonthly * EPF_EMPLOYEE_RATE * 12;
}
```

**Guardrail:** `basicMonthly` must be clamped to `≤ grossMonthly`. If the derivation produces a value above gross (possible when a user types a wrong PF figure), clamp and set a `warnings` flag.

### 13.2 HRA exemption — Section 10(13A) read with Rule 2A

```ts
function hraExemption(a: {
  hraReceivedAnnual: number;
  basicPlusDaAnnual: number;
  rentPaidAnnual: number;
  isMetro: boolean;
}): { exempt: number; limbs: [number, number, number]; winningLimb: 1 | 2 | 3 } {

  if (a.hraReceivedAnnual <= 0 || a.rentPaidAnnual <= 0) {
    return { exempt: 0, limbs: [a.hraReceivedAnnual, 0, 0], winningLimb: 1 };
  }

  const limb1 = a.hraReceivedAnnual;
  const limb2 = a.basicPlusDaAnnual * (a.isMetro ? HRA_METRO_RATE : HRA_NON_METRO_RATE);
  const limb3 = a.rentPaidAnnual - (a.basicPlusDaAnnual * HRA_RENT_OFFSET);

  const exempt = Math.max(0, Math.min(limb1, limb2, limb3));
  ...
}
```

**Rules the implementation must honour:**
- `limb3` can be negative. Clamp the final exemption at zero, but **display the negative limb3 in the preview** so the user understands *why* they got nothing.
- `basicPlusDA` here means basic + DA forming part of retirement benefits + commission at a fixed percentage of turnover. This app treats it as simply `basic` (plus DA if the user included it), and says so on screen.
- Metro is the **four-city list only** for FY 2025-26.
- Old regime only. In the new regime this function is never called; the exemption is hard-zero.
- Taxable HRA = `hraReceivedAnnual − exempt`, displayed but not separately added (it is already inside gross salary).

### 13.3 Income from salary

```ts
function incomeFromSalary(regime: Regime, x: Computed): number {
  const grossSalary = x.annualGross;           // includes bonus, other salary, employer NPS
  const exemptions  = regime === "old" ? x.hraExempt + x.ltaExempt : 0;
  const afterExempt = Math.max(0, grossSalary - exemptions);

  const stdCap  = regime === "old" ? STD_DEDUCTION_OLD : STD_DEDUCTION_NEW;
  const std     = Math.min(stdCap, afterExempt);        // cannot exceed salary — edge case E5

  const profTax = regime === "old"
    ? Math.min(x.professionalTaxAnnual, PROF_TAX_ANNUAL_CAP)
    : 0;

  return Math.max(0, afterExempt - std - profTax);
}
```

### 13.4 Income from house property (self-occupied only)

```ts
function houseProperty(regime: Regime, x: Computed): number {
  if (!x.hasHomeLoan || x.propertyUse !== "selfOccupied") return 0;
  if (regime === "new") return 0;                       // s.115BAC bars it entirely

  const interest = Math.min(x.homeLoanInterestAnnual, LIMIT_24B_SELF_OCCUPIED);
  return -Math.min(interest, LIMIT_HP_LOSS_SETOFF);     // negative = a loss
}
```
Because both caps are ₹2,00,000, the s.71(3A) cap never binds separately in the in-scope cases — but keep it explicit, so the code stays correct if a let-out case is added later.

### 13.5 Income from other sources

```ts
function otherSources(x: Computed): number {
  return x.savingsInterest + x.fdInterest + x.otherIncome;
}
```
Identical in both regimes. The *deductions* on it differ, not the income.

### 13.6 Chapter VI-A deductions — old regime

```ts
function chapterVIA_Old(x: Computed, gti: number): DeductionBreakdown {

  // --- 80CCE basket: 80C + 80CCC + 80CCD(1), one shared ₹1.5L cap ---
  const raw80C =
      x.employeePFAnnual
    + x.lifeInsurance + x.ppf + x.elss + x.tuitionFees
    + x.taxSavingFD + x.sukanya + x.nscOther
    + x.homeLoanPrincipal + x.stampDuty;

  // Own NPS: allocate to 80CCD(1B) FIRST (it is the scarcer, non-shared slot),
  // then spill the remainder into the 80CCE basket. This ordering always yields
  // the maximum legal deduction. See edge case E12.
  const ded80CCD1B = Math.min(x.ownNPS, LIMIT_80CCD_1B);
  const nspill     = x.ownNPS - ded80CCD1B;
  const cap80CCD1  = x.basicPlusDaAnnual * RATE_80CCD_1_SALARIED;
  const ded80CCD1  = Math.min(nspill, cap80CCD1);

  const ded80CCE = Math.min(LIMIT_80C, raw80C + ded80CCD1);

  // --- 80CCD(2): employer NPS ---
  const rate80CCD2 = x.isGovtEmployee ? RATE_80CCD_2_OLD_GOVT : RATE_80CCD_2_OLD_PRIVATE;
  const ded80CCD2  = Math.min(x.employerNPSAnnual, x.basicPlusDaAnnual * rate80CCD2);

  // --- 80D ---
  const capSelf    = x.ageBand === "below60" ? LIMIT_80D_SELF_BELOW_60 : LIMIT_80D_SELF_60_PLUS;
  const capParents = x.parentsAreSenior ? LIMIT_80D_PARENTS_60_PLUS : LIMIT_80D_PARENTS_BELOW_60;
  const preventive = Math.min(x.preventiveCheckup, LIMIT_80D_PREVENTIVE);
  // preventive sits INSIDE the caps — apportion it to the self bucket first
  const selfSide    = Math.min(capSelf,    x.healthPremiumSelf + preventive);
  const parentsSide = Math.min(capParents, x.healthPremiumParents + x.parentsMedicalExpenditure);
  const ded80D      = selfSide + parentsSide;

  // --- 80TTA / 80TTB (mutually exclusive) ---
  const ded80TT = x.ageBand === "below60"
    ? Math.min(x.savingsInterest, LIMIT_80TTA)
    : Math.min(x.savingsInterest + x.fdInterest, LIMIT_80TTB);

  // --- flat-amount deductions ---
  const ded80DD  = x.disabilityDependant === "severe" ? LIMIT_80DD_SEVERE
                 : x.disabilityDependant === "normal" ? LIMIT_80DD_NORMAL : 0;
  const ded80U   = x.disabilitySelf === "severe" ? LIMIT_80U_SEVERE
                 : x.disabilitySelf === "normal" ? LIMIT_80U_NORMAL : 0;
  const ded80DDB = Math.min(x.specifiedIllnessSpend,
                     x.illnessPatientIsSenior ? LIMIT_80DDB_SENIOR : LIMIT_80DDB_NORMAL);

  const ded80E = x.educationLoanInterest;                  // no cap
  const ded80G = x.donations * (x.donationRate ?? 0.50);   // qualifying-limit test out of scope

  const total = ded80CCE + ded80CCD1B + ded80CCD2 + ded80D + ded80TT
              + ded80DD + ded80U + ded80DDB + ded80E + ded80G;

  // s.80A(2): total Chapter VI-A can never exceed gross total income
  return { ...breakdown, total: Math.min(total, Math.max(0, gti)) };
}
```

### 13.7 Chapter VI-A deductions — new regime

```ts
function chapterVIA_New(x: Computed, gti: number): DeductionBreakdown {
  const ded80CCD2 = Math.min(
    x.employerNPSAnnual,
    x.basicPlusDaAnnual * RATE_80CCD_2_NEW      // 14% for every employer type
  );
  return { ded80CCD2, total: Math.min(ded80CCD2, Math.max(0, gti)) };
}
```

Nothing else. Not 80C, not 80D, not 80TTA, not 80E, not 80G. If a future contributor adds one, the golden tests in Section 18 must fail.

### 13.8 Employer NPS is income *and* a deduction

A trap worth spelling out. When the employer contributes to NPS:

1. The contribution is **part of gross salary** (it is a payment made on the employee's behalf). It must be **added** to `annualGross`.
2. It is then **deducted** under 80CCD(2), up to the cap.

Net effect within the cap: zero tax. Above the cap: the excess is taxed. The engine must do **both** steps. Doing only the deduction understates tax; doing only the addition overstates it.

```ts
annualGross = baseGross + employerNPSAnnual;
```

Employer **PF** is treated differently and is **not** added: it is exempt within the statutory limits, and the ₹7.5 lakh combined perquisite threshold is out of scope (Section 3.2).

### 13.9 Slab tax

```ts
function slabTax(taxableIncome: number, slabs: Slab[]): SlabRow[] {
  const rows: SlabRow[] = [];
  let lower = 0;
  for (const s of slabs) {
    const upper = Math.min(taxableIncome, s.upTo);
    const inThisSlab = Math.max(0, upper - lower);
    rows.push({
      from: lower, to: s.upTo, rate: s.rate,
      incomeInSlab: inThisSlab,
      taxInSlab: inThisSlab * s.rate,
    });
    lower = s.upTo;
    if (lower >= taxableIncome) {
      // keep pushing remaining slabs with zeros so the UI table is complete
    }
  }
  return rows;
}
```
**UI requirement:** always render *every* slab row, including the ones with zero income. Users need to see the shape of the whole ladder, not just the parts they reached.

### 13.10 Rebate and marginal relief

```ts
function applyRebate(regime: Regime, totalIncome: number, taxBeforeRebate: number) {
  if (regime === "old") {
    const rebate = totalIncome <= REBATE_87A_OLD.incomeLimit
      ? Math.min(taxBeforeRebate, REBATE_87A_OLD.maxRebate)
      : 0;
    return { rebate, marginalRelief: 0, taxAfter: taxBeforeRebate - rebate };
  }

  // NEW REGIME
  if (totalIncome <= REBATE_87A_NEW.incomeLimit) {
    const rebate = Math.min(taxBeforeRebate, REBATE_87A_NEW.maxRebate);
    return { rebate, marginalRelief: 0, taxAfter: taxBeforeRebate - rebate };
  }

  // Above ₹12,00,000 → no rebate, but marginal relief may apply.
  const excess = totalIncome - REBATE_87A_NEW.marginalReliefThreshold;
  const relief = Math.max(0, taxBeforeRebate - excess);
  return { rebate: 0, marginalRelief: relief, taxAfter: taxBeforeRebate - relief };
}
```

**Three points the implementation must get right:**

1. **There is no marginal relief in the old regime.** Old-regime 87A is strictly all-or-nothing at ₹5,00,000. At a total income of ₹5,00,000 the tax is nil; at ₹5,00,010 it is ₹13,000 including cess. That cliff is real and the app should warn about it (Section 21, rule S9), but the engine must not invent relief that the law does not give.

2. **Marginal relief is computed on tax *before* cess.** Cess is then charged at 4% on the relieved figure. This matches the Income Tax Department's return utility. So at a total income of ₹12,50,000: slab tax ₹67,500 → relief ₹17,500 → tax ₹50,000 → cess ₹2,000 → **₹52,000**.

3. **The break-even.** Relief applies while `60,000 + 0.15e > e`, i.e. while `e < 70,588.24`. So marginal relief is live for a total income from just above ₹12,00,000 up to about **₹12,70,588**. Above that, full tax applies. Store this as `NEW_MARGINAL_RELIEF_BREAKEVEN`.

### 13.11 Cess and final rounding

```ts
const cess = taxAfterRebate * CESS_RATE;
const totalTax = roundToNearest(taxAfterRebate + cess, ROUNDING_TAX);
```

And, before computing tax at all:
```ts
const totalIncome = roundToNearest(grossTotalIncome - chapterVIA, ROUNDING_INCOME);
```

`roundToNearest(x, 10)` uses standard half-up rounding: `Math.round(x / 10) * 10`.

---

## 14. The full computation, end to end

```ts
export function computeTax(regime: Regime, x: Computed): TaxResult {

  // 1 — SALARY
  const grossSalary  = x.annualGross;                 // already includes employer NPS
  const hraExempt    = regime === "old" ? x.hraExempt : 0;
  const ltaExempt    = regime === "old" ? x.ltaExempt : 0;
  const afterExempt  = Math.max(0, grossSalary - hraExempt - ltaExempt);
  const stdDeduction = Math.min(regime === "old" ? STD_DEDUCTION_OLD : STD_DEDUCTION_NEW,
                                afterExempt);
  const profTax      = regime === "old"
                       ? Math.min(x.professionalTaxAnnual, PROF_TAX_ANNUAL_CAP) : 0;
  const salaryIncome = Math.max(0, afterExempt - stdDeduction - profTax);

  // 2 — HOUSE PROPERTY  (negative number = loss)
  const houseIncome  = houseProperty(regime, x);

  // 3 — OTHER SOURCES
  const otherIncome  = otherSources(x);

  // 4 — GROSS TOTAL INCOME
  const gti = Math.max(0, salaryIncome + houseIncome + otherIncome);

  // 5 — CHAPTER VI-A
  const ded = regime === "old" ? chapterVIA_Old(x, gti) : chapterVIA_New(x, gti);

  // 6 — TOTAL INCOME, rounded per s.288A
  const totalIncome = Math.max(0, roundToNearest(gti - ded.total, ROUNDING_INCOME));

  // 7 — SLAB TAX
  const slabs = regime === "new"
    ? NEW_REGIME_SLABS
    : OLD_REGIME_SLABS[x.ageBand];                    // age matters in OLD only
  const slabRows       = slabTax(totalIncome, slabs);
  const taxBeforeRebate = slabRows.reduce((s, r) => s + r.taxInSlab, 0);

  // 8 — REBATE / MARGINAL RELIEF
  const { rebate, marginalRelief, taxAfter } =
        applyRebate(regime, totalIncome, taxBeforeRebate);

  // 9 — CESS
  const cess = Math.max(0, taxAfter) * CESS_RATE;

  // 10 — FINAL, rounded per s.288B
  const totalTax = roundToNearest(Math.max(0, taxAfter) + cess, ROUNDING_TAX);

  return { regime, grossSalary, hraExempt, ltaExempt, stdDeduction, profTax,
           salaryIncome, houseIncome, otherIncome, gti, deductions: ded,
           totalIncome, slabRows, taxBeforeRebate, rebate, marginalRelief,
           cess, totalTax,
           monthlyTax: Math.round(totalTax / 12),
           monthlyTakeHome: Math.round((grossSalary - x.employeePFAnnual
                              - x.professionalTaxAnnual - totalTax) / 12) };
}
```

### 14.1 Choosing the winner

```ts
function pickWinner(oldR: TaxResult, newR: TaxResult) {
  const diff = oldR.totalTax - newR.totalTax;
  if (Math.abs(diff) <= 1000)
    return { winner: "new", saving: Math.abs(diff), verdict: "tie" };  // ties go to NEW
  return diff > 0
    ? { winner: "new", saving:  diff, verdict: "clear" }
    : { winner: "old", saving: -diff, verdict: "clear" };
}
```

**Why ties go to the New Regime:** it is the statutory default, it requires no Form 10-IEA, and it needs no proofs, receipts or documentation. When the money is the same, less work wins. State this reasoning in the UI — do not just silently pick one.

---

## 15. Data model

```ts
type AgeBand   = "below60" | "senior" | "superSenior";
type Regime    = "old" | "new";
type Disability = "none" | "normal" | "severe";
type PropertyUse = "selfOccupied" | "letOut" | "underConstruction";

interface WizardInputs {
  // Step 1
  monthlyInHand: number;
  tdsKnowledge: "known" | "unknownAmount" | "none" | "unsure";
  monthlyTDS: number;
  employerRegime: Regime | "unknown";
  annualBonus: number;
  otherTaxableSalary: number;

  // Step 2
  ageBand: AgeBand;
  isMetro: boolean;
  paysProfessionalTax: boolean | "unsure";
  professionalTaxMonthly: number;

  // Step 3
  pfDeducted: boolean | "unsure";
  pfMonthly: number | null;
  pfCappedAtCeiling: boolean | null;
  basicKnown: boolean;
  basicMonthly: number | null;
  basicSharePercent: number;          // 0.30 – 0.60, default 0.50

  // Step 4
  paysRent: boolean;
  monthlyRent: number;
  monthsRentPaid: number;             // 1–12
  hasHRAComponent: "yesKnown" | "yesUnknown" | "no";
  monthlyHRA: number | null;
  ltaClaimed: number;

  // Step 5
  lifeInsurance: number; ppf: number; elss: number; tuitionFees: number;
  taxSavingFD: number; sukanya: number; nscOther: number; stampDuty: number;

  // Step 6
  healthPremiumSelf: number; healthPremiumParents: number;
  parentsAreSenior: boolean; preventiveCheckup: number;
  parentsMedicalExpenditure: number;
  disabilityDependant: Disability; disabilitySelf: Disability;
  specifiedIllnessSpend: number; illnessPatientIsSenior: boolean;

  // Step 7
  hasHomeLoan: boolean; propertyUse: PropertyUse;
  homeLoanInterestAnnual: number; homeLoanPrincipal: number;
  hasNPS: boolean; ownNPS: number;
  employerContributesNPS: boolean | "unsure"; employerNPSMonthly: number;
  isGovtEmployee: boolean;            // default false

  // Step 8
  savingsInterest: number; fdInterest: number; otherIncome: number;
  donations: number; donationRate: 1.0 | 0.5 | null;
  educationLoanInterest: number;
}

interface Computed extends WizardInputs {
  basicMonthlyResolved: number;
  basicSource: "user" | "derivedFromPF" | "estimated";
  basicPlusDaAnnual: number;
  employeePFAnnual: number;
  employerNPSAnnual: number;
  professionalTaxAnnual: number;
  annualRent: number;
  hraReceivedAnnual: number;
  hraExempt: number; hraLimbs: [number, number, number]; hraWinningLimb: 1|2|3;
  annualGross: number;
  grossDerivation: "exact" | "solved" | "fallback";
  grossAmbiguous: boolean;
  warnings: WarningCode[];
}
```

**Store rules:**
- One immutable `WizardInputs` object in the store.
- `Computed` is derived through a single memoised selector. Never mutate.
- `computeTax("old", computed)` and `computeTax("new", computed)` are called on every render of the preview panel. Both together take under 1ms; memoise on the `Computed` reference, not on individual fields.

---

# PART D — EDGE CASES, VALIDATION, TESTS

## 16. Edge cases

Every row here must have a corresponding unit test. The ID is the test name.

| ID | Situation | Required behaviour |
|---|---|---|
| **E1** | Total income exactly ₹12,00,000, new regime | Slab tax ₹60,000, rebate ₹60,000, tax **₹0**. Not ₹1. |
| **E2** | Total income ₹12,00,010, new regime | Slab tax ₹60,001.50; no rebate; marginal relief ₹59,991.50; tax before cess ₹10; cess ₹0.40; **total ₹10**. |
| **E3** | Total income ₹12,50,000, new regime | Slab tax ₹67,500; relief ₹17,500; tax ₹50,000; cess ₹2,000; **total ₹52,000**. |
| **E4** | Total income ₹12,70,590, new regime | Relief is **zero** (slab tax ₹70,588.50 is already below the ₹70,590 excess). Full tax **₹73,410**. Break-even ≈ ₹12,70,588. |
| **E5** | Salary income less than the standard deduction (e.g. gross ₹40,000) | Standard deduction is capped at the salary figure, not the statutory ₹50,000/₹75,000. Salary income floors at ₹0, never goes negative and never creates a deductible loss. |
| **E6** | Old regime, total income exactly ₹5,00,000 | Rebate ₹12,500, tax **₹0**. |
| **E7** | Old regime, total income ₹5,00,010 | **No rebate, no marginal relief.** Tax ₹12,502 + cess ₹500.08 = **₹13,000**. A ₹10 rise in income costs ₹13,000. This cliff is real; the app must warn about it (rule S9). |
| **E8** | Rent paid, but no HRA component in salary | HRA exemption = **₹0**. Show the 80GG educational panel. Do not compute 80GG. |
| **E9** | Rent paid ≤ 10% of basic salary | Limb 3 is negative → exemption clamps to **₹0**. Display the negative limb so the user understands why. |
| **E10** | 80C inputs total more than ₹1.5 lakh | Cap at ₹1,50,000. Show the excess explicitly: `₹64,000 of your investments gave you no extra tax benefit.` |
| **E11** | Employee PF entered on step 3 *and* again as an 80C item | The UI must prevent this: PF appears on step 5 as a **read-only, pre-filled row** with the copy `already included — don't add it again`. The engine adds `employeePFAnnual` exactly once. |
| **E12** | Own NPS of ₹80,000, 80C basket already full from PF etc. | Allocate ₹50,000 to 80CCD(1B) first, then spill ₹30,000 into 80CCE — where it is absorbed by the already-full ₹1.5 lakh cap and yields nothing. Deduction from NPS = ₹50,000. Allocating to 80CCE first would wrongly give ₹0. |
| **E13** | Own NPS of ₹30,000, 80C basket has ₹40,000 of room | Allocate ₹30,000 to 80CCD(1B). The 80CCE room is irrelevant — 80CCD(1B) is the scarcer slot and always fills first. |
| **E14** | Senior citizen with both savings interest and FD interest | Use **80TTB only**, ₹50,000 across both. Never 80TTA and 80TTB together. |
| **E15** | Under-60 with ₹80,000 of FD interest and ₹4,000 of savings interest | 80TTA gives ₹4,000 (actual savings interest, under the ₹10,000 cap). FD interest gets nothing. |
| **E16** | Home loan interest of ₹3,50,000 on a self-occupied house | Cap at ₹2,00,000 in the old regime. Zero in the new regime. |
| **E17** | Chapter VI-A deductions exceed gross total income | Clamp total deductions to GTI (s.80A(2)). Total income is ₹0, tax is ₹0. Deductions must never create a refundable loss. |
| **E18** | Gross total income is negative (huge home loan loss vs tiny salary) | Clamp GTI to ₹0. Tax ₹0. |
| **E19** | Income below the basic exemption limit in both regimes | Both taxes are ₹0. Verdict copy switches to `You pay no tax either way` (Section 10.1). |
| **E20** | Employer NPS above 14% of basic | Add the **full** contribution to gross salary; deduct only up to the cap. The excess is taxed. |
| **E21** | Employer NPS present, user in old regime, private employer | Cap is **10%** of basic, not 14%. Government employees get 14% in both regimes. |
| **E22** | Age band = senior/superSenior, new regime | New regime slabs are **identical for all ages**. Do not apply the higher exemption limit. |
| **E23** | Professional tax entered as ₹250/month (₹3,000/year) | Cap at ₹2,500 for the year. Show the info note. |
| **E24** | Monthly rent entered, but `monthsRentPaid` = 7 | `annualRent = monthlyRent × 7`. The 10%-of-basic offset uses the **full-year** basic in this simplified model; state this simplification in `/how-it-works`. |
| **E25** | Total income requiring rounding, e.g. ₹6,72,004 | Round to ₹6,72,000 before computing tax (s.288A). Round the final tax to the nearest ₹10 (s.288B). Test with a value ending in 5 to lock in half-up behaviour. |
| **E26** | User declares income above ₹50 lakh | Show the surcharge out-of-scope banner (17.4). Still compute and show the result, clearly labelled `understated`. |
| **E27** | Solver returns multiple roots (marginal relief band) | Use the **smallest** root, set `grossAmbiguous = true`, show the ambiguity note from Section 12.4. |
| **E28** | User enters PF of exactly ₹1,800 and does not know their basic | Force the basic salary question. Do not derive ₹15,000 from ₹1,800 — that is the *ceiling*, not their actual basic. |
| **E29** | Derived basic exceeds gross salary | Clamp basic to gross, add a warning flag, and show `Something looks off — please check your PF or basic salary figure.` |
| **E30** | Both regimes produce identical tax to the rupee | Winner = New Regime, verdict `tie`. Explain the reason: no proofs, default regime. |
| **E31** | Preventive check-up of ₹5,000 with self premium already at ₹25,000 | 80D self bucket stays at ₹25,000. The check-up adds nothing — it sits **inside** the cap. |
| **E32** | Parents' medical expenditure claimed *and* parents' insurance premium paid | The medical-expenditure route is only for senior parents with **no policy in force**. If premium > 0, disable the expenditure field entirely. |

---

## 17. Validation rules

### 17.1 Field-level validation

| Field | Rule | Message |
|---|---|---|
| `monthlyInHand` | required, ₹1,000 – ₹50,00,000, integer | `Please enter the amount your salary credit shows.` |
| `monthlyTDS` | ≥ 0, < `monthlyInHand × 3` | `That looks too high compared to your salary. Please check.` |
| `basicMonthly` | ≥ ₹1,000, ≤ monthly gross | `Your basic can't be more than your total salary.` |
| `basicSharePercent` | 0.30 – 0.60 | slider-bounded, cannot be invalid |
| `pfMonthly` | 0 – ₹1,00,000 | `Please check this amount.` |
| `monthlyRent` | 0 – ₹10,00,000 | `Please check this amount.` |
| `monthsRentPaid` | integer 1–12 | stepper-bounded |
| `monthlyHRA` | 0, and `hra + basic ≤ gross` | `HRA plus basic can't be more than your total salary.` |
| any 80C item | 0 – ₹1,50,00,000 | `Please check this amount.` |
| `homeLoanInterestAnnual` | 0 – ₹1,00,00,000 | `Please check this amount.` |
| `professionalTaxMonthly` | 0 – 208 | `Professional tax is capped at ₹2,500 a year.` |
| all money fields | no negatives, integers only | `Please enter a positive number.` |

### 17.2 Soft warnings (never block Continue)

| Condition | Message |
|---|---|
| `annualRent > annualGross` | `Your rent is more than your whole salary. Please double-check.` |
| `basic / gross < 0.25` | `That basic looks unusually low. It affects your rent benefit a lot — worth double-checking.` |
| `basic / gross > 0.85` | `That basic looks unusually high. Worth double-checking.` |
| `sum(80C items) > 150000` | `You're ₹64,000 over the ₹1.5 lakh limit. That extra doesn't reduce your tax.` |
| `healthPremiumSelf > cap` | `Only ₹25,000 of this can be claimed.` |
| `homeLoanInterest > 200000` | `Only ₹2,00,000 counts. The rest doesn't reduce your tax.` |
| `preventiveCheckup > 5000` | `Only ₹5,000 of this counts, and it sits inside your health insurance limit.` |
| `savingsInterest > 100000` | `That's a lot of savings interest. Make sure you haven't included FD interest here — that's the next box.` |

### 17.3 Cross-field validation

- `basicMonthly ≤ grossMonthly` — hard error.
- `monthlyHRA + basicMonthly ≤ grossMonthly` — hard error.
- `parentsMedicalExpenditure > 0` requires `healthPremiumParents === 0` and `parentsAreSenior === true` — enforced by conditional rendering (E32).
- `ownNPS > 0` requires `hasNPS === true` — enforced by conditional rendering.
- `homeLoanPrincipal > 0` requires `hasHomeLoan === true` — enforced by conditional rendering.

### 17.4 Out-of-scope detection banner

When any of these become true, show a **persistent, dismissible amber banner** at the top of both the wizard and the result page.

| Trigger | Banner text |
|---|---|
| `annualGross > 5,000,000` | `Above ₹50 lakh, an extra charge called surcharge applies. We don't calculate it, so both numbers below are lower than your real tax. The comparison between the two regimes is still broadly useful, but please confirm the final figures with a CA.` |
| `propertyUse === "letOut"` | `We only handle the home you live in. Your rented-out property isn't included in these numbers.` |
| `propertyUse === "underConstruction"` | `Interest paid while a house is under construction follows a different rule that we don't handle. It isn't included here.` |
| User mentioned capital gains (via the step 8 helper) | `Capital gains follow their own tax rates and aren't included here.` |

The banner must never be the *only* output. Always show the full result alongside it.

---

## 18. Golden test vectors

These eight vectors are hand-verified against the FY 2025-26 rules and must pass exactly. Any code change that breaks one is a regression. **Tolerance: ₹0** (except the solver vector, ±₹100).

### GT-1 — First job, no deductions

| Input | Value |
|---|---|
| Annual gross salary | ₹8,00,000 |
| Age band | below60 |
| Everything else | zero |

| | Old | New |
|---|---|---|
| Standard deduction | ₹50,000 | ₹75,000 |
| Total income | ₹7,50,000 | ₹7,25,000 |
| Slab tax | ₹62,500 | ₹16,250 |
| Rebate u/s 87A | ₹0 | ₹16,250 |
| Cess | ₹2,500 | ₹0 |
| **Total tax** | **₹65,000** | **₹0** |

**Winner: New, saving ₹65,000.**

### GT-2 — Metro renter with a full 80C

| Input | Value |
|---|---|
| Annual gross salary | ₹15,00,000 |
| Basic (annual) | ₹7,50,000 |
| HRA received (annual) | ₹3,00,000 |
| Rent (annual) | ₹3,00,000 |
| City | Metro |
| 80C total | ₹1,50,000 |
| 80D | ₹25,000 |
| Professional tax | ₹2,500 |

HRA limbs: ₹3,00,000 / ₹3,75,000 / ₹2,25,000 → **exempt ₹2,25,000** (limb 3).

| | Old | New |
|---|---|---|
| Gross salary | ₹15,00,000 | ₹15,00,000 |
| Less HRA | ₹2,25,000 | — |
| Less standard deduction | ₹50,000 | ₹75,000 |
| Less professional tax | ₹2,500 | — |
| Gross total income | ₹12,22,500 | ₹14,25,000 |
| Less Chapter VI-A | ₹1,75,000 | ₹0 |
| Total income | ₹10,47,500 | ₹14,25,000 |
| Slab tax | ₹1,26,750 | ₹93,750 |
| Cess | ₹5,070 | ₹3,750 |
| **Total tax** | **₹1,31,820** | **₹97,500** |

**Winner: New, saving ₹34,320.**

### GT-3 — Marginal relief, mid-band

Total income (new regime) = ₹12,50,000.
Slab tax ₹67,500 → excess over ₹12L = ₹50,000 → relief ₹17,500 → tax ₹50,000 → cess ₹2,000.
**Total tax = ₹52,000.**

### GT-4 — Marginal relief, boundaries

| Total income (new) | Slab tax | Rebate | Relief | Total tax |
|---|---|---|---|---|
| ₹12,00,000 | ₹60,000 | ₹60,000 | ₹0 | **₹0** |
| ₹12,00,010 | ₹60,001.50 | ₹0 | ₹59,991.50 | **₹10** |
| ₹12,70,580 | ₹70,587 | ₹0 | ₹7 | **₹73,400** |
| ₹12,70,590 | ₹70,588.50 | ₹0 | ₹0 | **₹73,410** |

### GT-5 — Old regime ₹5 lakh cliff (no marginal relief)

| Total income (old, below 60) | Slab tax | Rebate | Total tax |
|---|---|---|---|
| ₹5,00,000 | ₹12,500 | ₹12,500 | **₹0** |
| ₹5,00,010 | ₹12,502 | ₹0 | **₹13,000** |

A ₹10 increase in income produces ₹13,000 of tax. The engine must reproduce this exactly.

### GT-6 — Senior citizen with deposit interest

| Input | Value |
|---|---|
| Annual salary/pension | ₹9,00,000 |
| Age band | senior (60–79) |
| FD interest | ₹60,000 |
| Savings interest | ₹12,000 |
| 80C | ₹1,50,000 |
| 80D | ₹50,000 |
| Professional tax | ₹0 |

Old: GTI = ₹8,50,000 + ₹72,000 = ₹9,22,000. Deductions = ₹1,50,000 + ₹50,000 + 80TTB ₹50,000 = ₹2,50,000. Total income ₹6,72,000.
Slab tax (senior) = ₹10,000 + ₹34,400 = ₹44,400. Cess ₹1,776. **Total ₹46,180** (after s.288B rounding).

New: total income = ₹8,25,000 + ₹72,000 = ₹8,97,000. Slab tax ₹29,700 → rebate ₹29,700. **Total ₹0.**

**Winner: New, saving ₹46,180.** *(Note: 80TTB is capped at ₹50,000 even though total interest is ₹72,000.)*

### GT-7 — Old regime wins

| Input | Value |
|---|---|
| Annual gross salary | ₹20,00,000 |
| Basic (annual) | ₹10,00,000 |
| HRA received (annual) | ₹5,00,000 |
| Rent (annual) | ₹6,00,000 |
| City | Metro |
| 80C | ₹1,50,000 |
| 80CCD(1B) own NPS | ₹50,000 |
| 80D | ₹75,000 |
| Home loan interest (self-occupied) | ₹2,00,000 |
| Professional tax | ₹2,500 |

HRA limbs: ₹5,00,000 / ₹5,00,000 / ₹5,00,000 → **exempt ₹5,00,000** (all three tie).

| | Old | New |
|---|---|---|
| After HRA | ₹15,00,000 | ₹20,00,000 |
| Less standard deduction | ₹50,000 | ₹75,000 |
| Less professional tax | ₹2,500 | — |
| Salary income | ₹14,47,500 | ₹19,25,000 |
| House property loss | −₹2,00,000 | ₹0 |
| Gross total income | ₹12,47,500 | ₹19,25,000 |
| Less Chapter VI-A | ₹2,75,000 | ₹0 |
| Total income | ₹9,72,500 | ₹19,25,000 |
| Slab tax | ₹1,07,000 | ₹1,85,000 |
| Cess | ₹4,280 | ₹7,400 |
| **Total tax** | **₹1,11,280** | **₹1,92,400** |

**Winner: Old, saving ₹81,120.**

### GT-8 — The back-solver

| Input | Value |
|---|---|
| Monthly in-hand | ₹1,50,000 |
| Monthly employee PF | ₹3,600 |
| Monthly professional tax | ₹200 |
| Monthly TDS | unknown |
| Employer regime | New |
| Bonus | ₹0 |

Base = 12 × (1,50,000 + 3,600 + 200) = ₹18,45,600.
Fixed point: `G = 18,45,600 + 1.04 × [1,20,000 + 0.20 × (G − 16,75,000)]` → `0.792G = 16,22,000`.

**Expected annual gross ≈ ₹20,47,980** (tolerance ±₹100).
**Expected annual tax ≈ ₹2,02,380.**

Assert the solver converges to this, that `ambiguous === false`, and that the coarse scan finds exactly one root.

### GT-9 — Solver ambiguity guard

Construct an input whose take-home lands inside the marginal relief band and assert `ambiguous === true` and that the returned gross is the **smallest** root. (Derive the input by taking a gross of ₹12,80,000 with PF ₹1,800/month, computing the take-home, then feeding that take-home back in.)

---

# PART E — EXPLANATION AND SUGGESTIONS

## 20. "What each of your answers did" — the explanation engine

### 20.1 The method

For each input the user actually provided, compute a **counterfactual**: recompute tax in **both** regimes with that single input set to zero, and report the difference.

```ts
function impactOf(field: keyof WizardInputs, base: Computed) {
  const without = { ...base, [field]: 0 };
  const recomputedWithout = derive(without);          // full re-derivation
  return {
    field,
    oldImpact: computeTax("old", recomputedWithout).totalTax - computeTax("old", base).totalTax,
    newImpact: computeTax("new", recomputedWithout).totalTax - computeTax("new", base).totalTax,
  };
}
```

A **positive impact** means "this answer saved you that much tax."

**Important:** re-derive, don't just swap the field. Zeroing `pfMonthly` must also zero the 80C contribution *and* change the derived basic salary if basic came from PF. Only a full re-derivation gets this right.

### 20.2 Which items to explain

Run `impactOf` for: `hraExempt` (via rent), `80C basket`, `80D`, `homeLoanInterest`, `ownNPS`, `employerNPS`, `professionalTax`, `savingsInterest + fdInterest`, `standardDeduction` (compare ₹50k vs ₹75k), `ageBand` (compare against `below60`), `annualBonus`.

Drop any item with an absolute impact under ₹100 in both regimes. Sort the rest by `max(|oldImpact|, |newImpact|)`, descending. Show all of them — this section is meant to be complete, not curated.

### 20.3 Card format

Each card:
- **Title:** plain-language name of the answer, e.g. `Your rent of ₹25,000 a month`
- **Two impact chips:** `Saved ₹70,200 in the old regime` and `Saved ₹0 in the new regime`
- **One or two sentences of explanation**, generated from a template keyed to the field.

### 20.4 Explanation templates

| Field | Template |
|---|---|
| Rent / HRA | `You pay ₹{rent} a month in rent and receive ₹{hra} of HRA. The law made ₹{exempt} of that HRA tax-free — it picked the smallest of three figures, and in your case the winner was "{limbName}". In the new regime this benefit doesn't exist at all, which is worth ₹{oldImpact} to you.` |
| 80C | `You put ₹{used} into things that qualify for the ₹1.5 lakh limit — {itemList}. That cut your old-regime tax by ₹{oldImpact}. {overflowLine}` where `overflowLine` = `You went ₹{excess} over the limit, and that portion did nothing for your tax.` when applicable. |
| 80D | `Your health insurance premiums of ₹{amount} reduced your old-regime tax by ₹{oldImpact}. Your limit was ₹{cap} — {capLine}.` |
| Home loan interest | `You paid ₹{paid} of home loan interest. ₹{allowed} of it was allowed as a deduction, saving you ₹{oldImpact} in the old regime. In the new regime a home loan on the house you live in gives you nothing.` |
| Own NPS | `Your own NPS contribution of ₹{amount} saved ₹{oldImpact}. ₹{cd1b} of it went into the special ₹50,000 slot that sits outside the ₹1.5 lakh limit.` |
| Employer NPS | `Your employer put ₹{amount} into your NPS. This is the one deduction that works in both regimes — it saved you ₹{oldImpact} in the old regime and ₹{newImpact} in the new one.` |
| Standard deduction | `Everyone with a salary gets a flat deduction: ₹50,000 in the old regime and ₹75,000 in the new. That extra ₹25,000 in the new regime is worth ₹{diff} to you.` |
| Age | `Because you're {ageDescription}, the old regime lets you earn ₹{limit} before any tax starts — ₹{extra} more than someone under 60. That's worth ₹{oldImpact}. The new regime gives everyone the same ₹4 lakh regardless of age.` |
| Interest income | `Your ₹{total} of bank interest added to your taxable income in both regimes. In the old regime, ₹{deducted} of it was deductible under {section}, saving ₹{oldImpact}.` |
| Professional tax | `The ₹{amount} of professional tax on your payslip is deductible in the old regime — worth ₹{oldImpact}. The new regime doesn't allow it.` |
| Bonus | `Your ₹{amount} bonus is taxed exactly like salary. It added ₹{oldImpact} to your old-regime tax and ₹{newImpact} to your new-regime tax.` |

### 20.5 The summary line

Above the cards, one sentence that names the deciding factor:

> `The single biggest thing in your case is your rent. It's worth ₹70,200 in the old regime and nothing in the new one — and that alone is why the old regime wins for you.`

Generate it by taking the top-ranked item and checking whether its impact exceeds the winning margin. If it does, use `and that alone is why the {winner} regime wins for you`. If it doesn't, use `but it isn't enough on its own — the {winner} regime still comes out ahead`.

---

## 21. Suggestions engine

Fire every rule whose condition is true. Show at most five, sorted by estimated rupee saving. Every suggestion **must** carry a rupee figure — a suggestion without a number is noise.

### 21.1 The marginal rate helper

```ts
function marginalRate(regime: Regime, x: Computed): number {
  const base = computeTax(regime, x).totalTax;
  const bumped = computeTax(regime, { ...x, annualGross: x.annualGross + 10_000 }).totalTax;
  return (bumped - base) / 10_000;      // includes cess, and marginal relief effects
}
```
Deriving the rate numerically rather than reading it off the slab table means marginal relief and rebate cliffs are automatically handled.

### 21.2 Rules

| ID | Condition | Suggestion |
|---|---|---|
| **S1** | Old regime wins AND `used80C < 150000` | **Title:** `Fill up your ₹1.5 lakh limit` · **Body:** `You've used ₹{used} of the ₹1.5 lakh limit. Putting the remaining ₹{room} into PPF, ELSS or a five-year tax-saving FD would cut your tax by about ₹{room × marginalRate}. ELSS has the shortest lock-in at three years; PPF is the safest but locks money for fifteen.` |
| **S2** | Old regime wins AND `ownNPS < 50000` | **Title:** `The extra ₹50,000 nobody uses` · **Body:** `There's a ₹50,000 NPS deduction that sits completely outside the ₹1.5 lakh limit. You've used ₹{used} of it. Putting in another ₹{room} would save about ₹{room × marginalRate}. The catch: the money is locked until you're 60.` |
| **S3** | `employerNPSAnnual === 0` (either regime wins) | **Title:** `Ask HR about corporate NPS` · **Body:** `This is the only deduction that still works in the new regime. If your employer routes {cap} — 14% of your basic — into your NPS out of your existing CTC, you'd save about ₹{cap × marginalRate} a year without earning a rupee more. Many HR teams will set this up on request.` |
| **S4** | Old regime wins AND `healthPremiumSelf === 0` | **Title:** `You have no health insurance` · **Body:** `Beyond the obvious reason to have it, a premium of up to ₹25,000 is deductible — worth about ₹{25000 × marginalRate} in tax. A basic ₹10 lakh cover for a healthy person in their twenties or thirties costs far less than that limit.` |
| **S5** | Old regime wins AND `healthPremiumParents === 0` AND user is under 60 | **Title:** `Insurance for your parents` · **Body:** `A separate limit of ₹{cap} applies to health insurance you buy for your parents — ₹50,000 if either is 60 or above. Using it fully would save about ₹{cap × marginalRate}.` |
| **S6** | New regime wins AND `used80C > 0` | **Title:** `Your investments aren't buying you tax savings` · **Body:** `You've put ₹{used} into 80C investments, but the new regime is still cheaper for you by ₹{saving}. That doesn't make the investments bad — PPF and ELSS are fine places for money. It does mean you should choose them on their own merits from now on, not for the tax break.` |
| **S7** | `totalIncomeNew` between ₹12,00,000 and ₹12,70,588 | **Title:** `You're inside the marginal relief zone` · **Body:** `Your taxable income of ₹{ti} is just above the ₹12 lakh line. A rule called marginal relief is capping your tax at ₹{tax} instead of ₹{wouldBe} — it's saving you ₹{relief} right now. But be careful: between ₹12 lakh and about ₹12.7 lakh, every extra rupee you earn goes straight to tax. A raise in this band adds nothing to your take-home.` |
| **S8** | `totalIncomeNew` between ₹12,00,000 and ₹12,20,000 AND `employerNPSAnnual < cap` | **Title:** `You're just above the ₹12 lakh line` · **Body:** `You're ₹{excess} over the ₹12 lakh mark. If your employer contributed ₹{excess} to your NPS, your taxable income would fall back under ₹12 lakh, the full ₹60,000 rebate would return, and your tax would drop to zero. That's a saving of ₹{currentTax} for a change that costs your employer nothing extra.` |
| **S9** | Old regime wins AND `totalIncomeOld` between ₹5,00,000 and ₹5,20,000 | **Title:** `You're just above the ₹5 lakh line` · **Body:** `In the old regime there is no marginal relief — cross ₹5 lakh of taxable income by ₹10 and you owe ₹13,000. You're ₹{excess} over. Another ₹{excess} of 80C investment would take you back under and wipe out ₹{currentTax} of tax entirely.` |
| **S10** | `paysRent === true` AND `hasHRAComponent === "no"` | **Title:** `Ask HR to restructure your salary` · **Body:** `You pay ₹{rent} a month in rent but your salary has no HRA line, so you get no rent benefit at all. If HR moved part of your special allowance into an HRA component, up to ₹{potential} could become tax-free in the old regime — worth about ₹{potential × marginalRate}. There's also a separate rule called 80GG for people with no HRA, worth up to ₹60,000, which is worth asking a CA about.` |
| **S11** | `basicSharePercent < 0.40` AND `paysRent === true` AND old regime wins | **Title:** `Your basic salary is low` · **Body:** `Your basic is only {pct}% of your salary, and the rent benefit is calculated as a percentage of basic. A higher basic would mean a bigger rent benefit — though it also means more PF deducted, so your monthly take-home would fall. Worth a conversation with HR if you're renting in a metro.` |
| **S12** | `used80C > 150000` | **Title:** `₹{excess} of your investments is doing nothing for tax` · **Body:** `You've put ₹{total} into 80C investments but only ₹1,50,000 counts. The extra ₹{excess} gave you no tax benefit. Consider redirecting it to NPS for the separate ₹50,000 slot, or simply to a regular index fund with no lock-in.` |
| **S13** | `savingsInterest > 10000` AND age < 60 AND old regime wins | **Title:** `Interest sitting in a savings account` · **Body:** `Only ₹10,000 of savings interest is deductible, and you earned ₹{amount}. The remaining ₹{excess} is taxed at your slab rate. Money you don't need for a year does better in an FD or a debt fund — and if you're planning for retirement, the taxable interest is a good argument for shifting some of it.` |
| **S14** | New regime wins by more than ₹20,000 | **Title:** `You can stop chasing proofs` · **Body:** `The new regime saves you ₹{saving} and asks for nothing in return — no rent receipts, no landlord PAN, no insurance certificates, no investment statements in January. That's real time saved on top of the money.` |
| **S15** | Winning margin < ₹5,000 | **Title:** `It's close — so pick the simpler one` · **Body:** `The difference between the two is only ₹{diff} a year, which is about ₹{monthly} a month. At that margin, go with the new regime: it's the default, it needs no paperwork, and one missed proof would wipe out the difference anyway.` |
| **S16** | `hasHomeLoan && propertyUse === "selfOccupied" && old wins` | **Title:** `Your home loan is doing the heavy lifting` · **Body:** `Your ₹{interest} of home loan interest is worth ₹{impact} in the old regime and nothing in the new. Keep this in mind if you're thinking about prepaying — reducing the loan reduces the deduction too, so the effective cost of your loan is lower than the sticker interest rate.` |
| **S17** | Age ≥ 60 AND old regime wins AND `savingsInterest + fdInterest < 50000` | **Title:** `You have unused senior citizen benefit` · **Body:** `As a senior citizen you can deduct up to ₹50,000 of deposit interest and you've used only ₹{used}. If you have money in a savings account earning little, moving it to a fixed deposit puts that unused ₹{room} of deduction to work.` |

### 21.3 Presentation

- One card per suggestion: title, body, and a large rupee figure on the right.
- The rupee figure is labelled `estimated yearly saving` — never presented as a promise.
- A single line at the bottom of the section: `These are estimates based on what you told us, not financial advice. Any lock-in period, liquidity need or personal goal matters more than the tax saving.`

---

# PART F — BUILD

## 23. Design system

### 23.1 Principles in practice

Clean and trustworthy is achieved by **restraint**, not by adding polish. One accent colour. One typeface family. Generous whitespace. No gradients on text, no glassmorphism, no animated background blobs.

### 23.2 Colour

```css
--bg:            #FBFBFA;   /* warm off-white, not pure white */
--surface:       #FFFFFF;
--surface-sunk:  #F4F4F2;
--border:        #E6E5E1;
--border-strong: #D3D2CD;

--text:          #1A1A18;
--text-muted:    #6B6A65;
--text-faint:    #9A9993;

--accent:        #1F5E4B;   /* deep green — money, calm, not fintech-blue */
--accent-soft:   #E8F1ED;
--accent-text:   #163F33;

--old-regime:    #7C5CBF;   /* violet */
--old-soft:      #F1ECFA;
--new-regime:    #1F5E4B;   /* the accent green */
--new-soft:      #E8F1ED;

--warn:          #A66300;
--warn-soft:     #FDF3E3;
--error:         #B4342B;
```

**Rule:** the two regimes always keep their assigned colours across every screen. The user should be able to recognise "old = violet, new = green" without reading a label. Never colour the winner green and the loser red — that implies one regime is bad.

### 23.3 Typography

- **Body and UI:** `Inter`, with `system-ui` fallback.
- **Numbers:** the same family with `font-variant-numeric: tabular-nums` everywhere a figure appears in a column. Non-tabular numerals in a live-updating table cause horizontal jitter, which reads as instability.
- **Scale:** 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64.
- Landing H1: 56px desktop, 36px mobile, weight 600, `letter-spacing: -0.02em`.
- Question card headings: 24px, weight 600.
- Body: 16px, `line-height: 1.6`.
- Helper text: 14px, `--text-muted`.
- Result headline number: 48px, weight 600, tabular.

### 23.4 Spacing and layout

- 4px base unit. Use 4, 8, 12, 16, 24, 32, 48, 64, 96.
- Max content width: 1200px. Question card: max 560px. Preview panel: max 480px.
- Card radius: 12px. Button radius: 8px. Input radius: 8px.
- Shadows are almost invisible: `0 1px 2px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)`. Nothing heavier.

### 23.5 Money formatting

```ts
const inr = new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", maximumFractionDigits: 0,
});
```
Always Indian grouping (`₹12,45,600`). Never abbreviate to `12.4L` in a result table — abbreviations look imprecise where precision is the point. Abbreviations are acceptable only in chips and axis labels.

### 23.6 Motion

- Value tweens: 400ms, `cubic-bezier(0.2, 0, 0, 1)`.
- Step transitions: 240ms slide + fade.
- Winner flip: 500ms, with a 1.5s highlight on the verdict strip.
- Respect `prefers-reduced-motion: reduce` — drop to instant value changes and cross-fades only.

### 23.7 Empty and loading states

There are none. Everything is computed synchronously in the browser. If a spinner appears anywhere in this app, something is wrong.

---

## 24. Technical specification

### 24.1 Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript (strict) | Type safety matters when the domain is money |
| Build | Vite | Fast, static output, no server needed |
| Styling | Tailwind CSS with the tokens above as CSS variables | Consistency without a component library |
| State | Zustand | Small, no boilerplate, easy to memoise selectors |
| Routing | React Router (or Next.js static export) | Client-side only |
| Testing | Vitest + Testing Library | Same runtime as the build |
| Hosting | Any static host — Netlify, Vercel, Cloudflare Pages, GitHub Pages | No server, so no server costs |

**Hard requirement:** the tax engine must have **zero dependencies**. It is plain TypeScript functions operating on numbers. This keeps it auditable and portable.

### 24.2 File structure

```
src/
├── lib/tax/
│   ├── constants.ts          # every number from §11 — nothing else
│   ├── types.ts              # WizardInputs, Computed, TaxResult
│   ├── derive.ts             # WizardInputs → Computed
│   ├── hra.ts                # §13.2
│   ├── deductions.ts         # §13.6, §13.7
│   ├── slabs.ts              # §13.9
│   ├── rebate.ts             # §13.10
│   ├── compute.ts            # §14 — the orchestrator
│   ├── solver.ts             # §12 — in-hand → gross
│   ├── impact.ts             # §20 — counterfactual engine
│   ├── suggestions.ts        # §21 — rule engine
│   └── format.ts             # INR formatting, rounding helpers
├── store/wizard.ts
├── components/
│   ├── landing/
│   ├── wizard/
│   │   ├── WizardShell.tsx
│   │   ├── ProgressDots.tsx
│   │   ├── StepFAQ.tsx
│   │   ├── MoneyInput.tsx
│   │   └── steps/Step1Salary.tsx … Step8OtherIncome.tsx
│   ├── preview/
│   │   ├── PreviewPanel.tsx
│   │   ├── SlabTable.tsx
│   │   └── MobilePreviewBar.tsx
│   └── result/
├── content/
│   ├── faqs.ts               # §8 FAQ copy, one array per step
│   ├── explanations.ts       # §20.4 templates
│   └── suggestions.ts        # §21.2 rule definitions
└── pages/
```

### 24.3 Non-negotiable engineering rules

1. **No tax arithmetic outside `src/lib/tax/`.** Components read values; they never compute them.
2. **No magic numbers.** Every constant is imported from `constants.ts`. A code review should be able to check the app against the Finance Act by reading one file.
3. **Every function in `lib/tax` is pure.** No dates, no randomness, no I/O.
4. **The engine has no React imports.** It must be runnable in plain Node for the test suite.
5. **All money is stored as integer rupees.** Never floats for storage, never paise. Rounding happens only at the two statutory points (s.288A, s.288B).
6. **Test coverage on `lib/tax` must be 100% of branches.** The rest of the app has no coverage requirement.

### 24.4 Performance targets

| Metric | Target |
|---|---|
| Lighthouse Performance | ≥ 95 |
| First Contentful Paint | < 1.2s on 4G |
| Total JS bundle (gzipped) | < 180KB |
| Full recalculation of both regimes | < 5ms |
| Solver worst case | < 20ms |
| Preview repaint after keystroke | < 16ms (one frame) |

---

## 25. Privacy

### 25.1 Requirements

- **No backend.** The app is a static bundle. There is no API to call.
- **No analytics.** No Google Analytics, no Plausible, no Sentry, no PostHog, no heatmaps. Nothing that transmits.
- **No third-party requests at runtime.** Self-host fonts. No CDN scripts, no embedded widgets, no external images.
- **No cookies.** None at all, including "functional" ones.
- **Storage:** `sessionStorage` only, one key (`wtr_draft`), holding the `WizardInputs` object. Cleared when the tab closes. Never `localStorage` — persistence across sessions is not needed and creates a real risk on shared computers.
- **A visible Clear button** in the wizard header: `Clear my data`, which wipes `sessionStorage` and resets the store.
- **CSP header** on the host: `default-src 'self'; connect-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'` — `connect-src 'none'` makes it structurally impossible for the app to phone home.

### 25.2 The privacy statement

To be shown on `/privacy` and summarised on the landing page:

> **Nothing you type here leaves your device.**
>
> This site has no server, no database and no account system. When you open it, your browser downloads a small program and runs it locally. Everything after that — reading your inputs, calculating your tax, showing your result — happens on your own machine.
>
> We don't use analytics. We don't set cookies. We don't load anything from other companies' servers. There is no email box and nothing to sign up for.
>
> Your answers are kept in your browser's session memory so you don't lose them if you refresh the page. Close the tab and they're gone. You can also clear them at any time with the "Clear my data" button.
>
> We could not see your salary even if we wanted to. That is a property of how the site is built, not a promise we're asking you to trust.

---

## 26. Accessibility

- **WCAG 2.1 AA** minimum.
- Full keyboard navigation. Logical tab order. Visible focus rings (2px accent outline, 2px offset) — never `outline: none`.
- Every input has a real `<label>` with `htmlFor`. Placeholders are never used as labels.
- Errors are linked with `aria-describedby` and announced in an `aria-live="polite"` region.
- The preview panel is wrapped in `aria-live="polite"` with `aria-atomic="false"` so screen readers announce changed rows without re-reading the entire panel. Debounce announcements to 800ms so typing doesn't flood the reader.
- Slab tables are real `<table>` elements with `<caption>` and `<th scope>`. Never divs styled as a grid.
- FAQ accordions use native `<details>`/`<summary>`, or a button with `aria-expanded` and `aria-controls`.
- Contrast: body text ≥ 4.5:1, large text ≥ 3:1. Verify `--text-muted` on `--bg` specifically.
- Colour is never the sole carrier of meaning — the winning regime carries a `✓ RECOMMENDED` label as well as a colour.
- Progress dots have an accessible label: `Step 3 of 8, Rent and HRA. Steps 1 and 2 completed.`
- Target size ≥ 44×44px on touch.
- Test with VoiceOver and NVDA before release.

---

## 27. Acceptance criteria

### 27.1 Tax engine

- [ ] All nine golden vectors (GT-1 … GT-9) pass with zero rupee deviation (solver ±₹100).
- [ ] All 32 edge cases (E1 … E32) have a passing test.
- [ ] 100% branch coverage on `src/lib/tax/`.
- [ ] No deduction other than the standard deduction and 80CCD(2)/80CCH is ever applied in the new regime — asserted by a property test that runs 10,000 random inputs and checks that new-regime Chapter VI-A equals `min(employerNPS, 14% of basic)`.
- [ ] A property test asserts that tax is monotonically non-decreasing in gross salary, in both regimes, over a random sweep — with the marginal relief band explicitly documented as the one flat region.
- [ ] Age band changes affect the old regime only. A property test asserts new-regime tax is identical across all three age bands for the same inputs.

### 27.2 Wizard

- [ ] Every step renders its own FAQ with the exact content from Section 8.
- [ ] Progress dots reflect completed, current, future and skipped states.
- [ ] Back navigation never loses data.
- [ ] Conditional fields appear and disappear correctly for all branches in Section 8.
- [ ] The gross salary derivation panel (12.5) shows a correct, arithmetically consistent breakdown.
- [ ] Entering a monthly TDS switches the derivation from `solved` to `exact` and updates the tick indicator.

### 27.3 Preview panel

- [ ] Updates within one frame of a keystroke.
- [ ] Never shows a spinner or a blank state after step 1.
- [ ] Shows all three HRA limbs and marks the winning one.
- [ ] Shows every slab row, including zero-income rows.
- [ ] Shows `Not allowed` in muted styling for new-regime-disallowed items rather than hiding them.
- [ ] Correctly collapses to a pinned bar below 1024px.

### 27.4 Result page

- [ ] Verdict is imperative and unhedged.
- [ ] The tie case, the both-zero case and the clear-winner case each have distinct, correct copy.
- [ ] The explanation section lists every input with an impact above ₹100, sorted by magnitude.
- [ ] Every suggestion carries a rupee figure.
- [ ] Next steps differ correctly between the two regimes.

### 27.5 Privacy and quality

- [ ] Network tab shows **zero** requests after initial load. Verified in CI with a Playwright assertion.
- [ ] No `localStorage` usage anywhere in the bundle.
- [ ] Lighthouse: Performance ≥ 95, Accessibility 100, Best Practices ≥ 95.
- [ ] Works with JavaScript-heavy ad blockers and in private browsing mode.
- [ ] Fully usable on a 360px-wide viewport.

---

## 28. Reference and disclaimers

### 28.1 Rule sources

All rules in this document are for **FY 2025-26 (AY 2026-27)** and reflect the position after the Finance Act, 2025.

| Rule | Authority |
|---|---|
| New regime slabs, ₹4L basic exemption | Section 115BAC(1A), as amended by Finance Act 2025 |
| New regime standard deduction ₹75,000 | Section 16(ia) |
| 87A rebate ₹60,000 up to ₹12,00,000 + marginal relief | First proviso to Section 87A |
| Old regime slabs, age-based limits | Part III of the First Schedule, Finance Act 2025 |
| Old regime standard deduction ₹50,000 | Section 16(ia) |
| 87A rebate ₹12,500 up to ₹5,00,000, no marginal relief | Section 87A, main provision |
| HRA exemption | Section 10(13A) read with Rule 2A |
| Professional tax | Section 16(iii); Article 276(2) of the Constitution caps it at ₹2,500 |
| 80C / 80CCE aggregate ₹1.5 lakh | Sections 80C, 80CCC, 80CCD(1), 80CCE |
| Additional NPS ₹50,000 | Section 80CCD(1B) |
| Employer NPS 14% (new regime, all employers) | Section 80CCD(2) as amended, effective FY 2025-26 |
| Health insurance | Section 80D |
| Deposit interest | Sections 80TTA, 80TTB |
| Home loan interest | Section 24(b); set-off limit Section 71(3A) |
| Cess 4% | Finance Act 2025 |
| Rounding | Sections 288A and 288B |

**Note on the Income Tax Act, 2025:** a new consolidated Act takes effect from 1 April 2026 and renumbers many of these provisions (for example, 80D becomes Section 126). The limits themselves are unchanged. FY 2025-26 — the year this app covers — is still governed by the Income-tax Act, 1961, so the section numbers above are the correct ones to display.

**Note on the metro city list:** for FY 2025-26 the 50% HRA rate applies only to Delhi, Mumbai, Kolkata and Chennai. From FY 2026-27 the list expands to eight cities. This app must use the four-city list. If the app is later extended to FY 2026-27, this is the first thing to change.

### 28.2 Disclaimer (required on the landing page footer and the result page)

> This calculator gives an estimate to help you compare the two tax regimes. It is not tax advice, and it is not a substitute for a qualified chartered accountant.
>
> It does not handle surcharge on income above ₹50 lakh, capital gains, business or freelance income, rental income from a let-out property, or non-resident taxation. If any of those apply to you, your real tax will differ from what you see here.
>
> The rules used are those in force for FY 2025-26 (AY 2026-27). Tax law changes, and a rule that was right when this was built may not be right when you read it. Please confirm anything important with a professional before you act on it.

### 28.3 The `/how-it-works` page

Must publish, in full and in plain language:

1. The complete constants table from Section 11.2.
2. The regime comparison table from Section 11.3.
3. The step-by-step computation order from Section 14.
4. The back-solve method from Section 12, including an honest description of the marginal relief ambiguity.
5. Every simplification made, stated openly:
   - Basic salary is estimated at 50% of gross when the user doesn't know it.
   - "Basic + DA" is treated as just basic.
   - The 10%-of-basic offset in the HRA calculation uses full-year basic even for part-year rent.
   - The 80G qualifying-limit test (10% of adjusted gross total income) is not applied.
   - Employer PF above the ₹7.5 lakh combined perquisite threshold is ignored.
   - A single salary figure is assumed for all twelve months.

Publishing the limitations is not a weakness. It is the reason a careful user will believe the parts that are right.

---

*End of document.*
