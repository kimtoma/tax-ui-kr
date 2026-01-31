import { useMemo, useState } from "react";
import type { TaxReturn, PendingUpload } from "../lib/schema";
import { getNetIncome, getEffectiveRate } from "../lib/tax-calculations";
import { ReceiptView } from "./ReceiptView";
import { SleepingEarnings } from "./SleepingEarnings";
import { SummaryStats } from "./SummaryStats";
import { SummaryTable } from "./SummaryTable";
import { SummaryReceiptView } from "./SummaryReceiptView";
import { TaxFreedomDay } from "./TaxFreedomDay";
import { LoadingView } from "./LoadingView";

interface CommonProps {
  isChatOpen: boolean;
  onToggleChat: () => void;
}

interface ReceiptProps extends CommonProps {
  view: "receipt";
  data: TaxReturn;
  title: string;
}

interface SummaryProps extends CommonProps {
  view: "summary";
  returns: Record<number, TaxReturn>;
}

interface LoadingProps extends CommonProps {
  view: "loading";
  pendingUpload: PendingUpload;
}

type Props = ReceiptProps | SummaryProps | LoadingProps;

type SummaryViewMode = "table" | "receipt";

export function MainPanel(props: Props) {
  const [summaryViewMode, setSummaryViewMode] = useState<SummaryViewMode>("table");
  const title = props.view === "summary" ? "Today" : props.view === "loading" ? "Processing" : props.title;

  const summaryData = useMemo(() => {
    if (props.view !== "summary") return null;
    const years = Object.keys(props.returns).map(Number).sort((a, b) => a - b);
    const allReturns = years.map((year) => props.returns[year]).filter((r): r is TaxReturn => r !== undefined);

    const totalNetIncome = allReturns.reduce((sum, r) => sum + getNetIncome(r), 0);

    const taxFreedomYears = years
      .map((year) => {
        const r = props.returns[year];
        if (!r) return null;
        return { year, effectiveRate: getEffectiveRate(r) };
      })
      .filter((x): x is { year: number; effectiveRate: number } => x !== null);

    return { totalNetIncome, taxFreedomYears };
  }, [props]);

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Header - visitors.now style */}
      <header className="px-6 py-3 flex items-center justify-between flex-shrink-0 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-4">
          <span className="text-sm">{title}</span>
          {props.view === "summary" && (
            <div className="flex text-sm">
              <button
                onClick={() => setSummaryViewMode("table")}
                className={`px-2 py-1 ${
                  summaryViewMode === "table"
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Table
              </button>
              <button
                onClick={() => setSummaryViewMode("receipt")}
                className={`px-2 py-1 ${
                  summaryViewMode === "receipt"
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                }`}
              >
                Cards
              </button>
            </div>
          )}
        </div>
        <button
          onClick={props.onToggleChat}
          className={`text-sm ${
            props.isChatOpen
              ? "text-[var(--color-text)]"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          Chat
        </button>
      </header>

      {/* Content */}
      {props.view === "loading" ? (
        <LoadingView
          filename={props.pendingUpload.filename}
          year={props.pendingUpload.year}
          status={props.pendingUpload.status}
        />
      ) : props.view === "summary" && summaryData ? (
        summaryViewMode === "table" ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <SummaryStats returns={props.returns} />
            <SleepingEarnings netIncome={summaryData.totalNetIncome} />
            <TaxFreedomDay years={summaryData.taxFreedomYears} />
            <div className="flex-1 overflow-auto">
              <SummaryTable returns={props.returns} />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <SummaryReceiptView returns={props.returns} />
          </div>
        )
      ) : props.view === "receipt" ? (
        <div className="flex-1 overflow-y-auto">
          <ReceiptView data={props.data} />
        </div>
      ) : null}
    </div>
  );
}
