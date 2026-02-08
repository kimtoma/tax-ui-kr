import type { TaxReturn } from "../lib/schema";
import { formatCurrency, formatPercent } from "../lib/format";
import { getTotalTax } from "../lib/tax-calculations";

interface Props {
  data: TaxReturn;
}

function CategoryHeader({ children }: { children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={2} className="pt-6 pb-2">
        <span className="text-xs text-(--color-text-muted)">{children}</span>
      </td>
    </tr>
  );
}

function DataRow({
  label,
  amount,
  isMuted,
  showSign,
}: {
  label: string;
  amount: number;
  isMuted?: boolean;
  showSign?: boolean;
}) {
  return (
    <tr className={isMuted ? "text-(--color-text-muted)" : ""}>
      <td className="py-1.5 text-sm">{label}</td>
      <td className="py-1.5 text-sm text-right tabular-nums slashed-zero">
        {showSign && amount >= 0 ? "+" : ""}
        {formatCurrency(amount)}
      </td>
    </tr>
  );
}

function TotalRow({
  label,
  amount,
  showSign,
}: {
  label: string;
  amount: number;
  showSign?: boolean;
}) {
  return (
    <>
      <tr>
        <td colSpan={2} className="h-2" />
      </tr>
      <tr className="font-semibold border-t border-(--color-border)">
        <td className="py-2 pt-4 text-sm">{label}</td>
        <td className="py-2 pt-4 text-sm text-right tabular-nums slashed-zero">
          {showSign && amount >= 0 ? "+" : ""}
          {formatCurrency(amount)}
        </td>
      </tr>
    </>
  );
}

function RatesSection({ rates }: { rates: TaxReturn["rates"] }) {
  if (!rates) return null;
  return (
    <>
      <tr>
        <td className="pt-6 pb-2 text-xs text-(--color-text-muted)">
          세율
        </td>
        <td className="pt-6 pb-2 text-xs text-(--color-text-muted) text-right">
          <span className="inline-block w-16">한계</span>
          <span className="inline-block w-16">실효</span>
        </td>
      </tr>
      <tr>
        <td className="py-1.5 text-sm">소득세</td>
        <td className="py-1.5 text-sm text-right tabular-nums slashed-zero">
          <span className="inline-block w-16">
            {formatPercent(rates.marginal)}
          </span>
          <span className="inline-block w-16">
            {formatPercent(rates.effective)}
          </span>
        </td>
      </tr>
    </>
  );
}

export function ReceiptView({ data }: Props) {
  const totalTax = getTotalTax(data);
  const netIncome = data.income.totalSalary - totalTax;
  const grossMonthly = Math.round(data.income.totalSalary / 12);
  const netMonthly = Math.round(netIncome / 12);

  return (
    <div className="px-4 md:px-0 py-4 md:py-8 md:pb-12">
      <div className="max-w-2xl bg-white dark:bg-neutral-900 rounded-lg dark:shadow-contrast mx-auto shadow-md ring-[0.5px] ring-black/5">
        {/* Content Table */}
        <div className="px-6 pb-6">
          <table className="w-full">
            <tbody className="no-zebra">
              <CategoryHeader>월별 내역</CategoryHeader>
              <DataRow label="월 총소득" amount={grossMonthly} />
              <DataRow label="월 순소득" amount={netMonthly} />

              <CategoryHeader>소득</CategoryHeader>
              {data.income.items.map((item, i) => (
                <DataRow key={i} label={item.label} amount={item.amount} />
              ))}
              <TotalRow label="총급여" amount={data.income.totalSalary} />

              <CategoryHeader>근로소득</CategoryHeader>
              <DataRow label="근로소득공제" amount={data.employmentDeduction} isMuted />
              <DataRow label="근로소득금액" amount={data.employmentIncome} />

              <CategoryHeader>소득공제</CategoryHeader>
              {data.incomeDeductions.items.map((item, i) => (
                <DataRow
                  key={i}
                  label={item.label}
                  amount={item.amount}
                  isMuted
                />
              ))}
              <TotalRow label="소득공제 합계" amount={data.incomeDeductions.total} />

              <CategoryHeader>세액 계산</CategoryHeader>
              <DataRow label="과세표준" amount={data.taxBase} />
              <DataRow label="산출세액" amount={data.calculatedTax} />

              <CategoryHeader>세액공제</CategoryHeader>
              {data.taxCredits.items.map((item, i) => (
                <DataRow
                  key={i}
                  label={item.label}
                  amount={item.amount}
                  isMuted
                />
              ))}
              <TotalRow label="세액공제 합계" amount={data.taxCredits.total} />

              <CategoryHeader>결정세액</CategoryHeader>
              <DataRow label="결정세액" amount={data.determinedTax} />
              <DataRow label="지방소득세" amount={data.localIncomeTax} />
              <TotalRow label="총 세금" amount={totalTax} />

              <CategoryHeader>정산</CategoryHeader>
              <DataRow label="기납부 소득세" amount={data.taxAlreadyPaid.incomeTax} isMuted />
              <DataRow label="기납부 지방세" amount={data.taxAlreadyPaid.localTax} isMuted />
              <DataRow label="기납부세액 합계" amount={data.taxAlreadyPaid.total} />
              <TotalRow
                label={data.settlement.total <= 0 ? "환급" : "추가납부"}
                amount={data.settlement.total}
                showSign
              />

              <RatesSection rates={data.rates} />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
