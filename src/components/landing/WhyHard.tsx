import type { ComponentType, SVGProps } from "react";
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
    <section className="mx-auto max-w-[1200px] px-6 py-24">
      <div className="grid gap-10 md:grid-cols-3">
        {ITEMS.map(({ icon: Icon, heading, copy }) => (
          <div key={heading}>
            <Icon width={28} height={28} className="text-[var(--accent)]" />
            <h3 className="mt-4 text-[20px] font-semibold">{heading}</h3>
            <p className="mt-2 text-[var(--text-muted)]">{copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
