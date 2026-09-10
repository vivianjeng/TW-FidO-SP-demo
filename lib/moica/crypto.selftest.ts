// Self-contained correctness check for computeChecksum/verifyChecksum/decodeSpTicket,
// run with `npx tsx lib/moica/crypto.selftest.ts` (see SPEC.md §11 for why this exists
// instead of matching the PDF's worked hex examples digit-for-digit).

import { randomBytes, createHash } from "crypto";
import { computeChecksum, verifyChecksum, decodeSpTicket, base64Url } from "./crypto";

function assert(cond: boolean, msg: string): void {
  if (!cond) {
    console.error(`FAIL: ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`ok: ${msg}`);
  }
}

async function main() {
  const aesKeyBase64 = randomBytes(32).toString("base64");
  const payload = "046b6c7f-0b8a-43b9-b35d-6489e6daee917b2c7f94-9f7b-481a-89a8-56b883dea695A123456789SIGNI-SCAN待簽署資料DOC_DATA";

  // 1. round trip: compute then verify against the *same* payload succeeds.
  const checksum = await computeChecksum(payload, aesKeyBase64);
  assert(/^[0-9a-f]+$/.test(checksum), "checksum is lowercase hex");
  assert(
    (await verifyChecksum(payload, checksum, aesKeyBase64)) === true,
    "verifyChecksum accepts a checksum of the same payload"
  );

  // 2. tamper with the payload -> verification must fail.
  assert(
    (await verifyChecksum(payload + "x", checksum, aesKeyBase64)) === false,
    "verifyChecksum rejects a mismatched payload"
  );

  // 3. wrong key -> verification must fail, not throw.
  const wrongKey = randomBytes(32).toString("base64");
  assert((await verifyChecksum(payload, checksum, wrongKey)) === false, "verifyChecksum rejects the wrong AES key");

  // 4. structural shape: 12-byte IV + ciphertext(32 bytes plaintext hex->64 ascii bytes) + 16-byte tag = 92 bytes = 184 hex chars.
  assert(checksum.length === (12 + 64 + 16) * 2, `checksum hex length is ${(12 + 64 + 16) * 2} chars (got ${checksum.length})`);

  // 12-byte IV -> 24 hex chars, all zero per the Spec.
  const ivHexLen = 24;
  assert(
    checksum.slice(0, ivHexLen) === "0".repeat(ivHexLen),
    `first ${ivHexLen} hex chars (the IV) are all zero`
  );

  // 5. sp_ticket decode/digest round trip.
  const ticketPayload = { transaction_id: "t-1", sp_ticket_id: "st-1", op_code: "SIGN" };
  const payloadSegment = base64Url(JSON.stringify(ticketPayload));
  const digestSegment = createHash("sha256").update(Buffer.from(payloadSegment, "utf8")).digest("base64url");
  const spTicket = `${payloadSegment}.${digestSegment}`;
  const decoded = decodeSpTicket(spTicket);
  assert(decoded.digestValid === true, "decodeSpTicket verifies a well-formed ticket's digest");
  assert(
    (decoded.payload as Record<string, unknown>).sp_ticket_id === "st-1",
    "decodeSpTicket recovers the original JSON payload"
  );

  const corrupted = `${payloadSegment}.${digestSegment.slice(0, -1)}x`;
  assert(decodeSpTicket(corrupted).digestValid === false, "decodeSpTicket flags a corrupted digest segment");

  if (process.exitCode === 1) {
    console.error("\nSelf-test FAILED");
  } else {
    console.log("\nAll self-tests passed.");
  }
}

main();
