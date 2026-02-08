import { describe, expect, test } from "bun:test";
import { getTotalTax, getNetIncome } from "./tax-calculations";
import type { TaxReturn } from "./schema";

const baseTaxReturn: TaxReturn = {
  year: 2024,
  name: "홍길동",
  householdStatus: "세대주",
  dependents: [],
  income: {
    items: [{ label: "급여", amount: 73_000_000 }],
    totalSalary: 73_000_000,
  },
  employmentDeduction: 15_900_000,
  employmentIncome: 57_100_000,
  incomeDeductions: {
    items: [
      { label: "국민연금", amount: 3_285_000 },
      { label: "건강보험", amount: 2_482_000 },
    ],
    total: 5_767_000,
  },
  taxBase: 41_609_000,
  calculatedTax: 4_981_350,
  taxCredits: {
    items: [{ label: "근로소득세액공제", amount: 500_000 }],
    total: 500_000,
  },
  determinedTax: 4_481_350,
  localIncomeTax: 448_135,
  taxAlreadyPaid: {
    incomeTax: 4_600_000,
    localTax: 460_000,
    total: 5_060_000,
  },
  settlement: {
    incomeTax: -118_650,
    localTax: -11_865,
    total: -130_515,
  },
  rates: {
    marginal: 15,
    effective: 6.7,
  },
};

describe("getTotalTax", () => {
  test("sums determinedTax and localIncomeTax", () => {
    expect(getTotalTax(baseTaxReturn)).toBe(4_929_485); // 4_481_350 + 448_135
  });

  test("handles zero local tax", () => {
    const noLocal: TaxReturn = {
      ...baseTaxReturn,
      localIncomeTax: 0,
    };
    expect(getTotalTax(noLocal)).toBe(4_481_350);
  });
});

describe("getNetIncome", () => {
  test("subtracts total tax from total salary", () => {
    // 73_000_000 - 4_929_485 = 68_070_515
    expect(getNetIncome(baseTaxReturn)).toBe(68_070_515);
  });

  test("handles zero tax", () => {
    const zeroTax: TaxReturn = {
      ...baseTaxReturn,
      determinedTax: 0,
      localIncomeTax: 0,
    };
    expect(getNetIncome(zeroTax)).toBe(73_000_000);
  });
});
