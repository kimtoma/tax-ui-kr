import type { PageClassification, FormType } from "./classifier";

export interface PageSelection {
  selectedPages: number[];
  skippedPages: number[];
  reason: Map<number, string>;
}

// Priority tiers for page selection
const ESSENTIAL: FormType[] = ["withholding_receipt", "settlement_summary"];
const IMPORTANT: FormType[] = [
  "income_detail",
  "deduction_detail",
  "credit_detail",
];
const OPTIONAL: FormType[] = [
  "insurance_detail",
  "medical_detail",
  "education_detail",
  "donation_detail",
  "card_usage_detail",
  "housing_detail",
];
const SKIP: FormType[] = ["supporting_doc", "other"];

// Target page count to stay under token limits (~40 pages max)
const MAX_SELECTED_PAGES = 40;

export function selectPages(classifications: PageClassification[]): PageSelection {
  const selectedPages: number[] = [];
  const skippedPages: number[] = [];
  const reason = new Map<number, string>();

  // Group pages by priority
  const essential: number[] = [];
  const important: number[] = [];
  const optional: number[] = [];
  const skip: number[] = [];

  for (const { pageNumber, formType } of classifications) {
    if (ESSENTIAL.includes(formType)) {
      essential.push(pageNumber);
      reason.set(pageNumber, `essential: ${formType}`);
    } else if (IMPORTANT.includes(formType)) {
      important.push(pageNumber);
      reason.set(pageNumber, `important: ${formType}`);
    } else if (OPTIONAL.includes(formType)) {
      optional.push(pageNumber);
      reason.set(pageNumber, `optional: ${formType}`);
    } else {
      skip.push(pageNumber);
      reason.set(pageNumber, `skip: ${formType}`);
    }
  }

  // Add pages in priority order until we hit the limit
  let remaining = MAX_SELECTED_PAGES;

  // Always include essential pages
  for (const page of essential) {
    if (remaining > 0) {
      selectedPages.push(page);
      remaining--;
    } else {
      skippedPages.push(page);
    }
  }

  // Add important pages if we have room
  for (const page of important) {
    if (remaining > 0) {
      selectedPages.push(page);
      remaining--;
    } else {
      skippedPages.push(page);
    }
  }

  // Add optional pages if we have room
  for (const page of optional) {
    if (remaining > 0) {
      selectedPages.push(page);
      remaining--;
    } else {
      skippedPages.push(page);
    }
  }

  // Skip pages are always skipped
  skippedPages.push(...skip);

  // Sort selected pages by page number for proper PDF ordering
  selectedPages.sort((a, b) => a - b);
  skippedPages.sort((a, b) => a - b);

  return { selectedPages, skippedPages, reason };
}
