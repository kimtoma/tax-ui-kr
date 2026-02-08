import type { TaxReturn } from "./schema";

export function getTotalTax(data: TaxReturn): number {
  return data.determinedTax + data.localIncomeTax;
}

export function getNetIncome(data: TaxReturn): number {
  return data.income.totalSalary - getTotalTax(data);
}

export function getEffectiveRate(data: TaxReturn): number {
  if (data.rates?.effective) {
    return data.rates.effective / 100;
  }
  if (data.income.totalSalary === 0) return 0;
  return getTotalTax(data) / data.income.totalSalary;
}

export function getSettlement(data: TaxReturn): number {
  return data.settlement.total;
}

// 2024 한국 소득세 세율표
const TAX_BRACKETS = [
  { limit: 14_000_000, rate: 0.06 },
  { limit: 50_000_000, rate: 0.15 },
  { limit: 88_000_000, rate: 0.24 },
  { limit: 150_000_000, rate: 0.35 },
  { limit: 300_000_000, rate: 0.38 },
  { limit: 500_000_000, rate: 0.40 },
  { limit: 1_000_000_000, rate: 0.42 },
  { limit: Infinity, rate: 0.45 },
];

export function getMarginalRate(taxBase: number): number {
  for (const bracket of TAX_BRACKETS) {
    if (taxBase <= bracket.limit) {
      return bracket.rate * 100;
    }
  }
  return 45;
}
