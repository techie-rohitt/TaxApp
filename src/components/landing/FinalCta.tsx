import { Link } from "react-router-dom";

export function FinalCta() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24 text-center">
      <Link
        to="/calculator"
        className="inline-block rounded-[var(--radius-button)] bg-[var(--accent)] px-8 py-4 text-lg font-medium text-white hover:opacity-90"
      >
        Find out which regime saves you more →
      </Link>
    </section>
  );
}
