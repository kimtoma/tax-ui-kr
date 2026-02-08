import { z } from "zod";

const LabeledAmount = z.object({
  label: z.string(),
  amount: z.number(),
});

const Dependent = z.object({
  name: z.string(),
  relationship: z.string(),
});

export const TaxReturnSchema = z.object({
  year: z.number(),
  name: z.string(),
  householdStatus: z.enum(["세대주", "세대원"]),
  dependents: z.array(Dependent),
  income: z.object({
    items: z.array(LabeledAmount),
    totalSalary: z.number(),
  }),
  employmentDeduction: z.number(),
  employmentIncome: z.number(),
  incomeDeductions: z.object({
    items: z.array(LabeledAmount),
    total: z.number(),
  }),
  taxBase: z.number(),
  calculatedTax: z.number(),
  taxCredits: z.object({
    items: z.array(LabeledAmount),
    total: z.number(),
  }),
  determinedTax: z.number(),
  localIncomeTax: z.number(),
  taxAlreadyPaid: z.object({
    incomeTax: z.number(),
    localTax: z.number(),
    total: z.number(),
  }),
  settlement: z.object({
    incomeTax: z.number(),
    localTax: z.number(),
    total: z.number(),
  }),
  rates: z.object({
    marginal: z.number(),
    effective: z.number(),
  }).optional(),
});

export type TaxReturn = z.infer<typeof TaxReturnSchema>;
export type LabeledAmount = z.infer<typeof LabeledAmount>;

export interface PendingUpload {
  id: string;
  filename: string;
  year: number | null;
  status: "extracting-year" | "parsing";
  file: File;
}

export interface FileProgress {
  id: string;
  filename: string;
  status: "pending" | "parsing" | "complete" | "error";
  year?: number;
  error?: string;
}

export interface FileWithId {
  id: string;
  file: File;
}
