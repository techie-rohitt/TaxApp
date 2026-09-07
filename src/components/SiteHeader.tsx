import { NavLink } from "react-router-dom";
import logoIcon from "../assets/logo-icon.png";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/calculator", label: "Calculator", end: false },
  { to: "/how-it-works", label: "How it works", end: false },
  { to: "/privacy", label: "Privacy", end: false },
  { to: "/contact", label: "Contact", end: false },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-6 py-3">
        <NavLink to="/" className="flex items-center gap-2">
          <img src={logoIcon} alt="" className="h-9 w-9 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-base font-bold tracking-tight">
              <span className="text-[var(--accent-text)]">Tax</span>
              <span className="text-[var(--accent)]">Compare</span>
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">by Rohit</span>
          </span>
        </NavLink>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `min-h-[44px] py-1 leading-[44px] font-medium transition-colors ${
                  isActive
                    ? "text-[var(--accent)] underline underline-offset-4"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
