// Server-only, per-browser-session storage of environment/sp_service_id/AES key.
// In-memory (cleared on server restart) — a deliberate demo-scope limitation, see
// SPEC.md §10. The AES key never leaves the server process.

import "server-only";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { EMPTY_SESSION_CONFIG, Environment, ENVIRONMENT_HOSTS, EnvironmentHosts, SessionConfig } from "./types";
import { aesKeyByteLength } from "./crypto";

const SESSION_COOKIE = "twfido_session";

/** Seeds a brand-new session (no cookie yet, or a cookie the store has no entry for)
 * from environment variables, so a deployment can pre-fill sp_service_id/AES key
 * instead of every operator typing them into Settings by hand. All optional — any
 * unset var just leaves that field blank, same as EMPTY_SESSION_CONFIG. */
function envDefaultConfig(): SessionConfig {
  const environment: Environment = ["uat", "prod", "custom"].includes(process.env.FIDO_ENVIRONMENT ?? "")
    ? (process.env.FIDO_ENVIRONMENT as Environment)
    : "uat";
  return {
    ...EMPTY_SESSION_CONFIG,
    environment,
    spServiceId: process.env.FIDO_SP_SERVICE_ID?.trim() ?? "",
    aesKeyBase64: process.env.FIDO_AES_KEY?.trim() ?? "",
    spCallbackUrl: process.env.FIDO_SP_CALLBACK_URL?.trim() ?? "",
  };
}

// Anchored to globalThis, not just module scope: Next.js compiles each route (every
// route.ts and page.tsx) into its own bundle, so plain `const store = new Map()` here
// can silently become a *different* Map per bundle even within one running server —
// confirmed by hand against this app's own /api/config and /api/callback routes. See
// the identical comment in callbackStore.ts.
const globalForConfig = globalThis as unknown as { __twfidoConfigStore?: Map<string, SessionConfig> };
const store = globalForConfig.__twfidoConfigStore ?? (globalForConfig.__twfidoConfigStore = new Map());

/** Safe to call from Server Components: never mutates cookies. */
export async function getSessionConfig(): Promise<SessionConfig> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id) return envDefaultConfig();
  return store.get(id) ?? envDefaultConfig();
}

export async function getCurrentSessionId(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value;
}

/** Used by /api/callback, which is invoked server-to-server by MOICA and therefore
 * carries no browser cookie — the SP Callback URL instead embeds `?sid=` so the demo
 * knows which session's AES key to verify the idp_checksum against. */
export function getConfigBySessionId(sessionId: string): SessionConfig | undefined {
  return store.get(sessionId);
}

/** Must only be called from a Route Handler or Server Action (sets a cookie).
 * Returns the session id directly rather than relying on reading back the cookie
 * jar within the same request, which isn't guaranteed to reflect a just-issued
 * Set-Cookie. */
export async function setSessionConfig(config: SessionConfig): Promise<string> {
  const jar = await cookies();
  let id = jar.get(SESSION_COOKIE)?.value;
  if (!id) {
    id = randomUUID();
    jar.set(SESSION_COOKIE, id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    });
  }
  store.set(id, config);
  return id;
}

export function resolveHosts(config: SessionConfig): EnvironmentHosts {
  if (config.environment === "custom") {
    return {
      fidoweb: config.customFidoweb?.trim() || "",
      fidoapi: config.customFidoapi?.trim() || "",
    };
  }
  return ENVIRONMENT_HOSTS[config.environment];
}

export function isConfigComplete(config: SessionConfig): boolean {
  const hosts = resolveHosts(config);
  // aesKeyByteLength(...) === 32 also rejects a key sourced from env/Pages secrets
  // (envDefaultConfig, above) that was never run through /api/config's own length
  // check — without this, computeChecksum's decodeAesKey throws uncaught downstream.
  return Boolean(
    config.spServiceId && aesKeyByteLength(config.aesKeyBase64) === 32 && hosts.fidoweb && hosts.fidoapi
  );
}
