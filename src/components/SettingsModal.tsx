import { useState } from "react";
import { Input } from "@base-ui/react/input";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  hasApiKey: boolean;
  onSaveApiKey: (key: string) => Promise<void>;
  onClearData: () => Promise<void>;
}

export function SettingsModal({
  isOpen,
  onClose,
  hasApiKey,
  onSaveApiKey,
  onClearData,
}: Props) {
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [error, setError] = useState("");

  async function handleSaveKey() {
    if (!apiKey.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      await onSaveApiKey(apiKey.trim());
      setApiKey("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "API 키 저장에 실패했습니다");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClearData() {
    setIsClearing(true);
    setError("");
    try {
      await onClearData();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "데이터 삭제에 실패했습니다");
    } finally {
      setIsClearing(false);
    }
  }

  function handleClose() {
    setApiKey("");
    setError("");
    onClose();
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} title="설정">
      <div className="space-y-6">
        {/* API Key Section */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Anthropic API 키
          </label>
          {hasApiKey ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-(--color-text-muted)">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                API 키 설정됨
              </div>
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="새 키를 입력하여 업데이트..."
                autoComplete="off"
                data-1p-ignore
                data-lpignore="true"
                className="w-full px-3 py-2 text-sm bg-(--color-bg-muted) border border-(--color-border) rounded-lg focus:outline-none focus:border-(--color-text-muted)"
              />
            </div>
          ) : (
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-ant-..."
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              className="w-full px-3 py-2 text-sm bg-(--color-bg-muted) border border-(--color-border) rounded-lg focus:outline-none focus:border-(--color-text-muted)"
            />
          )}
          {apiKey.trim() && (
            <Button
              onClick={handleSaveKey}
              disabled={isSaving}
              size="sm"
              className="mt-2"
            >
              {isSaving ? "저장 중..." : "API 키 저장"}
            </Button>
          )}
        </div>

        {/* Clear Data Section */}
        <div className="pt-4 border-t border-(--color-border)">
          <label className="block text-sm font-medium mb-2">
            데이터 관리
          </label>
          <Button
            variant="danger-outline"
            size="sm"
            onClick={handleClearData}
            disabled={isClearing}
          >
            {isClearing ? "초기화 중" : "데이터 초기화"}
          </Button>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    </Dialog>
  );
}
