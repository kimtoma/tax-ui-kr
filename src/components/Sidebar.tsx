import { useRef } from "react";

interface FileItem {
  id: string;
  label: string;
}

interface Props {
  items: FileItem[];
  selectedId: string;
  onSelect: (id: string) => void;
  onUpload: (file: File) => void;
  isUploading: boolean;
}

export function Sidebar({ items, selectedId, onSelect, onUpload, isUploading }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      onUpload(file);
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file?.type === "application/pdf") {
      onUpload(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <aside className="w-70 flex-shrink-0 border-r border-[var(--color-border)] flex flex-col h-screen">
      <header className="px-4 py-3 border-b border-[var(--color-border)]">
        <h1 className="text-sm font-bold tracking-tight">Tax UI</h1>
      </header>

      <div className="p-3">
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={[
            "border border-dashed px-3 py-2 text-xs text-center cursor-pointer transition-colors",
            "border-[var(--color-border)]",
            isUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-[var(--color-text)]/5",
          ].join(" ")}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? "Uploading..." : "upload..."}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={[
              "w-full px-4 py-1.5 text-left text-sm flex items-center justify-between",
              "hover:bg-[var(--color-text)]/5 transition-colors",
              selectedId === item.id ? "font-medium" : "",
            ].join(" ")}
          >
            <span>{item.label}</span>
            {selectedId === item.id && (
              <span className="text-[var(--color-muted)]">&gt;</span>
            )}
          </button>
        ))}
      </nav>
    </aside>
  );
}
