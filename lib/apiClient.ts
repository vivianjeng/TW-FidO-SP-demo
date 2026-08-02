// Thin fetch wrappers for Client Components talking to this app's own Route Handlers
// (never to MOICA directly — the browser never sees the AES key or full sp_service_id).

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await parseBody(res);
  if (!res.ok) {
    const message = (data as { error?: string } | undefined)?.error || `Request failed with HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}

export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(path, { cache: "no-store" });
  const data = await parseBody(res);
  if (!res.ok) {
    const message = (data as { error?: string } | undefined)?.error || `Request failed with HTTP ${res.status}`;
    throw new Error(message);
  }
  return data as T;
}
