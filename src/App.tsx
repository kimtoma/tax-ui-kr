import { useState, useEffect, useCallback } from "react";
import type { TaxReturn } from "./lib/schema";
import { demoReturn } from "./data/demo";
import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { UploadModal } from "./components/UploadModal";
import "./index.css";

interface AppState {
  returns: Record<number, TaxReturn>;
  hasStoredKey: boolean;
  selectedYear: number | "demo";
  isLoading: boolean;
}

async function fetchInitialState(): Promise<Pick<AppState, "returns" | "hasStoredKey">> {
  const [configRes, returnsRes] = await Promise.all([
    fetch("/api/config"),
    fetch("/api/returns"),
  ]);
  const { hasKey } = await configRes.json();
  const returns = await returnsRes.json();
  return { hasStoredKey: hasKey, returns };
}

export function App() {
  const [state, setState] = useState<AppState>({
    returns: {},
    hasStoredKey: false,
    selectedYear: "demo",
    isLoading: true,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDark, setIsDark] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const years = Object.keys(state.returns).map(Number).sort((a, b) => a - b);
  const items = [
    { id: "demo", label: "Demo" },
    ...years.map((y) => ({ id: String(y), label: String(y) })),
  ];

  useEffect(() => {
    fetchInitialState()
      .then(({ returns, hasStoredKey }) => {
        setState({
          returns,
          hasStoredKey,
          selectedYear: "demo",
          isLoading: false,
        });
      })
      .catch((err) => {
        console.error("Failed to load:", err);
        setState((s) => ({ ...s, isLoading: false }));
      });
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const selectedId = state.selectedYear === "demo" ? "demo" : String(state.selectedYear);
      const selectedIndex = items.findIndex((item) => item.id === selectedId);

      if (e.key === "j" && selectedIndex < items.length - 1) {
        const nextItem = items[selectedIndex + 1];
        if (nextItem) {
          setState((s) => ({
            ...s,
            selectedYear: nextItem.id === "demo" ? "demo" : Number(nextItem.id),
          }));
        }
      }
      if (e.key === "k" && selectedIndex > 0) {
        const prevItem = items[selectedIndex - 1];
        if (prevItem) {
          setState((s) => ({
            ...s,
            selectedYear: prevItem.id === "demo" ? "demo" : Number(prevItem.id),
          }));
        }
      }
    },
    [state.selectedYear, items]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  async function processUpload(file: File, apiKey: string) {
    const formData = new FormData();
    formData.append("pdf", file);
    if (apiKey) formData.append("apiKey", apiKey);

    const res = await fetch("/api/parse", { method: "POST", body: formData });
    if (!res.ok) {
      const { error } = await res.json();
      throw new Error(error || `HTTP ${res.status}`);
    }

    const taxReturn: TaxReturn = await res.json();
    const returnsRes = await fetch("/api/returns");
    const returns = await returnsRes.json();

    setState((s) => ({
      ...s,
      returns,
      hasStoredKey: true,
      selectedYear: taxReturn.year,
    }));
  }

  async function handleUploadFromSidebar(file: File) {
    if (!state.hasStoredKey) {
      setPendingFile(file);
      setIsModalOpen(true);
      return;
    }

    setIsUploading(true);
    try {
      await processUpload(file, "");
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  }

  async function handleUploadFromModal(file: File, apiKey: string) {
    await processUpload(file, apiKey);
    setPendingFile(null);
  }

  function handleSelect(id: string) {
    setState((s) => ({
      ...s,
      selectedYear: id === "demo" ? "demo" : Number(id),
    }));
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-sm">
        Loading...
      </div>
    );
  }

  const taxReturn =
    state.selectedYear === "demo"
      ? demoReturn
      : state.returns[state.selectedYear] || demoReturn;

  const title = state.selectedYear === "demo" ? "Demo" : String(state.selectedYear);

  return (
    <div className="flex h-screen">
      <Sidebar
        items={items}
        selectedId={state.selectedYear === "demo" ? "demo" : String(state.selectedYear)}
        onSelect={handleSelect}
        onUpload={handleUploadFromSidebar}
        isUploading={isUploading}
      />

      <MainPanel data={taxReturn} title={title} />

      <div className="fixed top-4 right-4">
        <button
          onClick={() => setIsDark(!isDark)}
          className="text-xs px-2 py-1 border border-[var(--color-border)] hover:bg-[var(--color-text)] hover:text-[var(--color-bg)] transition-colors font-mono"
        >
          {isDark ? "Light" : "Dark"}
        </button>
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPendingFile(null);
        }}
        onUpload={handleUploadFromModal}
        hasStoredKey={state.hasStoredKey}
        pendingFile={pendingFile}
      />
    </div>
  );
}

export default App;
