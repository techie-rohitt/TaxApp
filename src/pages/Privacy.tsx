import { Link } from "react-router-dom";
import { BackgroundBlobs } from "../components/BackgroundBlobs";
import { Reveal } from "../components/Reveal";
import { LockIcon } from "../components/icons";

export default function Privacy() {
  return (
    <div className="relative mx-auto flex max-w-[700px] flex-col gap-6 px-4 py-10 sm:px-6 sm:py-12">
      <BackgroundBlobs className="opacity-60" />

      <Reveal className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
        <LockIcon width={24} height={24} className="text-[var(--accent)]" />
      </Reveal>

      <Reveal delayMs={80}>
        <h1 className="text-[32px] font-semibold">Nothing you type here leaves your device.</h1>
      </Reveal>

      <Reveal delayMs={160} className="flex flex-col gap-4 text-[var(--text-muted)]">
        <p>
          This site has no server, no database and no account system. When you open it, your
          browser downloads a small program and runs it locally. Everything after that — reading
          your inputs, calculating your tax, showing your result — happens on your own machine.
        </p>
        <p>
          We don&apos;t use analytics. We don&apos;t set cookies. We don&apos;t load anything from
          other companies&apos; servers. There is no email box and nothing to sign up for.
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
      </Reveal>

      <Link to="/calculator" className="text-sm font-medium text-[var(--accent-text)] hover:underline">
        ← Back to the calculator
      </Link>
    </div>
  );
}
