import { NextRequest, NextResponse } from "next/server";
import { getSessionConfig, resolveHosts, isConfigComplete } from "@/lib/moica/config";
import { postMoicaApi, moicaUrl } from "@/lib/moica/client";
import { computeChecksum, decodeSpTicket, genTransactionId, verifyChecksum } from "@/lib/moica/crypto";
import { ath01SpChecksumPayload, ticketIdpChecksumPayload } from "@/lib/moica/payload";
import type { GetSpTicketRequest, GetSpTicketResponse, ProxyResult, SignInfo } from "@/lib/moica/types";

const PATH = "/moise/sp/getSpTicket";

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

  const transaction_id: string = body.transaction_id || genTransactionId();
  const sp_service_id: string = body.sp_service_id_override?.trim() || config.spServiceId;
  const id_num: string = body.id_num ?? "";
  const op_code = body.op_code ?? "ATH";
  const op_mode = body.op_mode ?? "I-SCAN";
  const hint: string = body.hint ?? "";
  const time_limit: number | undefined = body.time_limit ? Number(body.time_limit) : undefined;
  // Per Spec: sign_info is required "當 op_code 為 SIGN 時" — NFCSIGN reads the card
  // directly on-device and does not take sign_info from the SP.
  const sign_info: SignInfo | undefined = op_code === "SIGN" ? body.sign_info : undefined;

  const spChecksumPayload = ath01SpChecksumPayload({
    transaction_id,
    sp_service_id,
    id_num,
    op_code,
    op_mode,
    hint,
    sign_data: sign_info?.sign_data,
  });
  const sp_checksum = await computeChecksum(spChecksumPayload, config.aesKeyBase64);

  const reqBody: GetSpTicketRequest = {
    transaction_id,
    sp_service_id,
    sp_checksum,
    id_num,
    op_code,
    op_mode,
    hint,
    ...(time_limit ? { time_limit } : {}),
    ...(sign_info ? { sign_info } : {}),
  };

  const remote = await postMoicaApi<GetSpTicketResponse>(hosts.fidoapi, PATH, reqBody);

  const result: ProxyResult<GetSpTicketResponse> = {
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
      // leave undefined; UI shows raw ticket only
    }
  }

  return NextResponse.json(result);
}
