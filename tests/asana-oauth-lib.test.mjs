import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ASANA_MCP_RESOURCE,
  buildAuthorizeUrl,
  isTokenFresh,
  normalizeTokenResponse,
} from "../scripts/asana-oauth-lib.mjs";

test("buildAuthorizeUrl includes the MCP resource and exact redirect URI", () => {
  const url = new URL(
    buildAuthorizeUrl({
      clientId: "client-123",
      redirectUri: "http://127.0.0.1:55081/callback/6vB1i0JQ9FnF",
      state: "state-123",
      codeChallenge: "challenge-123",
    }),
  );

  assert.equal(url.origin + url.pathname, "https://app.asana.com/-/oauth_authorize");
  assert.equal(url.searchParams.get("response_type"), "code");
  assert.equal(url.searchParams.get("client_id"), "client-123");
  assert.equal(url.searchParams.get("redirect_uri"), "http://127.0.0.1:55081/callback/6vB1i0JQ9FnF");
  assert.equal(url.searchParams.get("resource"), ASANA_MCP_RESOURCE);
  assert.equal(url.searchParams.get("code_challenge_method"), "S256");
});

test("normalizeTokenResponse records an absolute expiry timestamp", () => {
  const token = normalizeTokenResponse(
    {
      access_token: "access",
      refresh_token: "refresh",
      expires_in: 3600,
      token_type: "bearer",
    },
    1_000_000,
  );

  assert.equal(token.access_token, "access");
  assert.equal(token.refresh_token, "refresh");
  assert.equal(token.expires_at, 1_000_000 + 3_600_000);
});

test("isTokenFresh requires a safety window before expiry", () => {
  const token = { access_token: "access", expires_at: 10_000 };

  assert.equal(isTokenFresh(token, 1_000, 5_000), true);
  assert.equal(isTokenFresh(token, 6_000, 5_000), false);
});
