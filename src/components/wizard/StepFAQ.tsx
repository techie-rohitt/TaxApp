import type { FaqItem } from "../../content/faqs";

export function StepFAQ({ items }: { items: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <div className="mt-8 border-t border-[var(--border)] pt-6">
      <h2 className="mb-3 text-sm font-semibold text-[var(--text-muted)]">
        Common doubts on this step
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <details key={item.question} className="group rounded-[var(--radius-card)] border border-[var(--border)] px-4 py-3">
            <summary className="cursor-pointer list-none text-sm font-medium marker:content-none">
              {item.question}
            </summary>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{item.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
