<img width="1280" height="640" alt="tax-ui-github-og" src="https://github.com/user-attachments/assets/cdeb1215-ba79-4c3a-b108-7798e5cd47a6" />

# Tax UI

한국 연말정산 서류를 시각화하고, 소득공제/세액공제 내역을 한눈에 파악할 수 있는 웹 앱입니다. Claude와 대화하며 연말정산 내역을 분석할 수 있습니다.

## 시작하기

### 1. Bun 설치

Tax UI는 [Bun](https://bun.sh) 런타임을 사용합니다.

```bash
curl -fsSL https://bun.sh/install | bash
```

### 2. Anthropic API 키 발급

연말정산 PDF 파싱에 Claude를 사용합니다. [console.anthropic.com](https://console.anthropic.com/settings/keys)에서 API 키를 발급받으세요.

### 3. 실행

```bash
git clone https://github.com/brianlovin/tax-ui
cd tax-ui
bun install
bun run dev
```

브라우저에서 [localhost:3000](http://localhost:3000)을 엽니다.

## 사용 방법

1. **업로드** - 연말정산 PDF를 업로드합니다 (연도별 1개 PDF)
2. **확인** - 소득, 소득공제, 세액공제, 정산 내역을 시각적으로 확인합니다
3. **대화** - Claude와 대화하며 연말정산 내용을 분석합니다

## 주요 기능

- 연말정산 PDF 자동 파싱 (원천징수영수증, 소득공제명세서 등)
- 총급여, 근로소득공제, 소득공제, 세액공제, 결정세액 시각화
- 연도별 비교 테이블 및 영수증 뷰
- 차감징수세액 (환급/추가납부) 자동 계산
- Claude 채팅으로 연말정산 분석 및 절세 조언

## 기술 스택

- [Bun](https://bun.sh) - JavaScript 런타임 및 서버
- [React 19](https://react.dev) - UI 프레임워크
- [Tailwind CSS v4](https://tailwindcss.com) - 스타일링
- [Anthropic SDK](https://docs.anthropic.com/en/api) - PDF 파싱 (Claude Sonnet 4.5) 및 분류 (Claude Haiku 4.5)
- [Base UI](https://base-ui.com) - 접근성 UI 프리미티브
- [TanStack Table](https://tanstack.com/table) - 데이터 테이블
- [Zod](https://zod.dev) - 스키마 검증
- [Motion](https://motion.dev) - 애니메이션

## 프로젝트 구조

```
src/
├── index.ts                  # Bun.serve() 서버 & API 라우트
├── App.tsx                   # React 앱 진입점
├── lib/
│   ├── schema.ts             # 연말정산 데이터 스키마 (Zod)
│   ├── parser.ts             # Claude API PDF 파싱
│   ├── classifier.ts         # PDF 페이지 분류
│   ├── selector.ts           # 페이지 우선순위 선택
│   ├── prompt.ts             # 파싱 프롬프트
│   ├── year-extractor.ts     # PDF에서 연도 추출
│   ├── tax-calculations.ts   # 세금 계산 (한국 소득세율표)
│   ├── summary.ts            # 연도별 요약 집계
│   ├── format.ts             # 원화 포맷 (만/억 단위)
│   ├── time-units.ts         # 일급/시급/분급/초급 환산
│   ├── storage.ts            # 로컬 파일 저장
│   └── cn.ts                 # className 유틸리티
├── components/
│   ├── MainPanel.tsx          # 메인 레이아웃 (탭, 헤더)
│   ├── SummaryTable.tsx       # 연도별 비교 테이블
│   ├── ReceiptView.tsx        # 개별 연도 영수증 뷰
│   ├── SummaryReceiptView.tsx # 전체 요약 영수증 뷰
│   ├── StatsHeader.tsx        # 통계 헤더 (소득, 세금, 순수입)
│   ├── Chat.tsx               # Claude 채팅 인터페이스
│   ├── SetupDialog.tsx        # 초기 설정 다이얼로그
│   ├── UploadModal.tsx        # 파일 업로드 모달
│   ├── Button.tsx             # 공통 버튼 컴포넌트
│   ├── Dialog.tsx             # 공통 다이얼로그 컴포넌트
│   └── ...                    # 기타 UI 컴포넌트
└── data/
    └── sampleData.ts          # 데모용 샘플 데이터 (홍길동)
```

## 연말정산 데이터 구조

```
총급여 (income.totalSalary)
  └─ 근로소득공제 (employmentDeduction)
     └─ 근로소득금액 (employmentIncome)
        └─ 소득공제 (incomeDeductions)
           └─ 과세표준 (taxBase)
              └─ 산출세액 (calculatedTax)
                 └─ 세액공제 (taxCredits)
                    └─ 결정세액 (determinedTax)
                       ├─ 지방소득세 (localIncomeTax, 10%)
                       └─ 기납부세액 (taxAlreadyPaid)
                          └─ 차감징수세액 (settlement)
                             음수 = 환급, 양수 = 추가납부
```

## 개인정보 보호

### 데이터 처리 방식

연말정산 데이터는 로컬에서 처리되며, 사용자의 API 키로 Anthropic API에 직접 전송됩니다. 제3자 서버에 데이터가 저장되지 않습니다.

- 연말정산 PDF는 파싱을 위해 Anthropic API로 전송됩니다
- 파싱된 데이터는 로컬 기기에만 저장됩니다
- API 키는 로컬 .env 파일에 저장되며 외부로 전송되지 않습니다

Anthropic 상업 약관은 API 고객 데이터를 모델 학습에 사용하는 것을 금지합니다. [Anthropic 개인정보 보호정책](https://www.anthropic.com/legal/privacy) 참고.

### 직접 검증하기

Tax UI는 오픈소스입니다. 코드를 직접 검토하거나 AI에게 보안 감사를 요청할 수 있습니다.

<details>
<summary>보안 감사 프롬프트 복사</summary>

```
Tax UI의 보안 및 개인정보 보호 감사를 수행해주세요.

저장소: https://github.com/brianlovin/tax-ui

소스 코드를 분석하고 다음을 확인해주세요:

1. 데이터 처리
   - 연말정산 PDF가 Anthropic API로 직접 전송되는지
   - 다른 제3자 서버로 데이터가 전송되지 않는지
   - 파싱된 데이터가 로컬에만 저장되는지

2. 네트워크 활동
   - 코드베이스의 모든 네트워크 요청 식별
   - 외부 호출이 Anthropic API뿐인지 확인
   - 숨겨진 데이터 수집이나 추적이 없는지

3. API 키 보안
   - API 키가 로컬에 저장되고 외부로 전송되지 않는지
   - 키가 로그에 기록되거나 노출되지 않는지

4. 코드 무결성
   - 난독화되거나 의심스러운 코드가 없는지
   - 의존성 중 우려되는 것이 없는지

주요 검토 파일:
- src/index.ts (Bun 서버 및 API 라우트)
- src/lib/parser.ts (Claude API 연동)
- src/lib/storage.ts (로컬 파일 저장)
- src/App.tsx (React 프론트엔드)

민감한 연말정산 데이터를 이 앱에 사용하려고 합니다. 개인정보 보호 또는 보안 우려 사항을 알려주세요.
```

</details>

## 요구 사항

- [Bun](https://bun.sh) v1.0 이상
- [Anthropic API 키](https://console.anthropic.com/settings/keys)
- 연말정산 PDF 서류
