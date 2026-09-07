import { Link } from "react-router-dom";
import { LockIcon } from "../components/icons";

export default function Privacy() {
  return (
    <div className="mx-auto flex max-w-[700px] flex-col gap-6 px-6 py-12">
      <LockIcon width={32} height={32} className="text-[var(--accent)]" />

      <h1 className="text-[32px] font-semibold">Nothing you type here leaves your device.</h1>

      <div className="flex flex-col gap-4 text-[var(--text-muted)]">
        <p>
          This site has no server, no database and no account system. When you open it, your
          browser downloads a small program and runs it locally. Everything after that — reading
          your inputs, calculating your tax, showing your result — happens on your own machine.
        </p>
        <p>
          We don&apos;t use analytics. We don&apos;t set cookies. We don&apos;t load anything from
          other companies&apos; servers. The one exception is the{" "}
          <Link to="/contact" className="underline">
            Contact
          </Link>{" "}
          page — it opens your own email app with a message addressed to us; nothing is sent
          through a server we run.
        </p>
        <p>
          Your answers are kept in your browser&apos;s session memory so you don&apos;t lose them
          if you refresh the page. Close the tab and they&apos;re gone. You can also clear them at
          any time with the &quot;Clear my data&quot; button.
        </p>
        <p>
          We could not see your salary even if we wanted to. That is a property of how the site is
          built, not a promise we&apos;re asking you to trust.
        </p>
      </div>

      <Link to="/calculator" className="text-sm font-medium text-[var(--accent-text)] hover:underline">
        ← Back to the calculator
      </Link>
    </div>
  );
}
