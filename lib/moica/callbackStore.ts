// In-memory store for SP-API-WEB-01 callback results. MOICA POSTs the callback
// directly to /api/callback (server-to-server), so it carries no session cookie —
// results are keyed by transaction_id instead and picked up by /redirect/result.
import "server-only";
import type { WebRedirectCallback } from "./types";

export interface StoredCallback {
  callback: WebRedirectCallback;
  idpChecksumValid: boolean;
  idpChecksumPayload: string;
  receivedAt: number;
}

// Next.js compiles each route (route.ts vs page.tsx) into its own module bundle, so a
// plain module-scope `Map` here would silently end up as two different instances —
// /api/callback writes to one, /redirect/result reads from the other. Anchoring to
// globalThis (the same trick used for Prisma-client singletons under Next.js) forces
// a single instance for the whole process regardless of which bundle imports this file.
const globalForStore = globalThis as unknown as { __twfidoCallbackStore?: Map<string, StoredCallback> };
const store = globalForStore.__twfidoCallbackStore ?? (globalForStore.__twfidoCallbackStore = new Map());
const MAX_AGE_MS = 30 * 60 * 1000;

export function saveCallbackResult(transactionId: string, entry: StoredCallback): void {
  store.set(transactionId, entry);
  if (store.size > 200) {
    const cutoff = Date.now() - MAX_AGE_MS;
    for (const [key, value] of store) {
      if (value.receivedAt < cutoff) store.delete(key);
    }
  }
}

export function getCallbackResult(transactionId: string): StoredCallback | undefined {
  return store.get(transactionId);
}
