import type { ComponentType, SVGProps } from "react";
import { Reveal } from "../Reveal";
import { BarChartIcon, ChatBubbleIcon, DocumentQuestionIcon } from "../icons";

const ITEMS: { icon: ComponentType<SVGProps<SVGSVGElement>>; heading: string; copy: string }[] = [
  {
    icon: DocumentQuestionIcon,
    heading: "Every calculator asks for your CTC",
    copy: "And almost nobody knows their CTC by heart. You know your salary credit. We start there and work backwards.",
  },
  {
    icon: ChatBubbleIcon,
    heading: "Tax forms don't speak human",
    copy: '"Enter your 80C deductions" is not a question. "Do you put money in PPF or ELSS?" is. We ask the second kind.',
  },
  {
    icon: BarChartIcon,
    heading: "A number without a reason is useless",
    copy: "We show you the slab-by-slab maths for both regimes and explain what each of your answers actually did.",
  },
];

export function WhyHard() {
  return (
    <section className="mx-auto max-w-[1200px] px-6 py-16 md:py-24">
      <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-10">
        {ITEMS.map(({ icon: Icon, heading, copy }, i) => (
          <Reveal
            key={heading}
            delayMs={i * 100}
            className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
              <Icon width={24} height={24} className="text-[var(--accent)]" />
            </span>
            <h3 className="mt-4 text-[20px] font-semibold">{heading}</h3>
            <p className="mt-2 text-[var(--text-muted)]">{copy}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
