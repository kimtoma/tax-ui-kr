/**
 * Claude Code OAuth token reader for macOS Keychain.
 *
 * Reads OAuth credentials stored by Claude Code CLI:
 *   Service: "Claude Code-credentials", Account: "root"
 *   Format: { claudeAiOauth: { accessToken, refreshToken, expiresAt } }
 */

interface OAuthCredentials {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

interface KeychainPayload {
  claudeAiOauth?: OAuthCredentials;
}

// Cache with TTL
let cachedToken: { token: string; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30_000; // 30 seconds

// Dedup concurrent refresh requests
let refreshPromise: Promise<string | null> | null = null;

function isMacOS(): boolean {
  return process.platform === "darwin";
}

async function readKeychain(): Promise<KeychainPayload | null> {
  if (!isMacOS()) return null;

  try {
    const proc = Bun.spawn(
      [
        "security",
        "find-generic-password",
        "-s",
        "Claude Code-credentials",
        "-a",
        "root",
        "-w",
      ],
      { stdout: "pipe", stderr: "pipe" },
    );

    const text = await new Response(proc.stdout).text();
    await proc.exited;

    if (proc.exitCode !== 0) return null;

    const trimmed = text.trim();
    if (!trimmed) return null;

    return JSON.parse(trimmed) as KeychainPayload;
  } catch {
    return null;
  }
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<string | null> {
  try {
    const res = await fetch("https://console.anthropic.com/v1/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        // Claude Code's client_id (public, non-secret)
        client_id:
          "9d1c250a-e61b-44e4-8ed0-2de2b7e2e2c8",
      }),
    });

    if (!res.ok) return null;

    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
    };
    if (!data.access_token) return null;

    // Cache the new token
    const expiresIn = data.expires_in ?? 3600;
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + expiresIn * 1000 - 60_000, // 1min buffer
    };

    return data.access_token;
  } catch {
    return null;
  }
}

/**
 * Get a valid Claude Code OAuth access token from macOS Keychain.
 * Returns null if not on macOS or no token is available.
 */
export async function getClaudeCodeOAuthToken(): Promise<string | null> {
  if (!isMacOS()) return null;

  // Return cached token if still valid
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const payload = await readKeychain();
  const oauth = payload?.claudeAiOauth;
  if (!oauth?.accessToken) return null;

  const expiresAt = new Date(oauth.expiresAt).getTime();
  const isExpired = Date.now() >= expiresAt - 60_000; // 1min buffer

  if (!isExpired) {
    // Token is still valid - cache and return
    cachedToken = { token: oauth.accessToken, expiresAt: expiresAt - 60_000 };
    return oauth.accessToken;
  }

  // Token expired - refresh with dedup
  if (!oauth.refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(oauth.refreshToken).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

/**
 * Check if Claude Code OAuth credentials exist (without validating expiry).
 */
export async function hasClaudeCodeOAuth(): Promise<boolean> {
  if (!isMacOS()) return false;
  const payload = await readKeychain();
  return Boolean(payload?.claudeAiOauth?.accessToken);
}

/**
 * Invalidate the cached OAuth token (e.g., after auth error).
 */
export function invalidateOAuthCache(): void {
  cachedToken = null;
}
