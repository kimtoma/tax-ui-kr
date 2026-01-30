import { formatCurrency } from "../lib/format";

interface RowProps {
  label: string;
  amount: number;
  showSign?: boolean;
  isTotal?: boolean;
  isMuted?: boolean;
}

export function Row({ label, amount, showSign, isTotal, isMuted }: RowProps) {
  const className = [
    "flex justify-between py-0.5",
    isTotal && "font-semibold",
    isMuted && "text-[var(--color-muted)]",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={className}>
      <span>{label}</span>
      <span>{formatCurrency(amount, showSign)}</span>
    </div>
  );
}

interface RateRowProps {
  label: string;
  marginal: string;
  effective: string;
}

export function RateRow({ label, marginal, effective }: RateRowProps) {
  return (
    <div className="flex justify-between py-0.5">
      <span className="w-32">{label}</span>
      <span className="w-20 text-right">{marginal}</span>
      <span className="w-20 text-right">{effective}</span>
    </div>
  );
}
