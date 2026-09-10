import { NextRequest, NextResponse } from "next/server";
import { getSessionConfig, resolveHosts, isConfigComplete } from "@/lib/moica/config";
import { postMoicaApi, moicaUrl } from "@/lib/moica/client";
import { computeChecksum, decodeSpTicket, genTransactionId, verifyChecksum } from "@/lib/moica/crypto";
import { ath04SpChecksumPayload, ticketIdpChecksumPayload } from "@/lib/moica/payload";
import type { BatchSignInfo, DoBatchSigningRequest, DoBatchSigningResponse, ProxyResult } from "@/lib/moica/types";

const PATH = "/moise/sp/doBatchSigning";
const MAX_DOCS = 20;
const MAX_DOC_LEN = 1024;

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

  const sign_info: BatchSignInfo = body.sign_info ?? { sign_data_set: [] };
  if (!Array.isArray(sign_info.sign_data_set) || sign_info.sign_data_set.length === 0) {
    return NextResponse.json({ error: "sign_info.sign_data_set must be a non-empty array." }, { status: 400 });
  }
  if (sign_info.sign_data_set.length > MAX_DOCS) {
    return NextResponse.json({ error: `sign_data_set may contain at most ${MAX_DOCS} documents (BATSIGN_CNT_LIMIT).` }, { status: 400 });
  }
  const tooLong = sign_info.sign_data_set.find((d: string) => d.length > MAX_DOC_LEN);
  if (tooLong) {
    return NextResponse.json({ error: `Each document is limited to ${MAX_DOC_LEN} characters (SIGNDATA_LEN_LIMIT).` }, { status: 400 });
  }

  const transaction_id: string = body.transaction_id || genTransactionId();
  const sp_service_id: string = body.sp_service_id_override?.trim() || config.spServiceId;
  const id_num: string = body.id_num ?? "";
  const op_code = "BATSIGN" as const;
  const op_mode = body.op_mode ?? "PUSH";
  const hint: string = body.hint ?? "";
  const device_user_def_desc: string | undefined = body.device_user_def_desc || undefined;
  const time_limit: number | undefined = body.time_limit ? Number(body.time_limit) : undefined;

  const spChecksumPayload = ath04SpChecksumPayload({ transaction_id, sp_service_id, id_num, op_code, op_mode, hint });
  const sp_checksum = await computeChecksum(spChecksumPayload, config.aesKeyBase64);

  const reqBody: DoBatchSigningRequest = {
    transaction_id,
    sp_service_id,
    sp_checksum,
    id_num,
    op_code,
    op_mode,
    hint,
    ...(device_user_def_desc ? { device_user_def_desc } : {}),
    ...(time_limit ? { time_limit } : {}),
    sign_info,
  };

  const remote = await postMoicaApi<DoBatchSigningResponse>(hosts.fidoapi, PATH, reqBody);

  const result: ProxyResult<DoBatchSigningResponse> = {
    request: { url: moicaUrl(hosts.fidoapi, PATH), body: reqBody },
    spChecksumPayload,
    spChecksum: sp_checksum,
    network: { ok: remote.ok, status: remote.status, error: remote.error, durationMs: remote.durationMs },
    response: remote.json,
  };

  const spTicket = remote.json?.result?.sp_ticket;
  const idpChecksum = remote.json?.result?.idp_checksum;
  if (spTicket && idpChecksum) {
    const idpPayload = ticketIdpChecksumPayload({
      transaction_id,
      error_code: remote.json!.error_code,
      sp_ticket: spTicket,
    });
    result.idpChecksumPayload = idpPayload;
    result.idpChecksumValid = await verifyChecksum(idpPayload, idpChecksum, config.aesKeyBase64);
    try {
      result.decodedSpTicket = decodeSpTicket(spTicket);
    } catch {
      // leave undefined
    }
  }

  return NextResponse.json(result);
}
