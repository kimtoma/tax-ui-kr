import { useMemo } from "react";
import { getTaxFreedomDay, getTodayDayOfYear } from "../lib/tax-freedom";

interface YearData {
  year: number;
  effectiveRate: number;
}

interface Props {
  years: YearData[];
}

const MONTH_LABELS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

export function TaxFreedomDay({ years }: Props) {
  const todayDayOfYear = useMemo(() => getTodayDayOfYear(), []);

  const markers = useMemo(
    () =>
      years
        .map(({ year, effectiveRate }) => ({
          year,
          ...getTaxFreedomDay(effectiveRate),
        }))
        .sort((a, b) => a.dayOfYear - b.dayOfYear),
    [years]
  );

  if (markers.length === 0) return null;

  const avgDayOfYear = Math.round(
    markers.reduce((sum, m) => sum + m.dayOfYear, 0) / markers.length
  );

  return (
    <div className="px-6 py-4">
      {/* Progress bar */}
      <div className="relative">
        <div className="h-6 flex bg-[var(--color-bg-muted)]">
          <div
            className="bg-[var(--color-negative)]/20"
            style={{ width: `${(avgDayOfYear / 365) * 100}%` }}
          />
          <div className="flex-1 bg-[var(--color-positive)]/20" />
        </div>

        {/* Today marker */}
        <div
          className="absolute top-0 h-6 w-px bg-[var(--color-text)]"
          style={{ left: `${(todayDayOfYear / 365) * 100}%` }}
        >
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-text-muted)] whitespace-nowrap">
            Today
          </div>
        </div>

        {/* Tax freedom day marker(s) */}
        {markers.map((marker, i) => (
          <div
            key={marker.year}
            className="absolute top-0 h-6 w-px bg-[var(--color-text)]"
            style={{ left: `${(marker.dayOfYear / 365) * 100}%` }}
          >
            <div
              className="absolute left-1/2 -translate-x-1/2 text-[10px] whitespace-nowrap"
              style={{ bottom: `-${16 + (i % 2) * 12}px` }}
            >
              {marker.year}
            </div>
          </div>
        ))}

        {/* Month labels */}
        <div className="flex justify-between mt-1 text-[10px] text-[var(--color-text-muted)]">
          {MONTH_LABELS.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>

      {/* Label */}
      <div className="mt-6 text-xs text-[var(--color-text-muted)]">
        Tax Freedom Day:{" "}
        <span className="text-[var(--color-text)]">
          {markers.length === 1
            ? markers[0]?.date
            : `${markers[0]?.date} – ${markers[markers.length - 1]?.date}`}
        </span>
      </div>
    </div>
  );
}
