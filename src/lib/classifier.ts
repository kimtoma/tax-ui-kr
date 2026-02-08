import Anthropic from "@anthropic-ai/sdk";
import { PDFDocument } from "pdf-lib";

export type FormType =
  | "withholding_receipt"
  | "income_detail"
  | "deduction_detail"
  | "credit_detail"
  | "settlement_summary"
  | "insurance_detail"
  | "medical_detail"
  | "education_detail"
  | "donation_detail"
  | "card_usage_detail"
  | "housing_detail"
  | "supporting_doc"
  | "other";

export interface PageClassification {
  pageNumber: number;
  formType: FormType;
}

const CLASSIFICATION_PROMPT = `이 연말정산 PDF의 각 페이지를 분류하세요. 각 페이지의 서류 유형을 식별하세요.

분류 카테고리:
- withholding_receipt: 근로소득 원천징수영수증 (소득, 공제, 세액 요약)
- income_detail: 급여 명세서, 소득 상세 내역
- deduction_detail: 소득공제 상세 (인적공제, 연금, 보험료 등)
- credit_detail: 세액공제 상세 (의료비, 교육비, 기부금, 월세 등)
- settlement_summary: 연말정산 결과 요약, 차감징수세액 내역
- insurance_detail: 보험료 납입 증명서
- medical_detail: 의료비 지급 명세서
- education_detail: 교육비 납입 증명서
- donation_detail: 기부금 영수증
- card_usage_detail: 신용카드/현금영수증 사용 내역
- housing_detail: 주택자금/월세 관련 서류
- supporting_doc: 원천징수 영수증 사본, 증빙 서류
- other: 표지, 안내문, 서명 페이지 등

JSON 배열로 응답하세요. 각 요소는:
- "page": 페이지 번호 (1부터 시작)
- "type": 위 분류 카테고리 중 하나

응답 형식 예시:
[
  {"page": 1, "type": "withholding_receipt"},
  {"page": 2, "type": "withholding_receipt"},
  {"page": 3, "type": "deduction_detail"}
]

문서의 모든 페이지를 분류하세요.`;

export async function classifyPages(
  pdfBase64: string,
  client: Anthropic
): Promise<PageClassification[]> {
  const pdfBytes = Buffer.from(pdfBase64, "base64");
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const totalPages = pdfDoc.getPageCount();

  // For small PDFs, skip classification
  if (totalPages <= 20) {
    return Array.from({ length: totalPages }, (_, i) => ({
      pageNumber: i + 1,
      formType: "other" as FormType,
    }));
  }

  // Use Haiku for fast, cheap classification
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: "application/pdf",
              data: pdfBase64,
            },
          },
          {
            type: "text",
            text: CLASSIFICATION_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No classification response from Claude");
  }

  // Parse the JSON response
  const jsonMatch = textBlock.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error("Could not parse classification response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as Array<{
    page: number;
    type: string;
  }>;

  return parsed.map((item) => ({
    pageNumber: item.page,
    formType: item.type as FormType,
  }));
}
