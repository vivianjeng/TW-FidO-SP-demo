import { NextRequest, NextResponse } from "next/server";
import { getSessionConfig, setSessionConfig, resolveHosts, isConfigComplete, getCurrentSessionId } from "@/lib/moica/config";
import { aesKeyByteLength } from "@/lib/moica/crypto";
import type { Environment, SessionConfig } from "@/lib/moica/types";

function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 6) return "•".repeat(key.length);
  return `${key.slice(0, 4)}${"•".repeat(Math.max(0, key.length - 8))}${key.slice(-4)}`;
}

function publicView(config: SessionConfig, sessionId: string | undefined) {
  const hosts = resolveHosts(config);
  return {
    environment: config.environment,
    customFidoweb: config.customFidoweb ?? "",
    customFidoapi: config.customFidoapi ?? "",
    spServiceId: config.spServiceId,
    aesKeyMasked: maskKey(config.aesKeyBase64),
    aesKeyConfigured: aesKeyByteLength(config.aesKeyBase64) === 32,
    spCallbackUrl: config.spCallbackUrl,
    hosts,
    configured: isConfigComplete(config),
    // Not a secret — a correlation id so /api/callback (invoked server-to-server by
    // MOICA, with no browser cookie) knows which session's AES key to verify against.
    sessionId,
  };
}

export async function GET() {
  const config = await getSessionConfig();
  return NextResponse.json(publicView(config, await getCurrentSessionId()));
}

/** Sentinel the settings form sends when the operator left the masked AES key field
 * untouched, so we don't need to ever send the real key back to the browser to "edit" it. */
const KEEP_EXISTING_KEY = "__KEEP_EXISTING__";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const previous = await getSessionConfig();

  const environment: Environment = ["uat", "prod", "custom"].includes(body.environment) ? body.environment : "uat";
  let aesKeyBase64: string = typeof body.aesKeyBase64 === "string" ? body.aesKeyBase64.trim() : "";
  if (aesKeyBase64 === KEEP_EXISTING_KEY) {
    aesKeyBase64 = previous.aesKeyBase64;
  }

  if (aesKeyBase64 && aesKeyByteLength(aesKeyBase64) !== 32) {
    return NextResponse.json(
      {
        error: `AES key must be base64 decoding to exactly 32 bytes (AES-256); got ${aesKeyByteLength(
          aesKeyBase64
        )} bytes.`,
      },
      { status: 400 }
    );
  }

  const config: SessionConfig = {
    environment,
    customFidoweb: typeof body.customFidoweb === "string" ? body.customFidoweb.trim() : "",
    customFidoapi: typeof body.customFidoapi === "string" ? body.customFidoapi.trim() : "",
    spServiceId: typeof body.spServiceId === "string" ? body.spServiceId.trim() : "",
    aesKeyBase64,
    spCallbackUrl: typeof body.spCallbackUrl === "string" ? body.spCallbackUrl.trim() : "",
  };

  const sessionId = await setSessionConfig(config);
  return NextResponse.json(publicView(config, sessionId));
}
