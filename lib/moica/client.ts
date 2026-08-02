import "server-only";

export interface RemoteCallResult<T> {
  ok: boolean;
  status?: number;
  error?: string;
  durationMs: number;
  json?: T;
  rawText?: string;
}

/**
 * POSTs JSON to a {fidoapi} REST endpoint. Per Spec §貳.三 the UAT host is documented
 * as unreachable from outside Taiwan and the production host is IP-allow-listed, so a
 * connection failure here is an expected outcome in most deployments of this demo, not
 * necessarily a bug — the caller distinguishes it from a MOICA-returned error_code.
 */
export async function postMoicaApi<T>(
  fidoapiHost: string,
  path: string,
  body: unknown,
  timeoutMs = 10_000
): Promise<RemoteCallResult<T>> {
  const url = `https://${fidoapiHost}${path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const start = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: "no-store",
    });
    const durationMs = Date.now() - start;
    const rawText = await res.text();
    let json: T | undefined;
    try {
      json = JSON.parse(rawText) as T;
    } catch {
      // leave json undefined; rawText still surfaced to the UI
    }
    return { ok: res.ok, status: res.status, durationMs, json, rawText };
  } catch (err) {
    const durationMs = Date.now() - start;
    const message =
      err instanceof Error
        ? err.name === "AbortError"
          ? `Timed out after ${timeoutMs}ms connecting to ${url}`
          : err.message
        : String(err);
    return { ok: false, error: message, durationMs };
  } finally {
    clearTimeout(timeout);
  }
}

export function moicaUrl(fidoapiHost: string, path: string): string {
  return `https://${fidoapiHost}${path}`;
}
