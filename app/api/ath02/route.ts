import { NextRequest, NextResponse } from "next/server";
import { getSessionConfig, resolveHosts, isConfigComplete } from "@/lib/moica/config";
import { postMoicaApi, moicaUrl } from "@/lib/moica/client";
import { computeChecksum, decodeSpTicket, verifyChecksum } from "@/lib/moica/crypto";
import { ath02IdpChecksumPayload, ath02SpChecksumPayload } from "@/lib/moica/payload";
import type { GetAthOrSignResultRequest, GetAthOrSignResultResponse, ProxyResult } from "@/lib/moica/types";

const PATH = "/moise/sp/getAthOrSignResult";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const config = await getSessionConfig();
  const hosts = resolveHosts(config);

  if (!isConfigComplete(config)) {
    return NextResponse.json(
      { error: "Environment is not configured yet. Set sp_service_id and AES key on the Settings page first." },
      { status: 400 }
    );
  }

  const spTicket: string | undefined = body.sp_ticket;
  let transaction_id: string = body.transaction_id ?? "";
  let sp_ticket_id: string = body.sp_ticket_id ?? "";

  if (spTicket) {
    try {
      const decoded = decodeSpTicket(spTicket);
      const payload = decoded.payload as Record<string, unknown>;
      transaction_id = String(payload.transaction_id ?? transaction_id);
      sp_ticket_id = String(payload.sp_ticket_id ?? sp_ticket_id);
    } catch (err) {
      return NextResponse.json({ error: `Could not decode sp_ticket: ${(err as Error).message}` }, { status: 400 });
    }
  }

  if (!transaction_id || !sp_ticket_id) {
    return NextResponse.json(
      { error: "Provide either sp_ticket, or both transaction_id and sp_ticket_id directly." },
      { status: 400 }
    );
  }

  const sp_service_id: string = body.sp_service_id_override?.trim() || config.spServiceId;

  const spChecksumPayload = ath02SpChecksumPayload({ transaction_id, sp_service_id, sp_ticket_id });
  const sp_checksum = computeChecksum(spChecksumPayload, config.aesKeyBase64);

  const reqBody: GetAthOrSignResultRequest = { transaction_id, sp_service_id, sp_checksum, sp_ticket_id };

  const remote = await postMoicaApi<GetAthOrSignResultResponse>(hosts.fidoapi, PATH, reqBody);

  const result: ProxyResult<GetAthOrSignResultResponse> = {
    request: { url: moicaUrl(hosts.fidoapi, PATH), body: reqBody },
    spChecksumPayload,
    spChecksum: sp_checksum,
    network: { ok: remote.ok, status: remote.status, error: remote.error, durationMs: remote.durationMs },
    response: remote.json,
  };

  const r = remote.json?.result;
  if (r?.idp_checksum) {
    const idpPayload = ath02IdpChecksumPayload({
      transaction_id,
      error_code: remote.json!.error_code,
      hashed_id_num: r.hashed_id_num,
      signed_response: r.signed_response,
    });
    result.idpChecksumPayload = idpPayload;
    result.idpChecksumValid = verifyChecksum(idpPayload, r.idp_checksum, config.aesKeyBase64);
  }

  return NextResponse.json(result);
}
