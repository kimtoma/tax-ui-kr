import { useState } from "react";
import { Accordion } from "@base-ui/react/accordion";
import { motion } from "motion/react";
import { Button } from "./Button";

const AI_PRIVACY_PROMPT = `I want you to perform a security and privacy audit of Tax UI, an open source tax return parser.

Repository: https://github.com/brianlovin/tax-ui

Please analyze the source code and verify:

1. DATA HANDLING
   - Tax return PDFs are sent directly to Anthropic's API for parsing
   - No data is sent to any other third-party servers
   - Parsed data is stored locally only

2. NETWORK ACTIVITY
   - Identify all network requests in the codebase
   - Verify the only external calls are to Anthropic's API
   - Check for any hidden data collection or tracking

3. API KEY SECURITY
   - Verify API keys are stored locally and not transmitted elsewhere
   - Check that keys are not logged or exposed

4. CODE INTEGRITY
   - Look for obfuscated or suspicious code
   - Review dependencies for anything concerning

Key files to review:
- src/index.ts (Bun server and API routes)
- src/lib/parser.ts (Claude API integration)
- src/lib/storage.ts (Local file storage)
- src/App.tsx (React frontend)

Report any privacy or security concerns. I'm considering using this app with sensitive tax data.`;

export function FAQSection() {
  const [copied, setCopied] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>([]);

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(AI_PRIVACY_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = AI_PRIVACY_PROMPT;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="shrink-0 border-t border-(--color-border) p-4 px-3">
      <Accordion.Root
        className="space-y-px"
        value={openItems}
        onValueChange={setOpenItems}
      >
        <Accordion.Item value="data-safe">
          <Accordion.Header>
            <Accordion.Trigger className="w-full text-sm font-medium cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-lg group focus:outline-none hover:bg-(--color-bg-muted) transition-colors">
              <span>데이터 처리 방식</span>
              <motion.svg
                className="w-4 h-4 text-(--color-text-muted)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: openItems.includes("data-safe") ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel keepMounted>
            <motion.div
              initial={false}
              animate={{
                height: openItems.includes("data-safe") ? "auto" : 0,
                opacity: openItems.includes("data-safe") ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="text-sm text-(--color-text-muted) space-y-2 px-3 pt-1 pb-3">
                <p>
                  세금 데이터는 로컬에서 처리되며, 사용자의 API 키를 통해
                  Anthropic API로 직접 전송됩니다. 어떤 제3자 서버에도
                  데이터가 저장되지 않습니다.
                </p>
                <p>
                  Anthropic의 상업용 약관은 API 고객 데이터로 모델을 학습하는
                  것을 금지합니다.{" "}
                  <a
                    href="https://www.anthropic.com/legal/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-(--color-text)"
                  >
                    개인정보 처리방침
                  </a>
                </p>
              </div>
            </motion.div>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="how-sure">
          <Accordion.Header>
            <Accordion.Trigger className="w-full text-sm font-medium cursor-pointer flex items-center justify-between px-3 py-2.5 rounded-lg group focus:outline-none hover:bg-(--color-bg-muted) transition-colors">
              <span>AI에게 보안과 개인정보 보호 문의</span>
              <motion.svg
                className="w-4 h-4 text-(--color-text-muted)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: openItems.includes("how-sure") ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </motion.svg>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel keepMounted>
            <motion.div
              initial={false}
              animate={{
                height: openItems.includes("how-sure") ? "auto" : 0,
                opacity: openItems.includes("how-sure") ? 1 : 0,
              }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div className="text-sm text-(--color-text-muted) space-y-3 px-3 pt-1 pb-2">
                <p>
                  Tax UI는 오픈소스입니다. 직접 코드를 검토하거나 AI에게
                  보안 감사를 요청할 수 있습니다.
                </p>
                <Button
                  onClick={handleCopyPrompt}
                  variant="secondary"
                  size="sm"
                  className="w-full"
                >
                  {copied ? "복사됨!" : "프롬프트 복사"}
                </Button>
              </div>
            </motion.div>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
