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

## Deploying to Cloudflare Pages

This app is a full-stack Next.js app (Route Handlers, `cookies()`, Node's `crypto` for
the AES-GCM checksum work) — it is **not** a static export, so classic Cloudflare
Pages routing (which just serves files by path) can't run it: every request 404s with
an empty body. It's built for Cloudflare's Workers runtime via
[`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare), then deployed to Pages
in **Advanced Mode**, where a `_worker.js` at the root of the published directory takes
over all routing. That package has no built-in Pages target, so
`scripts/prepare-pages-worker.mjs` bridges the two after each OpenNext build:

1. Writes `.open-next/assets/_worker.js` as a thin re-export of `.open-next/worker.js`
   — `wrangler pages deploy` then bundles that relative import (and everything *it*
   imports) into one self-contained script before upload, the same way `wrangler
   deploy` bundles a Workers `main` entry.
2. Patches `__ASSETS_RUN_WORKER_FIRST__` from `false` to `true` in the compiled
   `.open-next/cloudflare/init.js`. Without this, every static file
   (`_next/static/*`, images, etc.) 404s even though pages/API routes work fine and
   the files genuinely exist in the deployed output — confirmed by testing. That flag
   is normally set from wrangler.jsonc's `assets.run_worker_first`, but Pages configs
   can't declare an `assets` block at all (the binding name `ASSETS` is reserved —
   Pages always provides one itself), so it's stuck at its `false` default, which
   assumes a Workers-style platform bypass for static files that Pages Advanced Mode
   doesn't actually do. Patching the compiled output is the only lever available.

**`wrangler` requires Node.js ≥22** — check with `node -v`; the rest of this project
(`next dev`/`next build`) works fine on Node 20+.

**If deploying via Cloudflare's Git-integration dashboard** (Workers & Pages → this
project → Settings → Builds), you **must** set:

- Build command: `npm run pages:build`
- Build output directory: `.open-next/assets`

Unlike Workers, a Pages-shaped `wrangler.jsonc` (one with `pages_build_output_dir`)
cannot declare its own build command — Cloudflare's config validator rejects a `build`
field there outright (`Configuration file for Pages projects does not support "build"`).
Leaving the dashboard's Build command unset (or at its default) skips the build step
entirely and fails with `Output directory ".open-next/assets" not found`, since nothing
ever produced it.

```bash
npm run pages:preview   # build + run locally under a real Pages/Workers runtime (no Cloudflare account needed)
npx wrangler login      # one-time, opens a browser to authenticate
npm run pages:deploy    # build + wrangler pages deploy
```

`wrangler.jsonc` carries `pages_build_output_dir` (which is what marks it as a Pages,
not Workers, config) plus `compatibility_date`/`compatibility_flags` (`nodejs_compat` is
required — without it, every Route Handler using `cookies()`/`crypto` throws) and the
non-secret `FIDO_ENVIRONMENT` var. Set `sp_service_id`/AES key as **Pages secrets**, not
plain `vars` (that file is committed to git):

```bash
npx wrangler pages secret put FIDO_SP_SERVICE_ID --project-name tw-fido-sp-demo
npx wrangler pages secret put FIDO_AES_KEY --project-name tw-fido-sp-demo
npm run pages:deploy    # redeploy to pick them up
```

If you're using Cloudflare's Git-integration dashboard instead of deploying from the
CLI, set the project's **Build command** to `npm run pages:build` and **Build output
directory** to `.open-next/assets` (the `_worker.js` step must run as part of that
build — a plain `next build` alone produces no Pages-compatible output at all, which is
what causes an all-paths-404 deployment).

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
