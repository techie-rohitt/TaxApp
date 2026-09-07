const STEPS = [
  {
    title: "Tell us your salary",
    copy: "Start with the amount that hits your bank account each month. We figure out the rest.",
  },
  {
    title: "Answer a few simple questions",
    copy: "Rent, PF, insurance, investments. One topic at a time, with help on every screen.",
  },
  {
    title: "Get your answer",
    copy: "A clear verdict, the full breakdown, and specific ideas to pay less next year.",
  },
];

export function HowItWorksStrip() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <h2 className="mb-12 text-center text-[24px] font-semibold">How it works</h2>
      <div className="relative grid gap-10 md:grid-cols-3">
        <div
          className="absolute top-5 right-[16.6%] left-[16.6%] hidden h-px bg-[var(--border-strong)] md:block"
          aria-hidden="true"
        />
        {STEPS.map((step, i) => (
          <div key={step.title} className="relative text-center md:text-left">
            <div className="relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent)] font-semibold text-white md:mx-0">
              {i + 1}
            </div>
            <h3 className="mt-4 text-[20px] font-semibold">{step.title}</h3>
            <p className="mt-2 text-[var(--text-muted)]">{step.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
