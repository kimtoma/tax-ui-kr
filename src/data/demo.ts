import type { TaxReturn } from "../lib/schema";

export const demoReturn: TaxReturn = {
  year: 2024,
  name: "Jane Smith",
  filingStatus: "single",
  dependents: [],

  income: {
    items: [
      { label: "Wages, salaries", amount: 95000 },
      { label: "Dividend income", amount: 3200 },
      { label: "Interest income", amount: 450 },
      { label: "Capital gains", amount: 1800 },
    ],
    total: 100450,
  },

  federal: {
    agi: 100450,
    deductions: [
      { label: "− Standard deduction", amount: -14600 },
    ],
    taxableIncome: 85850,
    tax: 14260,
    credits: [],
    payments: [{ label: "− Withheld", amount: -16500 }],
    refundOrOwed: 2240,
  },

  states: [
    {
      name: "California",
      agi: 100450,
      deductions: [{ label: "− Standard deduction", amount: -5540 }],
      taxableIncome: 94910,
      tax: 5180,
      adjustments: [],
      payments: [{ label: "− Withheld", amount: -4800 }],
      refundOrOwed: -380,
    },
  ],

  summary: {
    federalAmount: 2240,
    stateAmounts: [{ state: "California", amount: -380 }],
    netPosition: 1860,
  },

  rates: {
    federal: { marginal: 22, effective: 14.2 },
    state: { marginal: 9.3, effective: 5.2 },
    combined: { marginal: 31.3, effective: 19.4 },
  },
};
