import { Link } from "react-router-dom";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
      <div
        className="overflow-hidden rounded-[var(--radius-card)] px-6 py-14 text-center text-white md:py-20"
        style={{ backgroundImage: "var(--brand-gradient)" }}
      >
        <h2 className="text-[26px] font-semibold md:text-[34px]">Stop guessing. Start comparing.</h2>
        <p className="mx-auto mt-3 max-w-[46ch] text-white/85">
          Three minutes, a few honest answers, and a rupee-for-rupee verdict you can trust.
        </p>
        <Link
          to="/calculator"
          className="mt-7 inline-block rounded-[var(--radius-button)] bg-white px-8 py-4 text-lg font-medium text-[var(--accent-text)] hover:opacity-90"
        >
          Find out which regime saves you more →
        </Link>
      </div>
    </section>
  );
}
