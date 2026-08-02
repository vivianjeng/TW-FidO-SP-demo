import { NextRequest, NextResponse } from "next/server";
import { getConfigBySessionId } from "@/lib/moica/config";
import { verifyChecksum } from "@/lib/moica/crypto";
import { webRedirectIdpChecksumPayload } from "@/lib/moica/payload";
import { saveCallbackResult } from "@/lib/moica/callbackStore";
import type { WebRedirectCallback } from "@/lib/moica/types";

// This is SP-API-WEB-01's "SP Callback URL" target: MOICA's server POSTs the
// authentication/signature result here as an application/x-www-form-urlencoded form
// (see Spec §參.二.(一).範例), not JSON, and with no cookie from the original browser
// session — hence the `?sid=` correlation id documented in SPEC.md §6.2/§9.
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const get = (key: string) => String(form.get(key) ?? "");

  const callback: WebRedirectCallback = {
    transaction_id: get("transaction_id"),
    error_code: get("error_code"),
    id_num: get("id_num"),
    signed_response: get("signed_response"),
    cert: form.has("cert") ? get("cert") : undefined,
    idp_checksum: get("idp_checksum"),
  };

  const sid = request.nextUrl.searchParams.get("sid") ?? "";
  const sessionConfig = sid ? getConfigBySessionId(sid) : undefined;

  const idpChecksumPayload = webRedirectIdpChecksumPayload(callback);
  const idpChecksumValid = sessionConfig
    ? verifyChecksum(idpChecksumPayload, callback.idp_checksum, sessionConfig.aesKeyBase64)
    : false;

  if (callback.transaction_id) {
    saveCallbackResult(callback.transaction_id, {
      callback,
      idpChecksumValid,
      idpChecksumPayload,
      receivedAt: Date.now(),
    });
  }

  const redirectUrl = new URL("/redirect/result", request.url);
  if (callback.transaction_id) redirectUrl.searchParams.set("tx", callback.transaction_id);
  if (!sid) redirectUrl.searchParams.set("nosid", "1");
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
