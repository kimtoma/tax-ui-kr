import Anthropic from "@anthropic-ai/sdk";
import { TaxReturnSchema, type TaxReturn } from "./schema";
import { EXTRACTION_PROMPT } from "./prompt";

function stripCodeFences(text: string): string {
  let result = text.trim();
  if (result.startsWith("```json")) {
    result = result.slice(7);
  } else if (result.startsWith("```")) {
    result = result.slice(3);
  }
  if (result.endsWith("```")) {
    result = result.slice(0, -3);
  }
  return result.trim();
}

export async function parseTaxReturn(pdfBase64: string, apiKey: string): Promise<TaxReturn> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
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
            text: EXTRACTION_PROMPT,
          },
        ],
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  const json = JSON.parse(stripCodeFences(textBlock.text));
  return TaxReturnSchema.parse(json);
}
