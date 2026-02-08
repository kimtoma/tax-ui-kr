import { describe, expect, test } from "bun:test";
import { aggregateSummary } from "./summary";
import type { TaxReturn } from "./schema";

const makeReturn = (
  year: number,
  totalSalary: number,
  determinedTax: number,
  localIncomeTax: number,
): TaxReturn => ({
  year,
  name: "홍길동",
  householdStatus: "세대주",
  dependents: [],
  income: {
    items: [{ label: "급여", amount: totalSalary }],
    totalSalary,
  },
  employmentDeduction: Math.round(totalSalary * 0.2),
  employmentIncome: Math.round(totalSalary * 0.8),
  incomeDeductions: {
    items: [
      { label: "국민연금", amount: Math.round(totalSalary * 0.045) },
      { label: "건강보험", amount: Math.round(totalSalary * 0.034) },
    ],
    total: Math.round(totalSalary * 0.079),
  },
  taxBase: Math.round(totalSalary * 0.6),
  calculatedTax: determinedTax + 500_000,
  taxCredits: {
    items: [{ label: "근로소득세액공제", amount: 500_000 }],
    total: 500_000,
  },
  determinedTax,
  localIncomeTax,
  taxAlreadyPaid: {
    incomeTax: determinedTax + 100_000,
    localTax: localIncomeTax + 10_000,
    total: determinedTax + localIncomeTax + 110_000,
  },
  settlement: {
    incomeTax: -100_000,
    localTax: -10_000,
    total: -110_000,
  },
  rates: {
    marginal: 15,
    effective: 6,
  },
});

describe("aggregateSummary", () => {
  test("returns null for empty returns", () => {
    expect(aggregateSummary({})).toBeNull();
  });

  test("aggregates single year correctly", () => {
    const returns = { 2024: makeReturn(2024, 73_000_000, 3_141_350, 314_135) };
    const result = aggregateSummary(returns);

    expect(result).not.toBeNull();
    expect(result!.years).toEqual([2024]);
    expect(result!.yearCount).toBe(1);
    expect(result!.totalIncome).toBe(73_000_000);
    expect(result!.totalDeterminedTax).toBe(3_141_350);
    expect(result!.totalLocalTax).toBe(314_135);
    expect(result!.totalTax).toBe(3_455_485); // 3_141_350 + 314_135
    expect(result!.netIncome).toBe(73_000_000 - 3_455_485);
  });

  test("aggregates multiple years correctly", () => {
    const returns = {
      2023: makeReturn(2023, 66_000_000, 3_476_200, 347_620),
      2024: makeReturn(2024, 73_000_000, 3_141_350, 314_135),
    };
    const result = aggregateSummary(returns);

    expect(result).not.toBeNull();
    expect(result!.years).toEqual([2023, 2024]);
    expect(result!.yearCount).toBe(2);
    expect(result!.totalIncome).toBe(139_000_000);
    expect(result!.totalDeterminedTax).toBe(6_617_550);
    expect(result!.totalLocalTax).toBe(661_755);
  });

  test("aggregates income items by label", () => {
    const return1 = makeReturn(2023, 66_000_000, 3_476_200, 347_620);
    return1.income.items = [
      { label: "급여", amount: 60_000_000 },
      { label: "상여금", amount: 6_000_000 },
    ];

    const return2 = makeReturn(2024, 73_000_000, 3_141_350, 314_135);
    return2.income.items = [
      { label: "급여", amount: 66_000_000 },
      { label: "상여금", amount: 7_000_000 },
    ];

    const returns = { 2023: return1, 2024: return2 };
    const result = aggregateSummary(returns);

    expect(result).not.toBeNull();
    const salary = result!.incomeItems.find((i) => i.label === "급여");
    const bonus = result!.incomeItems.find((i) => i.label === "상여금");

    expect(salary?.amount).toBe(126_000_000);
    expect(bonus?.amount).toBe(13_000_000);
  });

  test("calculates average hourly rate", () => {
    const returns = { 2024: makeReturn(2024, 73_000_000, 3_141_350, 314_135) };
    const result = aggregateSummary(returns);

    // Net income: 73_000_000 - 3_455_485 = 69_544_515
    // Hourly: 69_544_515 / 2080 ≈ 33,434.86
    expect(result).not.toBeNull();
    expect(result!.avgHourlyRate).toBeCloseTo(33_434.86, 0);
  });

  test("sorts years ascending", () => {
    const returns = {
      2024: makeReturn(2024, 73_000_000, 3_141_350, 314_135),
      2022: makeReturn(2022, 59_000_000, 3_266_050, 326_605),
      2023: makeReturn(2023, 66_000_000, 3_476_200, 347_620),
    };
    const result = aggregateSummary(returns);

    expect(result!.years).toEqual([2022, 2023, 2024]);
  });

  test("handles returns without rates", () => {
    const returnWithoutRates = makeReturn(2024, 73_000_000, 3_141_350, 314_135);
    delete (returnWithoutRates as Partial<TaxReturn>).rates;

    const returns = { 2024: returnWithoutRates };
    const result = aggregateSummary(returns);

    expect(result).not.toBeNull();
    expect(result!.rates).toBeNull();
  });

  test("averages rates across years", () => {
    const return1 = makeReturn(2023, 66_000_000, 3_476_200, 347_620);
    return1.rates = { marginal: 15, effective: 5.8 };

    const return2 = makeReturn(2024, 73_000_000, 3_141_350, 314_135);
    return2.rates = { marginal: 15, effective: 4.7 };

    const returns = { 2023: return1, 2024: return2 };
    const result = aggregateSummary(returns);

    expect(result).not.toBeNull();
    expect(result!.rates!.marginal).toBe(15); // (15 + 15) / 2
    expect(result!.rates!.effective).toBe(5.25); // (5.8 + 4.7) / 2
  });
});
