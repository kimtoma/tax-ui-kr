import { Dialog } from "./Dialog";
import { FAQSection } from "./FAQSection";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  skipOpenAnimation?: boolean;
}

export function DemoDialog({ isOpen, onClose, skipOpenAnimation }: Props) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title="Tax UI"
      description="샘플 데이터로 구성된 데모입니다. 자신의 연말정산 서류로 사용하려면 로컬에서 실행하세요."
      size="lg"
      fullScreenMobile
      autoFocusClose
      skipOpenAnimation={skipOpenAnimation}
      footer={<FAQSection />}
    >
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium mb-2">로컬에서 실행</h3>
          <div className="bg-(--color-bg-muted) rounded-lg p-3 font-mono text-sm">
            <div className="text-(--color-text-muted)"># 클론 후 실행</div>
            <div>git clone https://github.com/brianlovin/tax-ui</div>
            <div>cd tax-ui</div>
            <div>bun install</div>
            <div>bun run dev</div>
          </div>
        </div>
        <p className="text-xs text-(--color-text-muted)">
          필요 사항:{" "}
          <a
            href="https://bun.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-(--color-text)"
          >
            Bun
          </a>{" "}
          및{" "}
          <a
            href="https://console.anthropic.com/settings/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-(--color-text)"
          >
            Anthropic API 키
          </a>
        </p>
      </div>
    </Dialog>
  );
}
