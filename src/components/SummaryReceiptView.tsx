import { useMemo, useState } from "react";
import { cn } from "../lib/cn";
import type { TaxReturn } from "../lib/schema";
import { formatPercent } from "../lib/format";
import { aggregateSummary } from "../lib/summary";
import { type TimeUnit, TIME_UNIT_LABELS, convertToTimeUnit, formatTimeUnitValue } from "../lib/time-units";
import { Row, RateRow } from "./Row";
import { Separator, DoubleSeparator, SectionHeader } from "./Section";

interface Props {
  returns: Record<number, TaxReturn>;
}

export function SummaryReceiptView({ returns }: Props) {
  const [timeUnit, setTimeUnit] = useState<TimeUnit>("daily");
  const data = useMemo(() => aggregateSummary(returns), [returns]);

  if (!data) {
    return (
      <div className="max-w-md mx-auto px-6 py-12 font-mono text-sm text-(--color-text-muted)">
        연말정산 데이터가 없습니다.
      </div>
    );
  }

  const timeUnitValue = convertToTimeUnit(data.avgHourlyRate, timeUnit);
  const yearRange = data.years.length > 1
    ? `${data.years[0]}–${data.years[data.years.length - 1]}`
    : String(data.years[0]);

  return (
    <div className="max-w-md mx-auto px-6 py-12 font-mono text-sm">
      <header className="mb-2">
        <h1 className="text-lg font-bold tracking-tight">연말정산 요약</h1>
        <p className="text-(--color-text-muted) text-xs">
          {data.yearCount}년간: {yearRange}
        </p>
      </header>

      <SectionHeader>총소득</SectionHeader>
      <Separator />
      {data.incomeItems.map((item, i) => (
        <Row key={i} label={item.label} amount={item.amount} />
      ))}
      <Separator />
      <Row label="총급여" amount={data.totalIncome} isTotal />

      <SectionHeader>소득공제 합계</SectionHeader>
      <Separator />
      {data.incomeDeductions.map((item, i) => (
        <Row key={i} label={`${item.label} 합계`} amount={item.amount} isMuted />
      ))}
      <Separator />
      <Row label="평균 근로소득금액" amount={Math.round(data.avgEmploymentIncome)} />
      <Row label="평균 과세표준" amount={Math.round(data.avgTaxBase)} />

      <SectionHeader>세액공제 합계</SectionHeader>
      <Separator />
      {data.taxCredits.map((item, i) => (
        <Row key={i} label={`${item.label} 합계`} amount={item.amount} isMuted />
      ))}

      <SectionHeader>세금 합계</SectionHeader>
      <Separator />
      <Row label="결정세액 합계" amount={data.totalDeterminedTax} />
      <Row label="지방소득세 합계" amount={data.totalLocalTax} />
      <Separator />
      <Row label="총 세금" amount={data.totalTax} isTotal />

      <SectionHeader>정산</SectionHeader>
      <Separator />
      <Row
        label={data.totalSettlement <= 0 ? "총 환급액" : "총 추가납부액"}
        amount={data.totalSettlement}
        showSign
      />
      <DoubleSeparator />
      <Row label="순수입" amount={data.netIncome} isTotal />

      {data.rates && (
        <>
          <SectionHeader>평균 세율</SectionHeader>
          <Separator />
          <div className="flex justify-between py-0.5 text-(--color-text-muted) text-xs">
            <span className="w-32" />
            <span className="w-20 text-right">한계</span>
            <span className="w-20 text-right">실효</span>
          </div>
          <RateRow
            label="소득세"
            marginal={formatPercent(data.rates.marginal)}
            effective={formatPercent(data.rates.effective)}
          />
        </>
      )}

      <SectionHeader>월평균</SectionHeader>
      <Separator />
      <Row label="평균 월 총소득" amount={data.grossMonthly} />
      <Row label="평균 월 순소득 (세후)" amount={data.netMonthly} />

      <div className="flex justify-between py-1">
        <span className="flex items-center gap-1">
          평균 {TIME_UNIT_LABELS[timeUnit]} 실수령
          {timeUnit === "hourly" && (
            <span
              className="text-[10px] text-(--color-text-muted) cursor-help"
              title="연간 근무시간 2,080시간 기준 (주 40시간 x 52주)"
            >
              ?
            </span>
          )}
        </span>
        <span className="tabular-nums slashed-zero">{formatTimeUnitValue(timeUnitValue, timeUnit)}</span>
      </div>

      <div className="flex gap-1 mt-1 mb-4">
        {(["daily", "hourly", "minute", "second"] as TimeUnit[]).map((unit) => (
          <button
            key={unit}
            onClick={() => setTimeUnit(unit)}
            className={cn(
              "px-2.5 py-1 text-xs rounded-lg border",
              timeUnit === unit
                ? "border-(--color-text) bg-(--color-text) text-(--color-bg)"
                : "border-(--color-border) text-(--color-text-muted) hover:border-(--color-text-muted)",
            )}
          >
            {TIME_UNIT_LABELS[unit]}
          </button>
        ))}
      </div>

      <footer className="mt-12 pt-4 border-t border-(--color-border) text-(--color-text-muted) text-xs text-center">
        {yearRange} 요약
      </footer>
    </div>
  );
}
