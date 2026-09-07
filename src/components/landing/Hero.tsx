import { Link } from "react-router-dom";
import { LockIcon } from "../icons";
import { SampleResultCard } from "./SampleResultCard";

const TRUST_ITEMS = ["Takes about 3 minutes", "No sign-up, no email", "Runs entirely on your device"];

export function Hero() {
  return (
    <section className="mx-auto flex max-w-[1200px] flex-col items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 md:min-h-[85vh] md:flex-row md:items-center md:gap-12 md:py-0">
      <div className="md:w-[55%]">
        <span className="inline-block rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
          FY 2025-26 · AY 2026-27 · Updated for Budget 2025
        </span>

        <h1 className="mt-5 text-[36px] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[56px]">
          Find out which tax regime saves you more money.
        </h1>

        <p className="mt-5 max-w-[46ch] text-[var(--text-muted)]">
          Old regime or new regime — most salaried people are guessing. Answer a few simple
          questions about your salary and we&apos;ll show you the exact difference, in rupees.
        </p>

        <p className="mt-4 flex items-start gap-2 text-sm text-[var(--text-muted)]">
          <LockIcon width={18} height={18} className="mt-0.5 shrink-0" />
          Start with what lands in your bank account. No CTC needed. Nothing leaves your browser.
        </p>

        <div className="mt-7 flex flex-wrap items-center gap-5">
          <Link
            to="/calculator"
            className="rounded-[var(--radius-button)] bg-[var(--accent)] px-6 py-3 font-medium text-white hover:opacity-90"
          >
            Calculate my tax — it&apos;s free
          </Link>
          <Link to="/how-it-works" className="text-sm font-medium text-[var(--accent-text)] hover:underline">
            See how we calculate it
          </Link>
        </div>

        <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
          {TRUST_ITEMS.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <span className="inline-block h-1 w-1 rounded-full bg-[var(--text-faint)]" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="md:w-[45%]">
        <SampleResultCard />
      </div>
    </section>
  );
}
