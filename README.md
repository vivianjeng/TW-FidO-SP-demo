# TW FidO SP Demo

A Service-Provider-side demo/sandbox for Taiwan's 行動自然人憑證 (Mobile Citizen Digital
Certificate, aka TW FIDO) API. See [`SPEC.md`](./SPEC.md) for the full write-up —
architecture, every interface implemented, the checksum/ticket crypto, and known
limitations.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000, then:

1. Go to **Settings** and enter your MOI-issued `sp_service_id` and AES key (base64,
   must decode to 32 bytes). Without these, every page will tell you the environment
   isn't configured yet — there is no mock/fake backend, this app only talks to the
   real MOICA servers.
2. Pick a flow from the dashboard (ATH-01 ticket issuance, ATH-03 push, ATH-04 batch
   signing, LF-01 device status, the WEB-01 redirect, or the standalone APP-API-01
   deep-link builder) and customize the request fields — TBS/`sign_data`, `sign_type`
   (PKCS#1/PKCS#7/RAW), encoding, hash algorithm, `op_code`/`op_mode`, etc.
3. Every response panel shows the exact request sent, the computed `sp_checksum`, the
   raw response, and whether the returned `idp_checksum` verifies — this is meant to
   teach the protocol, not just execute it.

## Scripts

- `npm run dev` — dev server (Turbopack)
- `npm run build` / `npm run start` — production build/serve
- `npm run lint` — ESLint
- `npx tsc --noEmit` — type-check only
- `npx tsx lib/moica/crypto.selftest.ts` — round-trip self-test for the
  sp_checksum/idp_checksum/sp_ticket crypto (see SPEC.md §11 for why this exists
  instead of matching the source spec's worked hex examples byte-for-byte)

## Notes

- Config (environment, `sp_service_id`, AES key) is stored server-side in memory per
  browser session — never sent to client-side JS, cleared on server restart. This is a
  deliberate demo-scope limitation, see SPEC.md §10.
- The UAT host (`fidoapi-test.moi.gov.tw`) was reachable from this project's dev
  environment during development despite being documented as Taiwan-only in the source
  spec; don't assume that holds for every deployment (see SPEC.md §3).
- `SP-API-WEB-01` (the `/redirect` page) needs a publicly reachable `sp_callback_url`
  for MOICA to POST results back to — set one on Settings, or use this app's own
  `/api/callback?sid=...` if this deployment itself is publicly reachable.
