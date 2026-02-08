import { useState } from "react";
import { Dialog } from "./Dialog";
import { Button } from "./Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onReset: () => Promise<void>;
}

export function ResetDialog({ isOpen, onClose, onReset }: Props) {
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState("");

  async function handleReset() {
    setIsResetting(true);
    setError("");
    try {
      await onReset();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "초기화에 실패했습니다");
    } finally {
      setIsResetting(false);
    }
  }

  function handleClose() {
    setError("");
    onClose();
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} title="초기화" size="sm">
      <div className="space-y-4">
        <p className="text-sm text-(--color-text-muted)">
          모든 저장된 데이터를 삭제하고 새로 시작합니다. API 키, 연말정산 서류,
          채팅 기록이 모두 삭제됩니다.
        </p>
        <Button
          variant="danger-outline"
          size="sm"
          onClick={handleReset}
          disabled={isResetting}
        >
          {isResetting ? "초기화 중" : "데이터 초기화"}
        </Button>
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
    </Dialog>
  );
}
