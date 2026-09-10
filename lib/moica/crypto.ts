// Implements the checksum and ticket algorithms from Spec §參.三 (資料格式說明):
//   sp_checksum / idp_checksum : AES_GCM_HEX( SHA256_HEX( Payload ) )
//   sp_ticket                  : BASE64URL(payload) + "." + BASE64URL(SHA256(BASE64URL(payload)))
//
// See SPEC.md §6.2 for why the PDF's own worked hex examples could not be reproduced
// byte-for-byte (page-break text-extraction artifacts) and how this module is instead
// verified via an encrypt/decrypt round trip (lib/moica/crypto.test.ts).

import { createHash, randomUUID, timingSafeEqual } from "crypto";
import type { DecodedSpTicket } from "./types";

const GCM_IV_LENGTH = 12; // bytes
const GCM_TAG_LENGTH = 16; // bytes (128-bit tag)
const AES_KEY_LENGTH = 32; // bytes (AES-256)

export function genTransactionId(): string {
  return randomUUID();
}

/** Returns the decoded byte length of a base64 string (0 if it decodes to nothing). */
export function aesKeyByteLength(aesKeyBase64: string): number {
  if (!aesKeyBase64) return 0;
  return Buffer.from(aesKeyBase64, "base64").length;
}

export function sha256Hex(input: string): string {
  return createHash("sha256").update(Buffer.from(input, "utf8")).digest("hex");
}

export class AesKeyError extends Error {}

// Buffer's underlying ArrayBufferLike type includes SharedArrayBuffer, which
// crypto.subtle's BufferSource types reject — copy into a plain, non-shared Uint8Array.
function toU8(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(bytes.byteLength);
  out.set(bytes);
  return out;
}

function decodeAesKeyBytes(aesKeyBase64: string): Uint8Array<ArrayBuffer> {
  const key = Buffer.from(aesKeyBase64, "base64");
  if (key.length !== AES_KEY_LENGTH) {
    throw new AesKeyError(
      `AES key must decode to ${AES_KEY_LENGTH} bytes (AES-256); got ${key.length} bytes. ` +
        `Check the AES key configured on the Settings page.`
    );
  }
  return toU8(key);
}

/**
 * Computes sp_checksum / idp_checksum: AES-256-GCM encrypt the *ASCII hex string* of
 * SHA-256(payload) under a fixed all-zero 12-byte IV, then hex(iv || ciphertext || tag).
 *
 * Uses the Web Crypto API (crypto.subtle) rather than Node's createCipheriv: Cloudflare
 * Workers' Node compat layer doesn't implement createCipheriv/createDecipheriv ("[unenv]
 * crypto.createCipheriv is not implemented yet" — confirmed in production logs), while
 * crypto.subtle is natively supported by both Node and Workers, so this runs identically
 * in local dev and on Cloudflare Pages.
 */
export async function computeChecksum(payload: string, aesKeyBase64: string): Promise<string> {
  const keyBytes = decodeAesKeyBytes(aesKeyBase64);
  const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
  const iv = new Uint8Array(GCM_IV_LENGTH);
  const plaintext = toU8(Buffer.from(sha256Hex(payload), "utf8"));

  // subtle.encrypt returns ciphertext with the auth tag appended, so this is already
  // ciphertext || tag — just prepend the iv to match the wire format.
  const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: GCM_TAG_LENGTH * 8 }, key, plaintext);

  return Buffer.concat([Buffer.from(iv), Buffer.from(encrypted)]).toString("hex");
}

/**
 * Verifies an idp_checksum (or, symmetrically, could verify an sp_checksum) against the
 * expected payload string. Returns false (never throws) on any malformed input, bad key,
 * or authentication-tag mismatch.
 */
export async function verifyChecksum(payload: string, checksumHex: string, aesKeyBase64: string): Promise<boolean> {
  try {
    const keyBytes = decodeAesKeyBytes(aesKeyBase64);
    const combined = Buffer.from(checksumHex, "hex");
    if (combined.length <= GCM_IV_LENGTH + GCM_TAG_LENGTH) return false;

    const iv = toU8(combined.subarray(0, GCM_IV_LENGTH));
    const ciphertextAndTag = toU8(combined.subarray(GCM_IV_LENGTH));

    const key = await crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["decrypt"]);
    // Throws (caught below) if the auth tag doesn't verify.
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv, tagLength: GCM_TAG_LENGTH * 8 }, key, ciphertextAndTag);
    const plaintext = Buffer.from(decrypted).toString("utf8");

    const expected = sha256Hex(payload);
    const a = Buffer.from(plaintext, "utf8");
    const b = Buffer.from(expected, "utf8");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** BASE64URL, no padding — matches Java's Base64.encodeBase64URLSafeString. */
export function base64Url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf.toString("base64url");
}

export function base64UrlDecode(input: string): Buffer {
  return Buffer.from(input, "base64url");
}

/**
 * Decodes an sp_ticket ("BASE64URL(payload).BASE64URL(SHA256(BASE64URL(payload)))") and
 * independently recomputes the digest to flag corruption/tampering of the ticket itself.
 * Note this digest is an integrity check, not a MAC — it does not prove the ticket came
 * from MOICA, only that the two segments are internally consistent.
 */
export function decodeSpTicket(spTicket: string): DecodedSpTicket {
  const dotIndex = spTicket.indexOf(".");
  if (dotIndex < 0) {
    throw new Error('sp_ticket is missing the "." separator between payload and digest');
  }
  const payloadSegment = spTicket.slice(0, dotIndex);
  const digestSegment = spTicket.slice(dotIndex + 1);

  const payloadJsonStr = base64UrlDecode(payloadSegment).toString("utf8");
  let payload: Record<string, unknown> | string;
  try {
    payload = JSON.parse(payloadJsonStr);
  } catch {
    payload = payloadJsonStr;
  }

  const expectedDigest = createHash("sha256").update(Buffer.from(payloadSegment, "utf8")).digest("base64url");

  return {
    payloadSegment,
    digestSegment,
    payload,
    digestValid: expectedDigest === digestSegment,
  };
}

/** Extracts sp_ticket_id (needed by SP-API-ATH-02) from a decoded sp_ticket. */
export function extractSpTicketId(spTicket: string): string {
  const { payload } = decodeSpTicket(spTicket);
  if (typeof payload === "string" || !("sp_ticket_id" in payload)) {
    throw new Error("Decoded sp_ticket payload has no sp_ticket_id field");
  }
  return String(payload.sp_ticket_id);
}

export function extractTransactionId(spTicket: string): string | undefined {
  const { payload } = decodeSpTicket(spTicket);
  if (typeof payload === "string" || !("transaction_id" in payload)) return undefined;
  return String(payload.transaction_id);
}
