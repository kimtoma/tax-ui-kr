import { useRef } from "react";
import { Menu } from "@base-ui/react/menu";
import { BrailleSpinner } from "./BrailleSpinner";

interface FileItem {
  id: string;
  label: string;
  isPending?: boolean;
  status?: "extracting-year" | "parsing";
}

interface Props {
  items: FileItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUpload: (files: File[]) => void;
  onDelete: (id: string) => void;
  isUploading: boolean;
  isDark: boolean;
  onToggleDark: () => void;
  onConfigureApiKey: () => void;
}

export function Sidebar({ items, selectedId, onSelect, onUpload, onDelete, isUploading, isDark, onToggleDark, onConfigureApiKey }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      onUpload(files);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).filter(
      (file) => file.type === "application/pdf"
    );
    if (files.length > 0) {
      onUpload(files);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const canDelete = (id: string) => id !== "demo" && id !== "summary" && !id.startsWith("pending:");

  return (
    <aside className="w-56 flex-shrink-0 bg-[var(--color-bg)] flex flex-col h-screen border-r border-[var(--color-border)]">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[var(--color-text)] flex items-center justify-center">
            <span className="text-[var(--color-bg)] text-xs font-medium">T</span>
          </div>
          <span className="text-sm font-medium">Taxes</span>
        </div>
        <Menu.Root>
          <Menu.Trigger className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5" />
              <circle cx="8" cy="8" r="1.5" />
              <circle cx="8" cy="13" r="1.5" />
            </svg>
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner sideOffset={4}>
              <Menu.Popup className="bg-[var(--color-bg)] border border-[var(--color-border)] py-1 min-w-[140px] text-sm">
                <Menu.Item
                  onClick={onConfigureApiKey}
                  className="px-3 py-1.5 cursor-pointer hover:bg-[var(--color-bg-muted)] data-[highlighted]:bg-[var(--color-bg-muted)] outline-none"
                >
                  API Key
                </Menu.Item>
                <Menu.Item
                  onClick={onToggleDark}
                  className="px-3 py-1.5 cursor-pointer hover:bg-[var(--color-bg-muted)] data-[highlighted]:bg-[var(--color-bg-muted)] outline-none"
                >
                  {isDark ? "Light Mode" : "Dark Mode"}
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </header>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => (
          <div key={item.id} className="group relative">
            <button
              onClick={() => onSelect(item.id)}
              className={[
                "w-full px-4 py-2 text-left text-sm flex items-center justify-between",
                selectedId === item.id
                  ? "text-[var(--color-text)] font-medium"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]",
                item.isPending ? "opacity-60" : "",
              ].join(" ")}
            >
              <span className="flex items-center gap-2">
                {item.isPending && <BrailleSpinner className="text-xs" />}
                <span>{item.label}</span>
              </span>
            </button>

            {canDelete(item.id) && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                <Menu.Root>
                  <Menu.Trigger
                    onClick={(e) => e.stopPropagation()}
                    className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <circle cx="8" cy="3" r="1.5" />
                      <circle cx="8" cy="8" r="1.5" />
                      <circle cx="8" cy="13" r="1.5" />
                    </svg>
                  </Menu.Trigger>
                  <Menu.Portal>
                    <Menu.Positioner sideOffset={4}>
                      <Menu.Popup className="bg-[var(--color-bg)] border border-[var(--color-border)] py-1 min-w-[80px] text-sm">
                        <Menu.Item
                          onClick={() => onDelete(item.id)}
                          className="px-3 py-1.5 cursor-pointer text-[var(--color-negative)] hover:bg-[var(--color-bg-muted)] data-[highlighted]:bg-[var(--color-bg-muted)] outline-none"
                        >
                          Delete
                        </Menu.Item>
                      </Menu.Popup>
                    </Menu.Positioner>
                  </Menu.Portal>
                </Menu.Root>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Upload button */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={[
          "mx-4 mb-4 px-3 py-2 border border-dashed border-[var(--color-border)] text-center cursor-pointer text-sm text-[var(--color-text-muted)]",
          "hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)]",
          isUploading ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
        {isUploading ? "Uploading..." : "+ Upload PDF"}
      </div>
    </aside>
  );
}
