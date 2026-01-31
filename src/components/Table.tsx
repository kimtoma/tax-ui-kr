import {
  type ColumnDef,
  type ColumnSizingState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState, useEffect } from "react";

export interface ColumnMeta {
  align?: "left" | "right";
  borderLeft?: boolean;
  sticky?: boolean;
}

interface TableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  storageKey?: string;
}

export function Table<TData>({ data, columns, storageKey }: TableProps<TData>) {
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>(() => {
    if (storageKey && typeof window !== "undefined") {
      const saved = localStorage.getItem(`${storageKey}-column-sizes`);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return {};
  });

  useEffect(() => {
    if (storageKey && Object.keys(columnSizing).length > 0) {
      localStorage.setItem(
        `${storageKey}-column-sizes`,
        JSON.stringify(columnSizing)
      );
    }
  }, [columnSizing, storageKey]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnSizing,
    },
    onColumnSizingChange: setColumnSizing,
    getCoreRowModel: getCoreRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
  });

  return (
    <div className="border border-[var(--color-border)] overflow-hidden">
      <table className="w-full border-collapse" style={{ minWidth: "max-content" }}>
        <thead className="sticky top-0 z-20">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as ColumnMeta | undefined;
                const alignClass = meta?.align === "right" ? "text-right" : "text-left";
                const stickyClass = meta?.sticky ? "sticky left-0 z-30" : "";

                return (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={`${alignClass} ${stickyClass} py-2 px-4 text-xs text-[var(--color-text-muted)] font-normal relative bg-[var(--color-bg)] border-b border-[var(--color-border)]`}
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-[var(--color-row-hover)]"
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as ColumnMeta | undefined;
                const stickyClass = meta?.sticky ? "sticky left-0 z-10 bg-[var(--color-bg)]" : "";
                const truncateClass = meta?.sticky ? "truncate max-w-[160px]" : "";

                return (
                  <td
                    key={cell.id}
                    className={`py-2 px-4 text-sm ${stickyClass} ${truncateClass}`}
                    style={{ width: cell.column.getSize() }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { type ColumnDef } from "@tanstack/react-table";
export { createColumnHelper } from "@tanstack/react-table";
