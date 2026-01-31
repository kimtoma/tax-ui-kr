import { useMemo, useState } from "react";
import type { TaxReturn } from "../lib/schema";
import { formatCompact } from "../lib/format";
import { getTotalTax, getNetIncome, getEffectiveRate } from "../lib/tax-calculations";
import { type TimeUnit, TIME_UNIT_LABELS, convertToTimeUnit, formatTimeUnitValueCompact } from "../lib/time-units";
import { Sparkline } from "./Sparkline";

interface Props {
  returns: Record<number, TaxReturn>;
}

function getDailyTake(data: TaxReturn): number {
  return Math.round(getNetIncome(data) / 365);
}

function getHourlyTake(data: TaxReturn): number {
  return getNetIncome(data) / 2080; // 40 hrs × 52 weeks
}

function formatChange(current: number, previous: number): string {
  if (previous === 0) return "";
  const change = ((current - previous) / previous) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${change.toFixed(0)}%`;
}

export function SummaryStats({ returns }: Props) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("daily");

  const years = useMemo(
    () => Object.keys(returns).map(Number).sort((a, b) => a - b),
    [returns]
  );

  const stats = useMemo(() => {
    if (years.length === 0) return null;

    const allReturns = years
      .map((year) => returns[year])
      .filter((r): r is TaxReturn => r !== undefined);

    if (allReturns.length === 0) return null;

    // Current year and previous year for change calculation
    const currentYear = years[years.length - 1];
    const prevYear = years.length > 1 ? years[years.length - 2] : null;
    const currentReturn = returns[currentYear];
    const prevReturn = prevYear ? returns[prevYear] : null;

    // Sum across all years
    const totalIncome = allReturns.reduce((sum, r) => sum + r.income.total, 0);
    const totalTaxes = allReturns.reduce((sum, r) => sum + getTotalTax(r), 0);
    const netIncome = totalIncome - totalTaxes;
    const avgEffectiveRate = allReturns.reduce((sum, r) => sum + getEffectiveRate(r), 0) / allReturns.length;

    // Changes from previous year
    const incomeChange = prevReturn ? formatChange(currentReturn.income.total, prevReturn.income.total) : "";
    const taxChange = prevReturn ? formatChange(getTotalTax(currentReturn), getTotalTax(prevReturn)) : "";
    const effectiveChange = prevReturn ? formatChange(getEffectiveRate(currentReturn), getEffectiveRate(prevReturn)) : "";

    // Hourly rates for time unit calculations
    const hourlyRates = allReturns.map((r) => getHourlyTake(r));
    const avgHourlyRate = hourlyRates.reduce((sum, h) => sum + h, 0) / hourlyRates.length;

    // Per-year values for sparklines
    const incomePerYear = allReturns.map((r) => r.income.total);
    const taxesPerYear = allReturns.map((r) => getTotalTax(r));
    const effectivePerYear = allReturns.map((r) => getEffectiveRate(r));
    const netPerYear = allReturns.map((r) => getNetIncome(r));

    return {
      income: { value: totalIncome, change: incomeChange, sparkline: incomePerYear },
      taxes: { value: totalTaxes, change: taxChange, sparkline: taxesPerYear },
      effective: { value: avgEffectiveRate, change: effectiveChange, sparkline: effectivePerYear },
      net: { value: netIncome, sparkline: netPerYear },
      avgHourlyRate,
    };
  }, [returns, years]);

  if (!stats) {
    return null;
  }

  const timeUnitValue = convertToTimeUnit(stats.avgHourlyRate, timeUnit);

  return (
    <div className="px-6 pt-6 pb-2 flex-shrink-0">
      {/* Top stats row - visitors.now style */}
      <div className="flex gap-12 mb-8">
        <div>
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Income</div>
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatCompact(stats.income.value)}
          </div>
          {stats.income.change && (
            <div className={`text-xs mt-0.5 ${stats.income.change.startsWith('+') ? 'text-[var(--color-positive)]' : 'text-[var(--color-negative)]'}`}>
              {stats.income.change}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Taxes</div>
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatCompact(stats.taxes.value)}
          </div>
          {stats.taxes.change && (
            <div className={`text-xs mt-0.5 ${stats.taxes.change.startsWith('+') ? 'text-[var(--color-negative)]' : 'text-[var(--color-positive)]'}`}>
              {stats.taxes.change}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-[var(--color-text-muted)] mb-1">Effective Rate</div>
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {(stats.effective.value * 100).toFixed(1)}%
          </div>
          {stats.effective.change && (
            <div className={`text-xs mt-0.5 ${stats.effective.change.startsWith('+') ? 'text-[var(--color-negative)]' : 'text-[var(--color-positive)]'}`}>
              {stats.effective.change}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-1">
            {TIME_UNIT_LABELS[timeUnit]}
            {timeUnit === "hourly" && (
              <span className="cursor-help" title="Based on 2,080 working hours per year">?</span>
            )}
          </div>
          <div className="text-2xl font-semibold tabular-nums tracking-tight">
            {formatTimeUnitValueCompact(timeUnitValue, timeUnit)}
          </div>
          <div className="flex gap-1 mt-1.5">
            {(["daily", "hourly", "minute", "second"] as TimeUnit[]).map((unit) => (
              <button
                key={unit}
                onClick={() => setTimeUnit(unit)}
                className={`px-1.5 py-0.5 text-[10px] ${
                  timeUnit === unit
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                {unit.charAt(0).toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sparkline chart area - like visitors.now line chart */}
      <div className="h-32 relative border-b border-[var(--color-border)]">
        <Sparkline
          values={stats.net.sparkline}
          width={800}
          height={120}
          className="text-[var(--color-chart)] w-full"
        />
      </div>
    </div>
  );
}
