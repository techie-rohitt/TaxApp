import { Link } from "react-router-dom";
import { DISCLAIMER_PARAGRAPHS } from "../../content/disclaimer";

const LAST_UPDATED = "5 September 2026";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <div className="mx-auto max-w-[1200px] px-6 py-16">
        <p className="text-sm text-[var(--text-muted)]">
          Rules as per the Income-tax Act, 1961 and the Finance Act, 2025, for FY 2025-26 (AY
          2026-27).
        </p>

        <div className="mt-6 space-y-3 text-xs text-[var(--text-faint)]">
          {DISCLAIMER_PARAGRAPHS.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
          <Link to="/how-it-works" className="hover:underline">
            How it works
          </Link>
          <Link to="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link to="/contact" className="hover:underline">
            Contact
          </Link>
          <span>Last updated {LAST_UPDATED}</span>
        </div>
      </div>
    </footer>
  );
}
