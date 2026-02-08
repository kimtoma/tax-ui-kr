import { useMemo } from "react";
import { createColumnHelper, type ColumnDef } from "@tanstack/react-table";
import type { TaxReturn } from "../lib/schema";
import { formatCurrency, formatPercent } from "../lib/format";
import { getTotalTax } from "../lib/tax-calculations";
import { Table, type ColumnMeta } from "./Table";
import { ChangeCell } from "./ChangeCell";

interface Props {
  returns: Record<number, TaxReturn>;
}

interface SummaryRow {
  id: string;
  category: string;
  label: string;
  isHeader?: boolean;
  values: Record<number, number | undefined>;
  invertPolarity?: boolean;
  showChange?: boolean;
}

function collectRows(returns: Record<number, TaxReturn>): SummaryRow[] {
  const rows: SummaryRow[] = [];
  const allReturns = Object.values(returns);
  const years = Object.keys(returns).map(Number);

  const addRow = (
    category: string,
    label: string,
    getValue: (data: TaxReturn) => number | undefined,
    options?: { invertPolarity?: boolean; showChange?: boolean }
  ) => {
    const values: Record<number, number | undefined> = {};
    for (const year of years) {
      const data = returns[year];
      if (data) values[year] = getValue(data);
    }
    rows.push({
      id: `${category}-${label}-${rows.length}`,
      category,
      label,
      values,
      invertPolarity: options?.invertPolarity,
      showChange: options?.showChange,
    });
  };

  const addHeader = (category: string) => {
    rows.push({
      id: `header-${category}`,
      category,
      label: category,
      isHeader: true,
      values: {},
    });
  };

  // Monthly Breakdown
  addHeader("월별 내역");
  addRow("월별 내역", "월 총소득", (data) =>
    Math.round(data.income.totalSalary / 12),
    { showChange: true }
  );
  addRow("월별 내역", "월 순소득 (세후)", (data) =>
    Math.round((data.income.totalSalary - getTotalTax(data)) / 12),
    { showChange: true }
  );
  addRow("월별 내역", "일 실수령", (data) =>
    Math.round((data.income.totalSalary - getTotalTax(data)) / 12 / 30),
    { showChange: true }
  );

  // Income items
  addHeader("소득");
  const incomeLabels = new Set<string>();
  for (const r of allReturns) {
    for (const item of r.income.items) {
      incomeLabels.add(item.label);
    }
  }
  for (const label of incomeLabels) {
    addRow("소득", label, (data) =>
      data.income.items.find((i) => i.label === label)?.amount
    );
  }
  addRow("소득", "총급여", (data) => data.income.totalSalary, { showChange: true });

  // 근로소득
  addHeader("근로소득");
  addRow("근로소득", "근로소득공제", (data) => data.employmentDeduction);
  addRow("근로소득", "근로소득금액", (data) => data.employmentIncome, { showChange: true });

  // 소득공제
  addHeader("소득공제");
  const deductionLabels = new Set<string>();
  for (const r of allReturns) {
    for (const item of r.incomeDeductions.items) {
      deductionLabels.add(item.label);
    }
  }
  for (const label of deductionLabels) {
    addRow("소득공제", label, (data) =>
      data.incomeDeductions.items.find((i) => i.label === label)?.amount,
      { invertPolarity: true }
    );
  }
  addRow("소득공제", "소득공제 합계", (data) => data.incomeDeductions.total, { invertPolarity: true });

  // 세액 계산
  addHeader("세액 계산");
  addRow("세액 계산", "과세표준", (data) => data.taxBase, { showChange: true });
  addRow("세액 계산", "산출세액", (data) => data.calculatedTax, { invertPolarity: true, showChange: true });

  // 세액공제
  addHeader("세액공제");
  const creditLabels = new Set<string>();
  for (const r of allReturns) {
    for (const item of r.taxCredits.items) {
      creditLabels.add(item.label);
    }
  }
  for (const label of creditLabels) {
    addRow("세액공제", label, (data) =>
      data.taxCredits.items.find((i) => i.label === label)?.amount
    );
  }
  addRow("세액공제", "세액공제 합계", (data) => data.taxCredits.total);

  // 결정세액
  addHeader("결정세액");
  addRow("결정세액", "결정세액", (data) => data.determinedTax, { invertPolarity: true, showChange: true });
  addRow("결정세액", "지방소득세", (data) => data.localIncomeTax, { invertPolarity: true });
  addRow("결정세액", "총 세금", (data) => getTotalTax(data), { invertPolarity: true, showChange: true });

  // 정산
  addHeader("정산");
  addRow("정산", "기납부 소득세", (data) => data.taxAlreadyPaid.incomeTax);
  addRow("정산", "기납부 지방세", (data) => data.taxAlreadyPaid.localTax);
  addRow("정산", "기납부세액 합계", (data) => data.taxAlreadyPaid.total);
  addRow("정산", "차감징수세액", (data) => data.settlement.total, { showChange: true });

  // Rates
  addHeader("세율");
  addRow("세율", "한계세율", (data) => data.rates?.marginal, { invertPolarity: true });
  addRow("세율", "실효세율", (data) => data.rates?.effective, { invertPolarity: true });

  return rows;
}

function formatValue(value: number | undefined, isRate: boolean): string {
  if (value === undefined) return "—";
  if (isRate) return formatPercent(value);
  return formatCurrency(value);
}

const columnHelper = createColumnHelper<SummaryRow>();

export function SummaryTable({ returns }: Props) {
  const years = Object.keys(returns)
    .map(Number)
    .sort((a, b) => a - b); // Oldest first

  const rows = useMemo(() => collectRows(returns), [returns]);

  const columns = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cols: ColumnDef<SummaryRow, any>[] = [
      columnHelper.accessor("label", {
        header: "항목",
        cell: (info) => {
          const row = info.row.original;
          if (row.isHeader) {
            return (
              <div className="pt-2">
                <span className="text-xs text-(--color-text-muted)">
                  {row.label}
                </span>
              </div>
            );
          }
          const isDeduction = row.label.startsWith("−") || row.label.startsWith("–") || row.label.startsWith("- ");
          return (
            <span
              title={info.getValue()}
              className={`block truncate ${isDeduction ? "text-(--color-text-muted)" : "text-(--color-text)"}`}
            >
              {info.getValue()}
            </span>
          );
        },
        meta: {
          sticky: true,
        } satisfies ColumnMeta,
        size: 240,
      }),
    ];

    years.forEach((year, i) => {
      const prevYear = i > 0 ? years[i - 1] : undefined;

      cols.push(
        columnHelper.accessor((row) => row.values[year], {
          id: `year-${year}`,
          header: () => <span className="tabular-nums slashed-zero">{year}</span>,
          cell: (info) => {
            const row = info.row.original;
            if (row.isHeader) {
              return null;
            }

            const value = info.getValue() as number | undefined;
            const isRate = row.category === "세율";
            const prevValue = prevYear !== undefined ? row.values[prevYear] : undefined;

            const isDeduction = row.label.startsWith("−") || row.label.startsWith("–") || row.label.startsWith("- ");

            const isEmpty = value === undefined;

            return (
              <div className="text-right tabular-nums slashed-zero flex items-center justify-end gap-1.5">
                {prevYear !== undefined && row.showChange && (
                  <span className="hidden sm:inline">
                    <ChangeCell
                      current={value}
                      previous={prevValue}
                      invertPolarity={row.invertPolarity}
                    />
                  </span>
                )}
                <span className={isEmpty ? "text-(--color-text-tertiary)" : isDeduction ? "text-(--color-text-muted)" : "text-(--color-text)"}>
                  {formatValue(value, isRate)}
                </span>
              </div>
            );
          },
          meta: {
            align: "right",
            borderLeft: i > 0,
          } satisfies ColumnMeta,
          size: 160,
        })
      );
    });

    return cols;
  }, [years]);

  const getRowClassName = (row: SummaryRow) => {
    if (row.isHeader && row.category !== "월별 내역") {
      return "border-t border-(--color-border)";
    }
    return "";
  };

  const isRowHoverDisabled = (row: SummaryRow) => row.isHeader === true;

  return (
    <div className="text-sm w-full h-full">
      <Table
        data={rows}
        columns={columns}
        storageKey="summary-table"
        getRowClassName={getRowClassName}
        isRowHoverDisabled={isRowHoverDisabled}
      />
    </div>
  );
}
