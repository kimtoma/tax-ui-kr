import type { TaxReturn } from "../lib/schema";

// 4년간 한국 연말정산 샘플 데이터
export const sampleReturns: Record<number, TaxReturn> = {
  2021: {
    year: 2021,
    name: "홍길동",
    householdStatus: "세대주",
    dependents: [],
    income: {
      items: [
        { label: "급여", amount: 48_000_000 },
        { label: "상여금", amount: 4_000_000 },
      ],
      totalSalary: 52_000_000,
    },
    employmentDeduction: 12_750_000,
    employmentIncome: 39_250_000,
    incomeDeductions: {
      items: [
        { label: "국민연금", amount: 2_340_000 },
        { label: "건강보험", amount: 1_768_000 },
        { label: "고용보험", amount: 416_000 },
        { label: "인적공제", amount: 1_500_000 },
        { label: "신용카드 등 사용금액", amount: 1_800_000 },
      ],
      total: 7_824_000,
    },
    taxBase: 31_426_000,
    calculatedTax: 3_453_900,
    taxCredits: {
      items: [
        { label: "근로소득세액공제", amount: 500_000 },
        { label: "보장성보험료", amount: 120_000 },
      ],
      total: 620_000,
    },
    determinedTax: 2_833_900,
    localIncomeTax: 283_390,
    taxAlreadyPaid: {
      incomeTax: 3_100_000,
      localTax: 310_000,
      total: 3_410_000,
    },
    settlement: {
      incomeTax: -266_100,
      localTax: -26_610,
      total: -292_710,
    },
    rates: {
      marginal: 15,
      effective: 6.0,
    },
  },

  2022: {
    year: 2022,
    name: "홍길동",
    householdStatus: "세대주",
    dependents: [],
    income: {
      items: [
        { label: "급여", amount: 54_000_000 },
        { label: "상여금", amount: 5_000_000 },
      ],
      totalSalary: 59_000_000,
    },
    employmentDeduction: 13_800_000,
    employmentIncome: 45_200_000,
    incomeDeductions: {
      items: [
        { label: "국민연금", amount: 2_655_000 },
        { label: "건강보험", amount: 2_006_000 },
        { label: "고용보험", amount: 472_000 },
        { label: "인적공제", amount: 1_500_000 },
        { label: "신용카드 등 사용금액", amount: 2_100_000 },
        { label: "주택마련저축", amount: 960_000 },
      ],
      total: 9_693_000,
    },
    taxBase: 35_507_000,
    calculatedTax: 4_066_050,
    taxCredits: {
      items: [
        { label: "근로소득세액공제", amount: 500_000 },
        { label: "보장성보험료", amount: 120_000 },
        { label: "의료비", amount: 180_000 },
      ],
      total: 800_000,
    },
    determinedTax: 3_266_050,
    localIncomeTax: 326_605,
    taxAlreadyPaid: {
      incomeTax: 3_800_000,
      localTax: 380_000,
      total: 4_180_000,
    },
    settlement: {
      incomeTax: -533_950,
      localTax: -53_395,
      total: -587_345,
    },
    rates: {
      marginal: 15,
      effective: 6.1,
    },
  },

  2023: {
    year: 2023,
    name: "홍길동",
    householdStatus: "세대주",
    dependents: [
      { name: "홍영희", relationship: "배우자" },
    ],
    income: {
      items: [
        { label: "급여", amount: 60_000_000 },
        { label: "상여금", amount: 6_000_000 },
      ],
      totalSalary: 66_000_000,
    },
    employmentDeduction: 14_850_000,
    employmentIncome: 51_150_000,
    incomeDeductions: {
      items: [
        { label: "국민연금", amount: 2_970_000 },
        { label: "건강보험", amount: 2_244_000 },
        { label: "고용보험", amount: 528_000 },
        { label: "인적공제", amount: 3_000_000 },
        { label: "신용카드 등 사용금액", amount: 2_500_000 },
        { label: "주택마련저축", amount: 1_200_000 },
      ],
      total: 12_442_000,
    },
    taxBase: 38_708_000,
    calculatedTax: 4_546_200,
    taxCredits: {
      items: [
        { label: "근로소득세액공제", amount: 500_000 },
        { label: "보장성보험료", amount: 120_000 },
        { label: "의료비", amount: 250_000 },
        { label: "교육비", amount: 200_000 },
      ],
      total: 1_070_000,
    },
    determinedTax: 3_476_200,
    localIncomeTax: 347_620,
    taxAlreadyPaid: {
      incomeTax: 4_200_000,
      localTax: 420_000,
      total: 4_620_000,
    },
    settlement: {
      incomeTax: -723_800,
      localTax: -72_380,
      total: -796_180,
    },
    rates: {
      marginal: 15,
      effective: 5.8,
    },
  },

  2024: {
    year: 2024,
    name: "홍길동",
    householdStatus: "세대주",
    dependents: [
      { name: "홍영희", relationship: "배우자" },
      { name: "홍민준", relationship: "자녀" },
    ],
    income: {
      items: [
        { label: "급여", amount: 66_000_000 },
        { label: "상여금", amount: 7_000_000 },
      ],
      totalSalary: 73_000_000,
    },
    employmentDeduction: 15_900_000,
    employmentIncome: 57_100_000,
    incomeDeductions: {
      items: [
        { label: "국민연금", amount: 3_285_000 },
        { label: "건강보험", amount: 2_482_000 },
        { label: "고용보험", amount: 584_000 },
        { label: "인적공제", amount: 4_500_000 },
        { label: "신용카드 등 사용금액", amount: 2_800_000 },
        { label: "주택마련저축", amount: 1_440_000 },
        { label: "연금계좌세액공제", amount: 400_000 },
      ],
      total: 15_491_000,
    },
    taxBase: 41_609_000,
    calculatedTax: 4_981_350,
    taxCredits: {
      items: [
        { label: "근로소득세액공제", amount: 500_000 },
        { label: "자녀세액공제", amount: 150_000 },
        { label: "보장성보험료", amount: 120_000 },
        { label: "의료비", amount: 320_000 },
        { label: "교육비", amount: 350_000 },
        { label: "연금계좌세액공제", amount: 400_000 },
      ],
      total: 1_840_000,
    },
    determinedTax: 3_141_350,
    localIncomeTax: 314_135,
    taxAlreadyPaid: {
      incomeTax: 4_600_000,
      localTax: 460_000,
      total: 5_060_000,
    },
    settlement: {
      incomeTax: -1_458_650,
      localTax: -145_865,
      total: -1_604_515,
    },
    rates: {
      marginal: 15,
      effective: 4.7,
    },
  },
};
