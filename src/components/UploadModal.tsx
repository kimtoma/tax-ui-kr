import { useState, useRef, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, apiKey: string) => Promise<void>;
  hasStoredKey: boolean;
  pendingFile: File | null;
}

export function UploadModal({ isOpen, onClose, onUpload, hasStoredKey, pendingFile }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = pendingFile || file;
  const needsApiKey = !hasStoredKey && !apiKey.trim();
  const showFileUpload = !pendingFile;

  useEffect(() => {
    if (!isOpen) {
      setFile(null);
      setApiKey("");
      setError(null);
    }
  }, [isOpen]);

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      setError("Please upload a PDF file");
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const selectedFile = e.target.files?.[0];
    if (selectedFile?.type === "application/pdf") {
      setFile(selectedFile);
    } else if (selectedFile) {
      setError("Please upload a PDF file");
    }
  }

  async function handleSubmit() {
    if (needsApiKey) {
      setError("Please enter your API key");
      return;
    }
    if (!activeFile) {
      setError("Please select a PDF file");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onUpload(activeFile, apiKey.trim());
      setFile(null);
      setApiKey("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process PDF");
    } finally {
      setIsLoading(false);
    }
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-[var(--color-bg)] border border-[var(--color-border)] max-w-md w-full p-6 font-mono">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold">
            {pendingFile ? "Enter API Key" : "Upload Tax Return"}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[var(--color-muted)] hover:text-[var(--color-text)] disabled:opacity-50 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {pendingFile && (
          <div className="mb-6 p-3 border border-[var(--color-border)]">
            <p className="text-sm font-medium">{pendingFile.name}</p>
            <p className="text-xs text-[var(--color-muted)] mt-1">
              {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}

        {!hasStoredKey && (
          <div className="mb-6">
            <label className="block text-sm mb-2">Anthropic API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              disabled={isLoading}
              className="w-full px-3 py-2 border border-[var(--color-border)] bg-transparent text-[var(--color-text)] font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-text)] disabled:opacity-50"
            />
            <p className="text-xs text-[var(--color-muted)] mt-2">
              Saved to .env in this project directory.
            </p>
          </div>
        )}

        {showFileUpload && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isLoading && fileInputRef.current?.click()}
            className={[
              "border-2 border-dashed p-8 text-center cursor-pointer transition-colors",
              isDragging ? "border-[var(--color-text)] bg-[var(--color-text)]/5" : "border-[var(--color-border)]",
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:border-[var(--color-text)]",
            ].join(" ")}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              disabled={isLoading}
              className="hidden"
            />
            {file ? (
              <>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-[var(--color-muted)] mt-1">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            ) : (
              <>
                <p className="text-sm">Drop your tax return PDF here</p>
                <p className="text-xs text-[var(--color-muted)] mt-1">or click to browse</p>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 border border-red-500 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="mt-6 p-3 bg-[var(--color-text)]/5 text-xs text-[var(--color-muted)]">
          <strong>Privacy:</strong> Your tax return is sent directly to Anthropic's API.
          Data is stored locally in .tax-returns.json (gitignored).{" "}
          <a
            href="https://www.anthropic.com/legal/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-[var(--color-text)]"
          >
            Anthropic's privacy policy
          </a>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isLoading || needsApiKey || !activeFile}
          className="mt-6 w-full py-3 bg-[var(--color-text)] text-[var(--color-bg)] font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {isLoading ? "Processing..." : "Parse Tax Return"}
        </button>
      </div>
    </div>
  );
}
