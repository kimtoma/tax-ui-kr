import { formatCurrency } from "../lib/format";

interface Props {
  netIncome: number;
}

export function SleepingEarnings({ netIncome }: Props) {
  // Spread income across all hours, calculate portion during sleep (8 hours / 24 = 1/3)
  const sleepingEarnings = Math.round(netIncome / 3);

  return (
    <div className="px-6 py-3 text-sm text-[var(--color-text-muted)]">
      You earned <span className="text-[var(--color-text)] tabular-nums">{formatCurrency(sleepingEarnings)}</span> while sleeping
    </div>
  );
}
