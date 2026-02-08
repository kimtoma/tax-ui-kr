# Tax UI

한국 연말정산 PDF 파서. Claude API와 Bun 기반.

## 스택

- Bun (HTML imports, React 프론트엔드)
- Anthropic SDK (PDF 파싱: Sonnet 4.5, 분류/연도추출: Haiku 4.5)
- Tailwind CSS v4
- Zod v4 (스키마 검증)
- Base UI (접근성 프리미티브)
- TanStack Table (데이터 테이블)
- Motion (애니메이션)

## 명령어

- `bun run dev` — 개발 서버 시작 (HMR)
- `bun run build` — 프로덕션 빌드
- `bun test` — 테스트 실행

## 아키텍처

- `src/index.ts` — Bun.serve() 서버, API 라우트 (/api/parse, /api/chat, /api/suggestions)
- `src/lib/parser.ts` — Claude API PDF 파싱 및 병합
- `src/lib/classifier.ts` — PDF 페이지 분류 (withholding_receipt, income_detail 등)
- `src/lib/selector.ts` — 페이지 우선순위 선택
- `src/lib/prompt.ts` — 파싱 프롬프트 및 라벨 정규화
- `src/lib/schema.ts` — TaxReturn Zod 스키마 (연말정산 구조)
- `src/lib/tax-calculations.ts` — 한국 소득세율표 (6%~45%, 8구간)
- `src/lib/summary.ts` — 연도별 집계 (AggregatedSummary)
- `src/lib/format.ts` — 원화 포맷 (만/억 단위)
- `src/lib/storage.ts` — 로컬 파일 저장
- `src/App.tsx` — React 프론트엔드 진입점

## 연말정산 도메인

한국 연말정산 흐름:
```
총급여 → 근로소득공제 → 근로소득금액 → 소득공제 → 과세표준
→ 산출세액 → 세액공제 → 결정세액 → 지방소득세(10%)
→ 기납부세액 → 차감징수세액 (환급/추가납부)
```

주요 스키마 필드:
- `income.totalSalary` — 총급여
- `employmentDeduction` — 근로소득공제
- `employmentIncome` — 근로소득금액
- `incomeDeductions` — 소득공제 (국민연금, 건강보험, 신용카드 등)
- `taxBase` — 과세표준
- `calculatedTax` — 산출세액
- `taxCredits` — 세액공제 (근로소득세액공제, 자녀세액공제 등)
- `determinedTax` — 결정세액
- `localIncomeTax` — 지방소득세 (결정세액의 10%)
- `taxAlreadyPaid` — 기납부세액
- `settlement` — 차감징수세액 (음수=환급, 양수=추가납부)

## 컴포넌트

`src/components/`의 공통 컴포넌트 사용:
- `Button` — 모든 버튼 (variants: primary, secondary, ghost, outline, danger, pill)
- `Dialog` — 모달 및 다이얼로그 (Base UI Dialog 래퍼)
- `Menu` / `MenuItem` — 드롭다운 메뉴
- `Tooltip` — 호버 툴팁
- `Tabs` — `@base-ui/react/tabs` 사용

새 UI 패턴 추가 시 Base UI 프리미티브 먼저 확인: https://base-ui.com

## 패턴

### 모달 상태
상호 배타적인 모달은 단일 union 상태 사용:
```tsx
const [openModal, setOpenModal] = useState<"settings" | "reset" | null>(null);
```
각 모달에 별도 boolean 사용 금지.

### 통화 포맷
모든 금액은 원화(KRW)로 표시. `formatCurrency()` 및 `formatCompact()` 사용:
- `formatCurrency(52000000)` → `"52,000,000원"`
- `formatCompact(52000000)` → `"5200만"`
- `formatCompact(250000000)` → `"2.5억"`

### 세율
한국 소득세는 단일 체계 (federal/state 구분 없음):
- 소득세: 6%~45% (8구간 누진세)
- 지방소득세: 결정세액의 10% (별도 계산 불필요, 고정)

## 검증

변경 후 타입 체크:
- `bunx tsc --noEmit`

테스트 실행:
- `bun test`

`bun run build`는 실행하지 마세요. 개발 서버가 HMR을 사용하므로 빌드 불필요.
