export const EXTRACTION_PROMPT = `You are a tax document parser. Extract data from the provided tax return PDF and return ONLY a JSON object matching the schema below. No explanations, no markdown code fences, just raw JSON.

SCHEMA:
{
  "year": number,           // Tax year (e.g., 2024)
  "name": string,           // Taxpayer name
  "filingStatus": "single" | "married_filing_jointly" | "married_filing_separately" | "head_of_household" | "qualifying_surviving_spouse",
  "dependents": [{ "name": string, "relationship": string }],

  "income": {
    "items": [{ "label": string, "amount": number }],  // e.g., "Wages, salaries", "Dividend income"
    "total": number
  },

  "federal": {
    "agi": number,                                      // Adjusted gross income
    "deductions": [{ "label": string, "amount": number }],  // Itemized or standard deduction breakdown
    "taxableIncome": number,
    "tax": number,                                      // Total federal tax
    "credits": [{ "label": string, "amount": number }], // Tax credits applied
    "payments": [{ "label": string, "amount": number }], // Withholdings, estimated payments
    "refundOrOwed": number                              // Positive = refund, negative = owed
  },

  "states": [{
    "name": string,                                     // State name (e.g., "California")
    "agi": number,
    "deductions": [{ "label": string, "amount": number }],
    "taxableIncome": number,
    "tax": number,
    "adjustments": [{ "label": string, "amount": number }],  // Penalties, additional taxes, credits
    "payments": [{ "label": string, "amount": number }],
    "refundOrOwed": number
  }],

  "summary": {
    "federalAmount": number,                            // Same as federal.refundOrOwed
    "stateAmounts": [{ "state": string, "amount": number }],
    "netPosition": number                               // Total refund (positive) or owed (negative)
  },

  "rates": {                                            // Optional but include if calculable
    "federal": { "marginal": number, "effective": number },  // As percentages (22 not 0.22)
    "state": { "marginal": number, "effective": number },
    "combined": { "marginal": number, "effective": number }
  }
}

RULES:
1. All amounts should be numbers (no currency symbols or commas)
2. Negative amounts represent deductions, losses, or amounts owed
3. For income items, use descriptive labels like "Wages, salaries", "Dividend income", "Interest income", "Capital gains/losses"
4. For deductions, prefix with "−" for clarity (e.g., "− SALT (capped)", "− Mortgage interest")
5. For refundOrOwed: positive = money back, negative = money owed
6. Calculate rates as percentages (22% = 22, not 0.22)
7. Effective rate = (tax / agi) * 100
8. Include all states found in the return
9. If a field isn't found in the document, use reasonable defaults (empty arrays, 0 for numbers)

Return ONLY the JSON object, nothing else.`;
