import type { TaxReturn } from "../lib/schema";
import { ReceiptView } from "./ReceiptView";

interface Props {
  data: TaxReturn;
  title: string;
}

export function MainPanel({ data, title }: Props) {
  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      <header className="px-6 py-3 border-b border-[var(--color-border)] flex items-center justify-between flex-shrink-0">
        <h2 className="text-sm font-bold">{title}</h2>
        <span className="text-xs text-[var(--color-muted)]">Compare to</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <ReceiptView data={data} />
      </div>
    </div>
  );
}
