import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logoIcon from "../assets/logo-icon.png";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/calculator", label: "Calculator", end: false },
  { to: "/how-it-works", label: "How it works", end: false },
  { to: "/privacy", label: "Privacy", end: false },
];

function Brand() {
  return (
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
  );
}

function navLinkClass({ isActive }: { isActive: boolean }) {
  return `font-medium transition-colors ${
    isActive
      ? "text-[var(--accent)] underline underline-offset-4"
      : "text-[var(--text-muted)] hover:text-[var(--text)]"
  }`;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close the mobile menu on every navigation.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Brand />

        <nav aria-label="Main" className="hidden items-center gap-x-6 text-sm md:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-11 w-11 flex-col items-center justify-center gap-1.5 rounded-[var(--radius-button)] md:hidden"
        >
          <span
            className={`h-0.5 w-6 rounded-full bg-[var(--text)] transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 rounded-full bg-[var(--text)] transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 rounded-full bg-[var(--text)] transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="flex flex-col gap-1 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-2 md:hidden"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex min-h-[44px] items-center rounded-[var(--radius-button)] px-2 text-base ${navLinkClass({ isActive })}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
