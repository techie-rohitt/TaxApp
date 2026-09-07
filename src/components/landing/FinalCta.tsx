import { Link } from "react-router-dom";
import { Reveal } from "../Reveal";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-16 sm:px-6 md:py-24">
      <Reveal
        as="div"
        className="relative overflow-hidden rounded-[var(--radius-card)] px-6 py-14 text-center text-white md:py-20"
        style={{ backgroundImage: "var(--brand-gradient)" }}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="blob absolute -top-10 -left-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="blob-alt absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        </div>
        <div className="relative">
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
      </Reveal>
    </section>
  );
}
