import { NextRequest, NextResponse } from "next/server";
import { getSessionConfig, resolveHosts, isConfigComplete } from "@/lib/moica/config";
import { postMoicaApi, moicaUrl } from "@/lib/moica/client";
import { computeChecksum, genTransactionId, verifyChecksum } from "@/lib/moica/crypto";
import { lf01IdpChecksumPayload, lf01SpChecksumPayload } from "@/lib/moica/payload";
import type { CheckDeviceStatusRequest, CheckDeviceStatusResponse, ProxyResult } from "@/lib/moica/types";

const PATH = "/moise/sp/checkDeviceStatus";

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

  const spChecksumPayload = lf01SpChecksumPayload({ transaction_id, sp_service_id, id_num });
  const sp_checksum = await computeChecksum(spChecksumPayload, config.aesKeyBase64);

  const reqBody: CheckDeviceStatusRequest = { transaction_id, sp_service_id, sp_checksum, id_num };

  const remote = await postMoicaApi<CheckDeviceStatusResponse>(hosts.fidoapi, PATH, reqBody);

  const result: ProxyResult<CheckDeviceStatusResponse> = {
    request: { url: moicaUrl(hosts.fidoapi, PATH), body: reqBody },
    spChecksumPayload,
    spChecksum: sp_checksum,
    network: { ok: remote.ok, status: remote.status, error: remote.error, durationMs: remote.durationMs },
    response: remote.json,
  };

  const r = remote.json?.result;
  if (r?.idp_checksum) {
    const idpPayload = lf01IdpChecksumPayload({
      transaction_id,
      error_code: remote.json!.error_code,
      is_fido: r.is_fido,
      is_mcert_sign: r.is_mcert_sign,
    });
    result.idpChecksumPayload = idpPayload;
    result.idpChecksumValid = await verifyChecksum(idpPayload, r.idp_checksum, config.aesKeyBase64);
  }

  return NextResponse.json(result);
}
