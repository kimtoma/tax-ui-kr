const currencyFormatter = new Intl.NumberFormat("ko-KR", {
  style: "decimal",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function formatCurrency(amount: number, showSign = false): string {
  const formatted = currencyFormatter.format(Math.abs(amount)) + "원";
  if (showSign) {
    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  }
  return amount < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function formatPercentChange(current: number, previous: number): string {
  const change = ((current - previous) / Math.abs(previous)) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(1)}%`;
}

export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  if (abs >= 100_000_000) {
    const value = abs / 100_000_000;
    return `${sign}${value.toFixed(value >= 10 ? 0 : 1)}억`;
  }
  if (abs >= 10_000) {
    const value = abs / 10_000;
    return `${sign}${value.toFixed(value >= 1000 ? 0 : 0)}만`;
  }
  return `${sign}${abs.toFixed(0)}원`;
}

export function formatCurrencyCents(amount: number, suffix?: string): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  let value: string;
  if (abs >= 0.01) {
    value = abs.toFixed(0);
  } else {
    value = parseFloat(abs.toFixed(1)).toString();
  }

  const formatted = `${sign}${value}원`;
  return suffix ? `${formatted}/${suffix}` : formatted;
}
