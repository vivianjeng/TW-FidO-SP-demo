// Builds the exact concatenated strings each interface hashes into sp_checksum /
// idp_checksum, per the "⚫ Payload：" notes scattered through Spec §參.二 for each
// interface. Per the Spec: "若Payload 中包含選用參數，不使用時請採用空字串計算"
// (unused optional fields are concatenated as an empty string, never omitted).

const s = (v: string | number | undefined | null) => (v === undefined || v === null ? "" : String(v));

export function webRedirectSpChecksumPayload(f: {
  transaction_id: string;
  sp_service_id: string;
  op_code: string;
  hint: string;
  sign_data?: string;
}): string {
  return s(f.transaction_id) + s(f.sp_service_id) + s(f.op_code) + s(f.hint) + s(f.sign_data);
}

export function webRedirectIdpChecksumPayload(f: {
  transaction_id: string;
  error_code: string;
  id_num: string;
  signed_response: string;
}): string {
  return s(f.transaction_id) + s(f.error_code) + s(f.id_num) + s(f.signed_response);
}

export function ath01SpChecksumPayload(f: {
  transaction_id: string;
  sp_service_id: string;
  id_num: string;
  op_code: string;
  op_mode: string;
  hint: string;
  sign_data?: string;
}): string {
  return (
    s(f.transaction_id) + s(f.sp_service_id) + s(f.id_num) + s(f.op_code) + s(f.op_mode) + s(f.hint) + s(f.sign_data)
  );
}

export function ath03SpChecksumPayload(f: {
  transaction_id: string;
  sp_service_id: string;
  id_num: string;
  device_user_def_desc?: string;
  op_code: string;
  hint: string;
  sign_data?: string;
}): string {
  return (
    s(f.transaction_id) +
    s(f.sp_service_id) +
    s(f.id_num) +
    s(f.device_user_def_desc) +
    s(f.op_code) +
    s(f.hint) +
    s(f.sign_data)
  );
}

export function ath04SpChecksumPayload(f: {
  transaction_id: string;
  sp_service_id: string;
  id_num: string;
  op_code: string;
  op_mode: string;
  hint: string;
}): string {
  return s(f.transaction_id) + s(f.sp_service_id) + s(f.id_num) + s(f.op_code) + s(f.op_mode) + s(f.hint);
}

/** Shared by ATH-01 / ATH-03 / ATH-04 response verification. */
export function ticketIdpChecksumPayload(f: { transaction_id: string; error_code: string; sp_ticket: string }): string {
  return s(f.transaction_id) + s(f.error_code) + s(f.sp_ticket);
}

export function ath02SpChecksumPayload(f: { transaction_id: string; sp_service_id: string; sp_ticket_id: string }): string {
  return s(f.transaction_id) + s(f.sp_service_id) + s(f.sp_ticket_id);
}

export function ath02IdpChecksumPayload(f: {
  transaction_id: string;
  error_code: string;
  hashed_id_num: string;
  signed_response?: string;
}): string {
  return s(f.transaction_id) + s(f.error_code) + s(f.hashed_id_num) + s(f.signed_response);
}

export function lf01SpChecksumPayload(f: { transaction_id: string; sp_service_id: string; id_num: string }): string {
  return s(f.transaction_id) + s(f.sp_service_id) + s(f.id_num);
}

export function lf01IdpChecksumPayload(f: {
  transaction_id: string;
  error_code: string;
  is_fido: string;
  is_mcert_sign: string;
}): string {
  return s(f.transaction_id) + s(f.error_code) + s(f.is_fido) + s(f.is_mcert_sign);
}
