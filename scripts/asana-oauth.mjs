#!/usr/bin/env node
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";

import {
  ASANA_TOKEN_URL,
  buildAuthorizeUrl,
  buildRedirectUri,
  codeChallenge,
  DEFAULT_CALLBACK_PATH,
  DEFAULT_CALLBACK_PORT,
  formBody,
  isTokenFresh,
  normalizeTokenResponse,
  randomVerifier,
} from "./asana-oauth-lib.mjs";

const tokenFile = process.env.ASANA_MCP_TOKENS_FILE
  ?? path.join(process.cwd(), ".secrets", "asana-mcp-tokens.json");

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function readTokenFile() {
  try {
    return JSON.parse(await fs.readFile(tokenFile, "utf8"));
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw error;
  }
}

async function writeTokenFile(token) {
  await fs.mkdir(path.dirname(tokenFile), { recursive: true, mode: 0o700 });
  await fs.writeFile(tokenFile, `${JSON.stringify(token, null, 2)}\n`, { mode: 0o600 });
}

async function exchangeToken(params) {
  const response = await fetch(ASANA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody(params),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload.error_description || payload.error || response.statusText;
    throw new Error(`Asana token exchange failed: ${detail}`);
  }
  return payload;
}

async function login() {
  const clientId = requiredEnv("ASANA_MCP_CLIENT_ID");
  const clientSecret = requiredEnv("ASANA_MCP_CLIENT_SECRET");
  const port = Number(process.env.ASANA_MCP_CALLBACK_PORT ?? DEFAULT_CALLBACK_PORT);
  const callbackPath = process.env.ASANA_MCP_CALLBACK_PATH ?? DEFAULT_CALLBACK_PATH;
  const redirectUri = buildRedirectUri({ port, path: callbackPath });
  const verifier = randomVerifier();
  const state = randomVerifier();

  const authorizeUrl = buildAuthorizeUrl({
    clientId,
    redirectUri,
    state,
    codeChallenge: codeChallenge(verifier),
  });

  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://127.0.0.1:${port}`);
      if (url.pathname !== callbackPath) {
        response.writeHead(404);
        response.end("Not found");
        return;
      }
      if (url.searchParams.get("state") !== state) {
        response.writeHead(400);
        response.end("Invalid OAuth state");
        return;
      }
      const code = url.searchParams.get("code");
      if (!code) {
        response.writeHead(400);
        response.end("Missing OAuth code");
        return;
      }

      const token = await exchangeToken({
        grant_type: "authorization_code",
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code_verifier: verifier,
      });
      await writeTokenFile(normalizeTokenResponse(token));
      response.writeHead(200, { "Content-Type": "text/plain" });
      response.end("Asana MCP OAuth complete. You can close this tab.");
      server.close();
    } catch (error) {
      response.writeHead(500, { "Content-Type": "text/plain" });
      response.end(error.message);
      server.close();
    }
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(port, "127.0.0.1", resolve);
  });

  console.error(`Open this URL to authorize Asana MCP:${os.EOL}${authorizeUrl}${os.EOL}`);
}

async function refresh() {
  const clientId = requiredEnv("ASANA_MCP_CLIENT_ID");
  const clientSecret = requiredEnv("ASANA_MCP_CLIENT_SECRET");
  const current = await readTokenFile();
  if (!current?.refresh_token) {
    throw new Error(`No refresh token found in ${tokenFile}. Run login first.`);
  }

  const token = await exchangeToken({
    grant_type: "refresh_token",
    refresh_token: current.refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
  });
  const normalized = normalizeTokenResponse(token, Date.now(), {
    refresh_token: current.refresh_token,
  });
  await writeTokenFile(normalized);
  return normalized;
}

async function printAccessToken() {
  let token = await readTokenFile();
  if (!isTokenFresh(token)) {
    token = await refresh();
  }
  process.stdout.write(`${token.access_token}\n`);
}

async function status() {
  const token = await readTokenFile();
  if (!token) {
    console.log(`No token file at ${tokenFile}`);
    return;
  }
  console.log(JSON.stringify({
    token_file: tokenFile,
    has_access_token: Boolean(token.access_token),
    has_refresh_token: Boolean(token.refresh_token),
    expires_at: token.expires_at ? new Date(token.expires_at).toISOString() : null,
    fresh: isTokenFresh(token),
  }, null, 2));
}

const command = process.argv[2];
try {
  if (command === "login") {
    await login();
  } else if (command === "refresh") {
    await refresh();
  } else if (command === "print-access-token") {
    await printAccessToken();
  } else if (command === "status") {
    await status();
  } else {
    console.error("Usage: node scripts/asana-oauth.mjs <login|refresh|print-access-token|status>");
    process.exitCode = 2;
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
