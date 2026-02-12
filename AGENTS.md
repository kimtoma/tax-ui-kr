# AGENTS.md

이 파일은 AI 에이전트가 프로젝트를 이해하고 기여하기 위한 가이드입니다.

## 프로젝트 개요

Tax UI는 한국 연말정산 PDF를 Claude API로 파싱하여 시각화하는 웹 앱입니다. Bun 런타임에서 실행되며, React 프론트엔드와 Bun.serve() 백엔드로 구성됩니다.

## 개발 환경 설정

```bash
bun install
bun run dev      # localhost:3000에서 개발 서버 시작
```

## 핵심 개념

### 인증 흐름

`storage.ts`의 `createAnthropicClient(overrideApiKey?)`로 통합 관리:

1. **폼 API 키** — 사용자가 직접 입력한 일회성 키 (최우선)
2. **저장된 API 키** — `.env`에 저장된 `ANTHROPIC_API_KEY`
3. **Claude Code OAuth** — macOS Keychain에서 자동 읽기 (`claude-code-auth.ts`)

`getAuthStatus()`는 `{ hasKey, authMethod: "api_key" | "oauth" | "none" }`을 반환하며, `/api/config`에서 프론트엔드로 전달됩니다.

### 연말정산 데이터 흐름

1. 사용자가 연말정산 PDF 업로드
2. `classifier.ts`가 PDF 페이지를 유형별로 분류 (Haiku 4.5)
3. `selector.ts`가 중요 페이지를 우선순위에 따라 선택
4. `year-extractor.ts`가 PDF에서 귀속 연도 추출 (Haiku 4.5)
5. `parser.ts`가 선택된 페이지를 파싱하여 구조화된 데이터 반환 (Sonnet 4.5)
6. 파싱된 `TaxReturn` 데이터가 로컬에 저장 (`storage.ts`)
7. 프론트엔드가 데이터를 테이블/영수증 뷰로 렌더링

### 스키마 (`src/lib/schema.ts`)

`TaxReturn` 타입이 핵심 데이터 구조:

```typescript
TaxReturn {
  year: number;
  name: string;
  householdStatus: "세대주" | "세대원";
  dependents: { name, relationship }[];
  income: { items: LabeledAmount[], totalSalary: number };
  employmentDeduction: number;      // 근로소득공제
  employmentIncome: number;          // 근로소득금액
  incomeDeductions: { items, total }; // 소득공제
  taxBase: number;                   // 과세표준
  calculatedTax: number;             // 산출세액
  taxCredits: { items, total };      // 세액공제
  determinedTax: number;             // 결정세액
  localIncomeTax: number;            // 지방소득세 (10%)
  taxAlreadyPaid: { incomeTax, localTax, total };
  settlement: { incomeTax, localTax, total };
  rates?: { marginal, effective };
}
```

### 세금 계산 (`src/lib/tax-calculations.ts`)

- `getTotalTax(r)` = `determinedTax + localIncomeTax`
- `getSettlement(r)` = `settlement.total` (음수=환급, 양수=추가납부)
- 한국 소득세율표: 6%(~1400만), 15%(~5000만), 24%(~8800만), 35%(~1.5억), 38%(~3억), 40%(~5억), 42%(~10억), 45%(10억~)

### 통화 포맷 (`src/lib/format.ts`)

- 모든 금액은 원화(KRW), `ko-KR` 로케일
- `formatCompact()`: 만/억 단위 축약 (예: `2.5억`, `5200만`)
- USD나 달러 표기 사용 금지

## 코드 컨벤션

### 컴포넌트

- `src/components/`에 공통 컴포넌트 정의 (Button, Dialog, Menu, Tooltip)
- 새 UI 패턴은 [Base UI](https://base-ui.com) 프리미티브 우선 사용
- raw HTML 대신 항상 공통 컴포넌트 사용

### 상태 관리

- 상호 배타적 모달은 union 타입으로 관리:
  ```tsx
  useState<"settings" | "reset" | null>(null)
  ```
- 각 모달에 별도 boolean 사용 금지

### 스타일링

- Tailwind CSS v4 사용 (CSS 변수 기반 색상: `--color-text`, `--color-bg`, `--color-border` 등)
- `cn()` 유틸리티로 조건부 클래스 결합 (`clsx` + `tailwind-merge`)
- 다크 모드는 CSS 변수로 자동 지원

### 언어

- 모든 UI 문자열은 한국어
- 코드 주석과 변수명은 영어
- 커밋 메시지는 영어

## 테스트

```bash
bun test                    # 전체 테스트 실행
bun test src/lib/format     # 특정 파일 테스트
```

테스트 파일 위치: `src/lib/*.test.ts`

현재 테스트 범위:
- `format.test.ts` — 원화 포맷, 퍼센트, 숫자 변환
- `time-units.test.ts` — 일급/시급/분급/초급 환산
- `tax-calculations.test.ts` — 세금 계산, 세율표
- `summary.test.ts` — 연도별 집계

## 검증 체크리스트

변경 후 반드시 확인:

1. `bunx tsc --noEmit` — 타입 에러 없음
2. `bun test` — 모든 테스트 통과
3. `bun run dev` — 개발 서버 정상 실행 (선택)

`bun run build`는 실행하지 마세요. 개발 중에는 HMR이 자동 반영합니다.

## 주의 사항

- 한국 세금 체계는 federal/state 구분이 없음 (단일 소득세 + 지방소득세 10%)
- `income.total` 대신 `income.totalSalary` 사용 (총급여)
- 파싱 모델: Sonnet 4.5 (메인), Haiku 4.5 (분류/연도 추출)
- `parser.ts`의 공개 함수는 `Anthropic` 클라이언트 인스턴스를 받음 (apiKey 문자열이 아님)
- Claude Code OAuth는 macOS 전용 (`process.platform === "darwin"`)
- 데모 데이터는 `src/data/sampleData.ts`에 홍길동 4년치 (2021~2024)
