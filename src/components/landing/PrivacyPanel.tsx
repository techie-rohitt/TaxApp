import { Link } from "react-router-dom";
import { LockIcon } from "../icons";

export function PrivacyPanel() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-10 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.03)] md:p-14">
        <LockIcon width={32} height={32} className="text-[var(--accent)]" />
        <h2 className="mt-5 text-[24px] font-semibold md:text-[32px]">
          Your salary never leaves this browser.
        </h2>
        <p className="mt-4 max-w-[70ch] text-[var(--text-muted)]">
          There is no server. There is no database. There is no account to create. Every
          calculation on this site runs in JavaScript on your own device. We do not use
          analytics, we do not use cookies for tracking, and we could not see your numbers even
          if we wanted to. Close the tab and it&apos;s gone.
        </p>
        <Link
          to="/privacy"
          className="mt-5 inline-block font-medium text-[var(--accent-text)] hover:underline"
        >
          Read the full privacy note →
        </Link>
      </div>
    </section>
  );
}
