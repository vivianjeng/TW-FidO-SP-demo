import { NextRequest, NextResponse } from "next/server";
import { getSessionConfig, resolveHosts, isConfigComplete } from "@/lib/moica/config";
import { computeChecksum, genTransactionId } from "@/lib/moica/crypto";
import { webRedirectSpChecksumPayload } from "@/lib/moica/payload";
import type { WebRedirectFields } from "@/lib/moica/types";

// SP-API-WEB-01 is a browser-navigated WEB UI, not a server-to-server REST call: the SP
// only needs to compute transaction_id + sp_checksum locally, then have the browser
// auto-submit a POST form straight to https://{fidoweb}/fidoRedirect/web.
export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const config = await getSessionConfig();
  const hosts = resolveHosts(config);

  if (!isConfigComplete(config)) {
    return NextResponse.json(
      { error: "Environment is not configured yet. Set sp_service_id and AES key on the Settings page first." },
      { status: 400 }
    );
  }
  if (!config.spCallbackUrl) {
    return NextResponse.json(
      { error: "Set an SP Callback URL on the Settings page — MOICA needs somewhere reachable to POST the result." },
      { status: 400 }
    );
  }

  const transaction_id: string = body.transaction_id || genTransactionId();
  const sp_service_id: string = body.sp_service_id_override?.trim() || config.spServiceId;
  const op_code = body.op_code ?? "SIGN";
  const hint: string = body.hint ?? "";
  const sign_type = body.sign_type;
  const sign_data: string | undefined = body.sign_data;
  const tbs_encoding = body.tbs_encoding;
  const hash_algorithm = body.hash_algorithm;
  const time_limit: number | undefined = body.time_limit ? Number(body.time_limit) : undefined;

  const spChecksumPayload = webRedirectSpChecksumPayload({
    transaction_id,
    sp_service_id,
    op_code,
    hint,
    sign_data: op_code === "SIGN" ? sign_data : undefined,
  });
  const sp_checksum = computeChecksum(spChecksumPayload, config.aesKeyBase64);

  const fields: WebRedirectFields = {
    transaction_id,
    op_code,
    sp_service_id,
    sp_checksum,
    hint,
    ...(op_code === "SIGN"
      ? { sign_type, sign_data, tbs_encoding, hash_algorithm }
      : {}),
    ...(time_limit ? { time_limit } : {}),
  };

  return NextResponse.json({
    fields,
    spChecksumPayload,
    actionUrl: `https://${hosts.fidoweb}/fidoRedirect/web`,
  });
}
