import Anthropic from "@anthropic-ai/sdk";
import type { TaxReturn } from "./schema";
import { getClaudeCodeOAuthToken, hasClaudeCodeOAuth, invalidateOAuthCache } from "./claude-code-auth";

export type AuthMethod = "api_key" | "oauth" | "none";

const RETURNS_FILE = ".tax-returns.json";
const ENV_FILE = ".env";

export async function getReturns(): Promise<Record<number, TaxReturn>> {
  const file = Bun.file(RETURNS_FILE);
  if (await file.exists()) {
    return file.json();
  }
  return {};
}

export async function saveReturn(taxReturn: TaxReturn): Promise<void> {
  const returns = await getReturns();
  returns[taxReturn.year] = taxReturn;
  await Bun.write(RETURNS_FILE, JSON.stringify(returns, null, 2));
}

export async function deleteReturn(year: number): Promise<void> {
  const returns = await getReturns();
  delete returns[year];
  await Bun.write(RETURNS_FILE, JSON.stringify(returns, null, 2));
}

export function getApiKey(): string | undefined {
  return process.env.ANTHROPIC_API_KEY;
}

export async function saveApiKey(key: string): Promise<void> {
  const file = Bun.file(ENV_FILE);
  let content = "";

  if (await file.exists()) {
    content = await file.text();
    if (content.includes("ANTHROPIC_API_KEY=")) {
      content = content.replace(/ANTHROPIC_API_KEY=.*/g, `ANTHROPIC_API_KEY=${key}`);
    } else {
      content = content.trim() + `\nANTHROPIC_API_KEY=${key}\n`;
    }
  } else {
    content = `ANTHROPIC_API_KEY=${key}\n`;
  }

  await Bun.write(ENV_FILE, content);
  process.env.ANTHROPIC_API_KEY = key;
}

export async function removeApiKey(): Promise<void> {
  const envFile = Bun.file(ENV_FILE);
  if (await envFile.exists()) {
    let content = await envFile.text();
    content = content.replace(/^ANTHROPIC_API_KEY=.*$/gm, "").trim();
    if (content) {
      await Bun.write(ENV_FILE, content + "\n");
    } else {
      const fs = await import("fs/promises");
      await fs.unlink(ENV_FILE);
    }
  }
  delete process.env.ANTHROPIC_API_KEY;
}

export async function clearAllData(): Promise<void> {
  // Clear tax returns
  const returnsFile = Bun.file(RETURNS_FILE);
  if (await returnsFile.exists()) {
    await Bun.write(RETURNS_FILE, "{}");
  }

  // Clear API key from .env
  const envFile = Bun.file(ENV_FILE);
  if (await envFile.exists()) {
    let content = await envFile.text();
    content = content.replace(/^ANTHROPIC_API_KEY=.*$/gm, "").trim();
    if (content) {
      await Bun.write(ENV_FILE, content + "\n");
    } else {
      // Delete empty .env file
      const fs = await import("fs/promises");
      await fs.unlink(ENV_FILE);
    }
  }
  delete process.env.ANTHROPIC_API_KEY;
}

/**
 * Determine current auth method and status.
 * Priority: API key > OAuth token > none
 */
export async function getAuthStatus(): Promise<{ hasKey: boolean; authMethod: AuthMethod }> {
  if (getApiKey()) {
    return { hasKey: true, authMethod: "api_key" };
  }
  if (await hasClaudeCodeOAuth()) {
    return { hasKey: true, authMethod: "oauth" };
  }
  return { hasKey: false, authMethod: "none" };
}

/**
 * Create an Anthropic client using the best available auth method.
 * Priority: overrideApiKey > stored API key > OAuth token
 */
export async function createAnthropicClient(overrideApiKey?: string): Promise<Anthropic> {
  if (overrideApiKey) {
    return new Anthropic({ apiKey: overrideApiKey });
  }

  const storedKey = getApiKey();
  if (storedKey) {
    return new Anthropic({ apiKey: storedKey });
  }

  const oauthToken = await getClaudeCodeOAuthToken();
  if (oauthToken) {
    return new Anthropic({ authToken: oauthToken });
  }

  throw new Error("No API key configured");
}

export { invalidateOAuthCache } from "./claude-code-auth";
