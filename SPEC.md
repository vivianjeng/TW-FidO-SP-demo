# TW FidO (行動自然人憑證) SP Demo Site — Specification

Status: Draft v1
Source of truth: `行動自然人憑證應用程式介面規格書_v2.9.pdf` (MOI_CA_DEV_API, 2026-03-18), hereafter "the Spec"

## 1. Purpose

Build a website that plays the role of a **Service Provider (SP / 需用機關)** integrating
with Taiwan's Ministry of the Interior "行動自然人憑證" (Mobile Citizen Digital Certificate,
aka TW FIDO) platform. The site lets a developer:

- Trigger every SP-facing flow described in the Spec (web redirect, ticket-based
  authentication/signing, push, continuous/batch signing, device-binding check).
- Freely customize every request field the Spec marks as SP-controlled — most importantly
  the **TBS (to-be-signed data / `sign_data`)**, **signature format (`sign_type`:
  PKCS#1 / PKCS#7 / RAW)**, **TBS encoding**, **hash algorithm**, `op_code`/`op_mode`,
  `hint`, `time_limit`, and (for batch) the `sign_data_set` list.
- See exactly what is sent over the wire (computed `sp_checksum`, JSON payload), what
  comes back, and whether the returned `idp_checksum` verifies — i.e. a live teaching
  tool for the protocol, not just a client SDK.

This is a **real-backend demo**: it calls the actual MOICA endpoints
(`fidoapi-test.moi.gov.tw` / `fido-test.moi.gov.tw` by default, switchable to production
hosts) using an operator-supplied `sp_service_id` and AES key. It does not fabricate
responses. Everything the site cannot do without real MOI-issued credentials (approve a
signature on an actual citizen's phone, for instance) is left to the real 行動自然人憑證
APP — the site only implements the SP side.

## 2. Non-goals

- Not a replacement for the 行動自然人憑證 APP — no biometric/PIN verification happens
  on this site; that always happens on the user's phone.
- Not multi-tenant production software. Config (sp_service_id, AES key) is stored
  server-side per browser session for convenience of a demo/sandbox, not hardened for
  hosting untrusted third parties.
- Does not implement "TW FIDO 既有服務無痛移轉介面" (the legacy TW FIDO migration
  shim) — the Spec says this was removed in v2.6 and is out of scope.

## 3. Known environment constraint

Per Spec §貳.三 ("防火牆清單"), the UAT host `fidoapi-test.moi.gov.tw` is documented as
**境外不可連線** ("not reachable from outside Taiwan"), and the production host is
IP-allow-listed to registered government/agency egress IPs. In practice, `getSpTicket`
and `checkDeviceStatus` calls made from this dev sandbox *did* reach
`fidoapi-test.moi.gov.tw` (HTTP 200, business-level `SP-API-ATH-01-INV_SP_CHECKSUM` /
`SP-API-LF-01-INV_SP_CHECKSUM` for the placeholder `sp_service_id`/AES key used during
development) — so the documented restriction is either narrower than it reads, no
longer enforced, or specific to this sandbox's egress path. Don't rely on that holding
for every deployment: some networks (most cloud CI, some clouds) will still see this
host time out or refuse the connection, so the UI still must never assume the remote
call succeeds — treat it as expected/possible, not a bug in this app:

- Never assume the remote call succeeds; show connection failures distinctly from
  protocol failures (`error_code` from MOICA) and from local validation failures.
- Let every request be inspected/copied (curl-equivalent) even when the live call
  fails, so the tool still teaches the protocol when the network is unreachable.

## 4. Tech stack

- Next.js 15.5.21 (App Router) + TypeScript. One project serves both the UI and the
  SP-side "backend" (Next.js Route Handlers acting as the SP's server, per the Spec's
  own architecture where the SP has a Web tier and a Backend tier).
  Pinned below 16.x deliberately: Next.js 16.2.x's App Router bundling stopped
  producing the `handler` named export that `@opennextjs/cloudflare` 1.20.2's request
  pipeline expects, causing every route to 500 with
  `TypeError: components.ComponentMod.handler is not a function` once deployed to
  Cloudflare (confirmed against opennextjs-cloudflare's own issue tracker, e.g. #1258 —
  a known regression with no fixed version at time of writing). Revisit the version pin
  once that's resolved upstream; `@opennextjs/cloudflare`'s own peerDependencies range
  (`>=15.5.21 <16 || >=16.2.11`) is what set the floor here.
- No database. Per-session config lives server-side in memory keyed by a random
  session id stored in an httpOnly cookie (`twfido_session`). Restarting the server
  clears it — acceptable for a demo.
- `qrcode` npm package to render QR images for QRCode-mode tickets, client-side canvas.
- No other network/services dependencies.

## 5. Environments

| Name | fidoweb | fidoapi |
|---|---|---|
| UAT (default) | `fido-test.moi.gov.tw` | `fidoapi-test.moi.gov.tw` |
| Production | `fido.moi.gov.tw` | `fidoapi.moi.gov.tw` |
| Custom | user-supplied host (for pointing at a local mock, if the operator builds one later) |

Configured on `/settings`, stored per-session:

- `environment`: `uat` \| `prod` \| `custom` (+ custom host fields)
- `sp_service_id`: string (from MOI onboarding)
- `aes_key_base64`: string, standard base64, decodes to a 32-byte AES-256 key
- `sp_callback_url`: only relevant for SP-API-WEB-01 — must be a URL that MOICA's
  servers can reach; for local dev, this is almost always unreachable, so the settings
  page explicitly warns about this and defaults to this app's own `/api/callback` on
  its public deployment URL if `NEXT_PUBLIC_BASE_URL` is set.

The AES key and full `sp_service_id` are never sent to client-side JS — every operation
that needs them happens in a Route Handler; the browser only ever sees the resulting
checksums/tickets/decoded JSON.

## 6. Data formats (from Spec §參.三) — implementation notes

### 6.1 `transaction_id`
UUIDv4 (or another ≤100-char identifier). The UI auto-generates one per request with a
"regenerate" button; user may overwrite it freely (it's an explicit "customizable input").

### 6.2 `sp_checksum` / `idp_checksum`

Both use the identical algorithm, `AES_GCM_HEX(SHA256_HEX(Payload))`, over different
payload strings (`sp_checksum` is SP→IdP; `idp_checksum` is IdP→SP, verified locally):

1. Build `payload` by string-concatenating the fields the relevant interface specifies,
   in order, using `""` for any omitted optional field.
2. `hex = SHA256(payload.getBytes("UTF-8"))` → lowercase hex string (64 chars).
3. AES-256-GCM encrypt the **hex string's UTF-8 bytes** (not the raw 32-byte digest)
   with a fixed all-zero 12-byte IV and a 128-bit auth tag, using the operator's AES
   key. This yields `ciphertext || tag`.
4. Result = `hex(iv) || hex(ciphertext || tag)`, a single hex string.

To verify an inbound `idp_checksum`: split off the first 12 bytes as IV (should be all
zero), AES-GCM-decrypt the remainder with the same key/IV, and compare the recovered
UTF-8 string against a freshly computed `SHA256_HEX(payload)` for the expected payload.

> Implementation note: the Spec's worked numeric examples (§參.三.三 and §參.三.四) have
> text-extraction artifacts from the PDF (hex digits reordered across a page break) and
> could not be reproduced byte-for-byte during drafting. The algorithm description and
> Java reference code in the Spec are unambiguous and are what this app implements;
> correctness is instead verified with an internal encrypt→decrypt round-trip test
> (see §11) and, ultimately, against the real UAT server once reachable.

Zero IV + a per-operator static key is safe here only because every payload is unique
(contains a fresh `transaction_id`/nonce-like value), so GCM is never asked to encrypt
two different messages under the same (key, IV) pair for the same operator — this is
the Spec's design choice, not this app's; it is called out in the Reference page for
transparency, not re-derived or second-guessed.

### 6.3 `sp_ticket`

`BASE64URL(payloadJson) + "." + BASE64URL(SHA256(BASE64URL(payloadJson)))`

i.e. a two-segment, not three-segment, JWT-like token: base64url(JSON payload), a dot,
then base64url(SHA-256 of the *first segment's ASCII bytes*) as an integrity digest
(not a MAC — anyone can recompute it; it only guards against transcription corruption,
not tampering). The app's ticket-decode helper splits on the first `.`, base64url-decodes
segment 1 to pretty-printed JSON, recomputes segment 2, and flags a mismatch.

## 7. Interface coverage

Every interface number below is a section on the Reference page (linking back to the
Spec's own section for the field-by-field table) and a working page/route in the app.

| Spec ID | Name | App route | UI page |
|---|---|---|---|
| SP-API-WEB-01 | 網頁轉導模式介面 (`fidoRedirect/web`) | `POST /api/redirect-token` (computes fields, browser then form-POSTs to `{fidoweb}` directly) + `POST /api/callback` (receives result) | `/redirect` |
| SP-API-ATH-01 | 請求 SP ticket (`getSpTicket`) | `POST /api/ath01` | `/ticket` |
| SP-API-ATH-02 | 查詢認證/簽章結果 (`getAthOrSignResult`) | `POST /api/ath02` | `/result` |
| SP-API-ATH-03 | 請求認證/簽章推播 (`requestAthOrSignPush`) | `POST /api/ath03` | `/push` |
| SP-API-ATH-04 | 請求連續簽章 SP ticket (`doBatchSigning`) | `POST /api/ath04` | `/batch` |
| SP-API-LF-01 | 確認使用者裝置綁定狀態 (`checkDeviceStatus`) | `POST /api/lf01` | `/device-status` |
| APP-API-01 | 認證/簽章功能 (`mobilemoica://…/verifySign`) | client-side only (URL builder + QR) | `/app-link`, embedded in `/ticket` & `/batch` for APP2APP/MWEB2APP modes |

Every Route Handler above returns a uniform debug envelope so the UI can show its work:

```ts
type ProxyResult<T> = {
  request: { url: string; body: unknown };       // exactly what was/would be sent
  spChecksumPayload: string;                      // the pre-hash string, for teaching
  network: { ok: boolean; status?: number; error?: string };
  response?: T;                                   // parsed MOICA response, if any
  idpChecksumValid?: boolean;                      // null if not applicable/checkable
  decodedSpTicket?: unknown;                       // present wherever sp_ticket appears
};
```

## 8. Customizable inputs (per page)

All fields below are exposed as editable form controls (not hardcoded), with sensible
generated defaults so a first click "just works" against whatever the backend returns.

- **Identity/session**: `id_num`, `transaction_id` (regenerate button), `hint`,
  `time_limit` (30–600s, default 60), `device_user_def_desc` (push/APP2APP only).
- **Operation shape**: `op_code` (`ATH`/`SIGN`/`NFCSIGN`, plus `BATSIGN` on the batch
  page only), `op_mode` (`I-SCAN`/`APP2APP`/`MWEB2APP`/`PUSH` depending on page).
- **Signature**: `sign_type` (`PKCS#1`/`PKCS#7`/`RAW`), `sign_data`/TBS (free-text
  textarea with a "treat as UTF-8 text" vs "already base64" toggle that drives
  `tbs_encoding`; RAW forces `tbs_encoding=base64`), `hash_algorithm`
  (`SHA1`/`SHA256`/`SHA384`/`SHA512`; hidden when `sign_type=RAW`, since the Spec says
  RAW ignores it).
- **Batch-only**: repeatable `sign_data_set` editor, add/remove rows, 1–20 items,
  1024-char cap per item enforced client-side with a live counter.
- **Environment overrides**: every page allows a one-off override of `sp_service_id`
  for the single request (useful for testing "wrong SP id" error paths) without
  touching the saved settings.

## 9. Pages

- `/` — Dashboard: current environment, whether config is set, links to every flow,
  and a "reachability check" button that pings `{fidoapi}` and reports raw connect
  success/failure (distinct from any MOICA `error_code`).
- `/settings` — environment/select, sp_service_id, AES key (masked input), callback
  URL, with inline validation (AES key must base64-decode to 32 bytes).
- `/redirect` — SP-API-WEB-01: builds and auto-submits the hidden form described in
  the Spec's own HTML samples; `/redirect/result` shows what `/api/callback` captured.
- `/ticket` — SP-API-ATH-01, tabs for I-SCAN (renders QR of `sp_ticket`), APP2APP
  (deep link + "open app" button), MWEB2APP (deep link styled for mobile web).
- `/push` — SP-API-ATH-03 (always `op_mode` implied `PUSH`, no QR).
- `/batch` — SP-API-ATH-04, same three op_mode tabs as `/ticket` but for `BATSIGN`.
- `/result` — SP-API-ATH-02: paste/select a `sp_ticket` (or pick one from this
  session's history), app extracts `sp_ticket_id`/`transaction_id`, polls on a
  ≥4s interval per the Spec's stated recommendation, shows `signed_response`(_set) and
  `cert` as they arrive.
- `/device-status` — SP-API-LF-01.
- `/app-link` — standalone APP-API-01 deep-link/QR builder from any `sp_ticket` +
  `rtn_url`/`rtn_val`, for testing App-to-App/Mobile-Web-to-App independent of how the
  ticket was obtained.
- `/reference` — condensed field tables, the checksum/ticket algorithms from §6, and
  the Spec's error-code table (`{介面編號}-{系統錯誤代碼}` format) with the
  troubleshooting text, so operators don't need the PDF open side-by-side.

## 10. Security notes

- AES key + full `sp_service_id` never reach client JS; only computed checksums,
  tickets, and decoded/verified results do.
- Session config stored server-memory only (no disk persistence) — restarting the dev
  server forgets it; documented as a demo limitation, not a bug.
- `/api/callback` (the SP Callback URL target) must independently verify the inbound
  `idp_checksum` before trusting `signed_response`/`id_num` — implemented, and the UI
  surfaces verification failures loudly rather than silently trusting the payload.

## 11. Verification plan

Because the Spec's own worked checksum examples couldn't be reproduced digit-for-digit
from the extracted PDF text (see §6.2 note), correctness is established by:

1. A round-trip unit test: encrypt a payload with the `sp_checksum` routine, feed the
   ciphertext back through the `idp_checksum` verifier with the same payload, and
   assert it validates; assert it invalidates when the payload is tampered.
2. Structural checks against the Spec's Java reference snippets (SHA-256 of UTF-8
   bytes, 12-byte zero IV, 128-bit GCM tag, hex/base64url encodings) line by line.
3. Live test against `fidoapi-test.moi.gov.tw` with placeholder (unregistered)
   credentials during development: `getSpTicket`, `checkDeviceStatus`, and the
   `/api/callback` idp_checksum verifier (round-tripped against a synthetic callback)
   all behaved as expected — HTTP 200 with a business-level `INV_SP_CHECKSUM` for the
   placeholder key/id (proving the request shape and encoding are accepted by the real
   server), and idp_checksum verification correctly flags both a genuine and a tampered
   payload. What remains untested is a full success path (`error_code: "0"` and a real
   `signed_response`/ticket), which needs an operator's actual registered
   `sp_service_id`/AES key — flagged as a follow-up in §12, not something fakeable here.

## 12. Open items for the operator

- Real `sp_service_id` + AES key from MOI onboarding (not available in this session).
- A publicly reachable HTTPS URL for `sp_callback_url` if `/redirect` (SP-API-WEB-01)
  is to be exercised end-to-end outside of local-only testing.
- Confirmation of which environment (UAT vs production) to default to on first run;
  UAT is chosen as the safe default here.
