/**
 * Minimal inline line icons. No icon library — PRD §25.1 rules out any
 * runtime request to a third party, and §23.1 asks for restraint, not polish.
 */
import type { SVGProps } from "react";

function base(props: SVGProps<SVGSVGElement>) {
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...props,
  };
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5 12.5 9.5 17 19 7" />
    </svg>
  );
}

export function DashIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M5 12h14" />
    </svg>
  );
}

export function DocumentQuestionIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M10 12a2 2 0 1 1 2.8 1.83c-.55.25-.8.7-.8 1.17v.25" />
      <circle cx="12" cy="17.75" r="0.1" fill="currentColor" />
    </svg>
  );
}

export function ChatBubbleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 5h16v11H9l-4 4v-4H4Z" />
      <path d="M8 9h8M8 12h5" />
    </svg>
  );
}

export function BarChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M4 20V10M12 20V4M20 20v-7" />
      <path d="M2 20h20" />
    </svg>
  );
}
