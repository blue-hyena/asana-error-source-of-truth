import crypto from "node:crypto";

export const ASANA_AUTHORIZE_URL = "https://app.asana.com/-/oauth_authorize";
export const ASANA_TOKEN_URL = "https://app.asana.com/-/oauth_token";
export const ASANA_MCP_RESOURCE = "https://mcp.asana.com/v2/mcp";
export const DEFAULT_CALLBACK_PORT = 55081;
export const DEFAULT_CALLBACK_PATH = "/callback/6vB1i0JQ9FnF";
export const TOKEN_FRESHNESS_WINDOW_MS = 5 * 60 * 1000;

export function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

export function randomVerifier() {
  return base64Url(crypto.randomBytes(32));
}

export function codeChallenge(verifier) {
  return base64Url(crypto.createHash("sha256").update(verifier).digest());
}

export function buildRedirectUri({
  port = DEFAULT_CALLBACK_PORT,
  path = DEFAULT_CALLBACK_PATH,
} = {}) {
  return `http://127.0.0.1:${port}${path}`;
}

export function buildAuthorizeUrl({
  clientId,
  redirectUri,
  state,
  codeChallenge,
  resource = ASANA_MCP_RESOURCE,
}) {
  const url = new URL(ASANA_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("resource", resource);
  return url.toString();
}

export function normalizeTokenResponse(response, now = Date.now(), previous = {}) {
  if (!response.access_token) {
    throw new Error("Token response did not include access_token");
  }

  const expiresIn = Number(response.expires_in ?? 3600);
  return {
    ...previous,
    ...response,
    expires_in: expiresIn,
    obtained_at: now,
    expires_at: now + expiresIn * 1000,
  };
}

export function isTokenFresh(
  token,
  now = Date.now(),
  freshnessWindowMs = TOKEN_FRESHNESS_WINDOW_MS,
) {
  return Boolean(token?.access_token && token?.expires_at && token.expires_at - now > freshnessWindowMs);
}

export function formBody(values) {
  const body = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) {
      body.set(key, String(value));
    }
  }
  return body;
}
