export interface FaqItem {
  question: string;
  answer: string;
}

// PRD §8.1 — this content is a requirement, not a placeholder.
export const STEP_FAQS: Record<string, FaqItem[]> = {
  salary: [
    {
      question: "Why don't you just ask for my CTC?",
      answer:
        "Because most people don't know it, and the ones who do usually quote a number that includes things which aren't even taxable — like the employer's PF share and gratuity. Your bank credit is a number you're certain about, so we start there and add back the deductions we know about.",
    },
    {
      question: "My salary changed mid-year. What do I enter?",
      answer:
        "Enter the amount you're receiving now. This calculator assumes the same salary for all twelve months, so if you got a big raise in October the answer will be a rough guide, not an exact figure. If you want to be precise, work out your total gross for the year and divide by twelve.",
    },
    {
      question: "I can't find my payslip. Can I still use this?",
      answer:
        'Yes. Choose "I\'m not sure" for the tax question and we\'ll estimate your gross salary by working backwards from your bank credit. The estimate is usually within a few thousand rupees.',
    },
    {
      question: "Should I include my bonus in the monthly amount?",
      answer:
        "No. Keep the monthly box for your regular monthly credit only, and put the bonus in the separate bonus box. Bonuses are taxed in the year you receive them, but they don't come every month.",
    },
    {
      question: "What if I changed jobs this year?",
      answer:
        "Add up the gross salary from both employers for the full financial year, divide by twelve, and enter that. Also remember that both employers probably each gave you the basic exemption, so your actual tax may be higher than what was deducted.",
    },
  ],

  "about-you": [
    {
      question: "Why does my age matter?",
      answer:
        "In the old regime, the amount you can earn tax-free before any tax starts depends on age: ₹2.5 lakh under 60, ₹3 lakh from 60 to 79, and ₹5 lakh at 80 and above. The new regime ignores age completely — everyone gets ₹4 lakh.",
    },
    {
      question: "I turn 60 in December. Which do I pick?",
      answer:
        'Pick "60 to 79". If you reach 60 at any point during the financial year, you count as a senior citizen for that whole year.',
    },
    {
      question: "Why is Bengaluru not a metro?",
      answer:
        "For the rent benefit, the law names only four cities: Delhi, Mumbai, Kolkata and Chennai. It's an old rule and it hasn't caught up with where people actually live. From April 2026 four more cities get added, but that's the next financial year, not this one.",
    },
    {
      question: "I live in one city and my office is in another. Which do I choose?",
      answer:
        "Choose the city where you pay the rent. The rent benefit is about the house you actually live in, not the office you report to.",
    },
    {
      question: "What is professional tax and why is it on my payslip?",
      answer:
        "It's a small state-level tax on having a job — usually ₹200 a month, capped at ₹2,500 a year. It's deducted by your employer and paid to the state. Under the old regime you can deduct it from your income; under the new regime you cannot.",
    },
  ],

  "salary-structure": [
    {
      question: "What is basic salary and why do you need it?",
      answer:
        "Your salary is split into parts — basic, HRA, special allowance and so on. Basic is the foundation. Your PF is 12% of it, and your rent benefit is calculated as a percentage of it. So a higher basic usually means a bigger rent benefit in the old regime.",
    },
    {
      question: "Where do I find my basic salary?",
      answer:
        'Open any payslip. On the earnings side, the first and largest line is almost always "Basic" or "Basic Pay". If your payslip shows "DA" or "Dearness Allowance" too, add the two together.',
    },
    {
      question: "Why is my PF exactly ₹1,800 every month?",
      answer:
        "The law only requires PF on the first ₹15,000 of basic salary a month. 12% of ₹15,000 is ₹1,800, and many companies stop there. If yours does, your basic is above ₹15,000 but we can't tell how much above — so please type it in.",
    },
    {
      question: "Does PF reduce my tax?",
      answer:
        "Your own PF contribution counts towards the ₹1.5 lakh 80C limit in the old regime, so yes, it reduces your old-regime tax. In the new regime it does not help at all. The company's PF share is a separate thing and is generally not taxed.",
    },
    {
      question: "My company doesn't deduct PF. Is that a problem?",
      answer:
        "Not for this calculator. PF isn't compulsory for every employer — small companies and some contracts are outside it. It just means you have one less thing counting towards 80C.",
    },
    {
      question: "I contribute extra to PF (VPF). Where does that go?",
      answer:
        "Add it to the PF amount here. Voluntary PF counts towards the same ₹1.5 lakh 80C limit as regular PF.",
    },
  ],

  rent: [
    {
      question: "How is the rent benefit actually worked out?",
      answer:
        "The law takes three amounts and gives you the smallest one: the HRA you actually receive, 50% of your basic (40% outside the four metro cities), and your rent minus 10% of your basic. Whichever is lowest is the amount that becomes tax-free.",
    },
    {
      question: "Why did I get zero rent benefit even though I pay rent?",
      answer:
        "Two common reasons. Either your salary has no HRA component at all, or your rent is less than 10% of your basic salary — in that case the third calculation comes out negative and the benefit is nil.",
    },
    {
      question: "Does the rent benefit work in the new regime?",
      answer:
        "No. This is the single biggest thing the old regime has that the new one doesn't. If you pay high rent in a metro city, that's usually what tips the answer towards the old regime.",
    },
    {
      question: "I pay rent to my parents. Does that count?",
      answer:
        "Yes, it's allowed if you genuinely pay them and they own the house. But it has to be real — actual bank transfers, and your parents must declare that rent as their own income. A paper arrangement can be rejected.",
    },
    {
      question: "Do I need my landlord's PAN?",
      answer:
        "If your rent is more than ₹1,00,000 for the year, your employer will ask for your landlord's PAN before giving you the benefit in your payslip. Without it, you can still claim it while filing your return, but be ready to justify it.",
    },
    {
      question: "I live in a company-provided flat. What do I enter?",
      answer:
        "Choose \"No\" for paying rent. Company accommodation is treated as a perquisite and taxed differently — this calculator doesn't handle that, so your result will be approximate.",
    },
  ],

  investments: [
    {
      question: "What is this ₹1.5 lakh limit everyone talks about?",
      answer:
        "It's called Section 80C. The government lets you subtract up to ₹1.5 lakh a year from your income if you put that money into certain approved places — PF, PPF, ELSS, life insurance, children's tuition, home loan principal and a few others. It's a single shared limit, not ₹1.5 lakh per item.",
    },
    {
      question: "Do my regular SIPs count?",
      answer:
        "Only if they're in an ELSS fund, which has a three-year lock-in. A SIP in a regular index fund or flexi-cap fund gives you no 80C benefit, even though it's a great way to invest.",
    },
    {
      question: "Is my health insurance part of this ₹1.5 lakh?",
      answer:
        "No. Health insurance has its own separate limit and its own rule. We'll ask about it on the very next step.",
    },
    {
      question: "I've already crossed ₹1.5 lakh. Should I invest more?",
      answer:
        "Not for tax reasons under this rule — the extra gives you nothing back. There is one separate route: ₹50,000 in NPS sits outside the ₹1.5 lakh limit. We'll ask about that shortly.",
    },
    {
      question: "Does any of this help in the new regime?",
      answer:
        "No. The new regime removes all of it. That's the trade — lower rates, but no reward for saving. This is exactly the comparison we're running for you.",
    },
    {
      question: "Is the home loan EMI I pay counted here?",
      answer:
        "Only the principal part. The interest part is a separate and usually much bigger benefit, and we'll ask about it in two steps.",
    },
  ],

  health: [
    {
      question: "How much health insurance can I actually claim?",
      answer:
        "₹25,000 for you, your spouse and your children — or ₹50,000 if you yourself are 60 or above. On top of that, another ₹25,000 for your parents, or ₹50,000 if either parent is 60 or above. The biggest possible total is ₹1,00,000.",
    },
    {
      question: "My company gives me health insurance. Can I claim it?",
      answer:
        'Only the part you pay for yourself. If the company pays the whole premium, there\'s nothing for you to claim. If they deduct a "top-up" premium from your salary, that part counts.',
    },
    {
      question: "Does the ₹5,000 check-up amount get added on top?",
      answer:
        "No, and this trips up a lot of people. The ₹5,000 sits inside your ₹25,000 or ₹50,000 limit, not above it. It is the only part of this rule you're allowed to pay for in cash.",
    },
    {
      question: "Can I pay the premium in cash?",
      answer:
        "No. Insurance premiums must be paid by card, UPI, net banking or cheque to be claimed. Cash is only allowed for the ₹5,000 preventive check-up portion.",
    },
    {
      question: "Does health insurance help in the new regime?",
      answer: "No. Like everything else on this step, it only works in the old regime.",
    },
    {
      question: 'What counts as a "serious illness" for the extra deduction?',
      answer:
        "The law names a specific list — including cancer, chronic kidney failure, AIDS, haemophilia, thalassaemia and certain neurological conditions such as Parkinson's and motor neurone disease. You need a prescription from a specialist doctor.",
    },
  ],

  "home-nps": [
    {
      question: "Where do I find my home loan interest amount?",
      answer:
        'Log in to your bank or housing finance company\'s website and look for "provisional interest certificate" or "home loan statement". It\'s a one-page document that splits your year\'s EMIs into principal and interest. Your employer asks for the same document.',
    },
    {
      question: "Why can I only claim ₹2 lakh of interest?",
      answer:
        "That's the cap the law sets for a house you live in yourself. If you paid ₹3 lakh of interest, only ₹2 lakh reduces your income. The cap applies across all the houses you live in, not per house.",
    },
    {
      question: "Does my home loan help in the new regime?",
      answer:
        "Not for the home you live in — neither the interest nor the principal. This is often the single biggest reason a home-loan borrower is better off in the old regime.",
    },
    {
      question: "What's the difference between the ₹50,000 NPS deduction and the ₹1.5 lakh one?",
      answer:
        "Money you put into NPS yourself can be claimed in two places. The first ₹1.5 lakh shares the crowded 80C limit with your PF and everything else. But there's a special extra ₹50,000 that sits completely outside it — so if your ₹1.5 lakh is already full, NPS is the only way to deduct more.",
    },
    {
      question: "Is NPS a good investment or just a tax trick?",
      answer:
        "It's genuinely low-cost and it invests in market instruments, but the money is locked until you turn 60, and at retirement you must use at least 40% of it to buy an annuity. It's a real retirement product with a tax benefit attached, not a short-term saving. Decide on the merits, not only the deduction.",
    },
    {
      question: "My employer doesn't offer NPS. Can I ask for it?",
      answer:
        "Yes, and it costs your employer nothing extra if it's carved out of your existing CTC. Many HR teams will do it on request. It's the only deduction left in the new regime, so it's worth asking about.",
    },
  ],

  "other-income": [
    {
      question: "The bank already deducted TDS on my FD. Do I still have to declare it?",
      answer:
        "Yes. TDS is usually only 10%, but your FD interest is taxed at your slab rate, which could be 20% or 30%. So TDS is a part payment, not the final settlement. You still declare the full interest and pay any difference.",
    },
    {
      question: "Where can I find my total interest for the year?",
      answer:
        "Log in to the income tax website and open your AIS — the Annual Information Statement. It lists interest reported by every bank against your PAN. It's the same data the department has, so it's the safest source.",
    },
    {
      question: "What's the difference between savings interest and FD interest?",
      answer:
        "For tax, a lot. If you're under 60, up to ₹10,000 of savings account interest is deductible in the old regime — but FD interest gets nothing. If you're 60 or above, a bigger ₹50,000 deduction covers both together.",
    },
    {
      question: "Is PPF interest taxable?",
      answer:
        "No. PPF interest is completely tax-free and you don't declare it here. Same for EPF interest in most cases, and for interest on tax-free bonds.",
    },
    {
      question: "Does any of this help in the new regime?",
      answer:
        "The interest itself is taxable in both regimes. But the deductions on it — the ₹10,000 or ₹50,000 — only exist in the old regime.",
    },
    {
      question: "I have capital gains from selling shares. What do I do?",
      answer:
        "This calculator doesn't handle capital gains, so your result will understate your tax. The regime comparison will still be roughly right for your salary, but please get the final number from a CA or the income tax portal.",
    },
  ],
};
