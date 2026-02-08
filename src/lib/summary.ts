import type { TaxReturn } from "./schema";
import { getTotalTax, getNetIncome } from "./tax-calculations";

export interface AggregatedSummary {
  years: number[];
  yearCount: number;
  incomeItems: Array<{ label: string; amount: number }>;
  totalIncome: number;
  avgEmploymentIncome: number;
  avgTaxBase: number;
  incomeDeductions: Array<{ label: string; amount: number }>;
  taxCredits: Array<{ label: string; amount: number }>;
  totalDeterminedTax: number;
  totalLocalTax: number;
  totalTax: number;
  netIncome: number;
  totalSettlement: number;
  rates: {
    marginal: number;
    effective: number;
  } | null;
  grossMonthly: number;
  netMonthly: number;
  avgHourlyRate: number;
}

export function aggregateSummary(returns: Record<number, TaxReturn>): AggregatedSummary | null {
  const years = Object.keys(returns).map(Number).sort((a, b) => a - b);
  const allReturns = years.map((year) => returns[year]).filter((r): r is TaxReturn => r !== undefined);

  if (allReturns.length === 0) return null;

  // Aggregate income items
  const incomeItemsMap = new Map<string, number>();
  for (const r of allReturns) {
    for (const item of r.income.items) {
      incomeItemsMap.set(item.label, (incomeItemsMap.get(item.label) || 0) + item.amount);
    }
  }
  const incomeItems = Array.from(incomeItemsMap.entries()).map(([label, amount]) => ({ label, amount }));

  // Totals
  const totalIncome = allReturns.reduce((sum, r) => sum + r.income.totalSalary, 0);
  const totalDeterminedTax = allReturns.reduce((sum, r) => sum + r.determinedTax, 0);
  const totalLocalTax = allReturns.reduce((sum, r) => sum + r.localIncomeTax, 0);
  const totalTax = totalDeterminedTax + totalLocalTax;
  const netIncome = totalIncome - totalTax;

  // Aggregate income deductions
  const incomeDeductionsMap = new Map<string, number>();
  for (const r of allReturns) {
    for (const item of r.incomeDeductions.items) {
      incomeDeductionsMap.set(item.label, (incomeDeductionsMap.get(item.label) || 0) + item.amount);
    }
  }
  const incomeDeductions = Array.from(incomeDeductionsMap.entries()).map(([label, amount]) => ({ label, amount }));

  // Aggregate tax credits
  const taxCreditsMap = new Map<string, number>();
  for (const r of allReturns) {
    for (const item of r.taxCredits.items) {
      taxCreditsMap.set(item.label, (taxCreditsMap.get(item.label) || 0) + item.amount);
    }
  }
  const taxCredits = Array.from(taxCreditsMap.entries()).map(([label, amount]) => ({ label, amount }));

  // Averages
  const avgEmploymentIncome = allReturns.reduce((sum, r) => sum + r.employmentIncome, 0) / allReturns.length;
  const avgTaxBase = allReturns.reduce((sum, r) => sum + r.taxBase, 0) / allReturns.length;

  // Settlement total
  const totalSettlement = allReturns.reduce((sum, r) => sum + r.settlement.total, 0);

  // Average rates
  const returnsWithRates = allReturns.filter((r) => r.rates);
  let rates: AggregatedSummary["rates"] = null;
  if (returnsWithRates.length > 0) {
    const avgMarginal = returnsWithRates.reduce((sum, r) => sum + (r.rates?.marginal || 0), 0) / returnsWithRates.length;
    const avgEffective = returnsWithRates.reduce((sum, r) => sum + (r.rates?.effective || 0), 0) / returnsWithRates.length;
    rates = { marginal: avgMarginal, effective: avgEffective };
  }

  // Monthly and hourly
  const grossMonthly = Math.round(totalIncome / 12 / allReturns.length);
  const netMonthly = Math.round(netIncome / 12 / allReturns.length);
  const avgHourlyRate = (netIncome / allReturns.length) / 2080;

  return {
    years,
    yearCount: allReturns.length,
    incomeItems,
    totalIncome,
    avgEmploymentIncome,
    avgTaxBase,
    incomeDeductions,
    taxCredits,
    totalDeterminedTax,
    totalLocalTax,
    totalTax,
    netIncome,
    totalSettlement,
    rates,
    grossMonthly,
    netMonthly,
    avgHourlyRate,
  };
}
