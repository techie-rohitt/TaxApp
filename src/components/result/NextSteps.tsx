/** PRD §10.6 — a short, plain checklist tailored to the winning regime. */
export function NextSteps({ winner }: { winner: "old" | "new" }) {
  const items =
    winner === "new"
      ? [
          "You don't need to do anything special. The new regime is the default — if you never tell your employer otherwise, this is what you get.",
          "You don't need to collect rent receipts, investment proofs or insurance certificates.",
          "You can still change your mind when you file your return in July 2026. Salaried people get to choose fresh every year.",
        ]
      : [
          "Tell your HR or payroll team you want the old regime, ideally at the start of the financial year.",
          "Start collecting proofs now: rent receipts and your landlord's PAN if rent is over ₹1 lakh a year, 80C investment statements, insurance premium receipts, and your bank's home loan interest certificate.",
          "When you file your return, you'll need to submit Form 10-IEA to choose the old regime. Your filing portal or CA handles this.",
          "If your employer has already been deducting tax under the new regime all year, you can still switch when you file — you'll get the extra tax back as a refund.",
        ];

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">What to do next</h2>
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span aria-hidden="true">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
