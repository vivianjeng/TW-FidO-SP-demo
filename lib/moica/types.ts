// Type definitions mirroring 行動自然人憑證應用程式介面規格書 v2.9 (MOI_CA_DEV_API).
// Field names intentionally match the Spec's wire format (snake_case) rather than
// being renamed to camelCase, so the JSON shown in the UI matches the PDF exactly.

export type Environment = "uat" | "prod" | "custom";

export interface EnvironmentHosts {
  fidoweb: string;
  fidoapi: string;
}

export const ENVIRONMENT_HOSTS: Record<Exclude<Environment, "custom">, EnvironmentHosts> = {
  uat: { fidoweb: "fido-test.moi.gov.tw", fidoapi: "fidoapi-test.moi.gov.tw" },
  prod: { fidoweb: "fido.moi.gov.tw", fidoapi: "fidoapi.moi.gov.tw" },
};

export interface SessionConfig {
  environment: Environment;
  /** Only used when environment === "custom". */
  customFidoweb?: string;
  customFidoapi?: string;
  spServiceId: string;
  /** Standard (non-url-safe) base64, must decode to a 32-byte AES-256 key. */
  aesKeyBase64: string;
  /** Publicly reachable URL that MOICA will POST SP-API-WEB-01 results back to. */
  spCallbackUrl: string;
}

export const EMPTY_SESSION_CONFIG: SessionConfig = {
  environment: "uat",
  customFidoweb: "",
  customFidoapi: "",
  spServiceId: "",
  aesKeyBase64: "",
  spCallbackUrl: "",
};

export type OpCode = "ATH" | "SIGN" | "NFCSIGN" | "BATSIGN";
export type OpMode = "I-SCAN" | "APP2APP" | "MWEB2APP" | "PUSH";
export type SignType = "PKCS#1" | "PKCS#7" | "RAW";
export type TbsEncoding = "NONE" | "base64";
export type HashAlgorithm = "SHA1" | "SHA256" | "SHA384" | "SHA512";

export interface SignInfo {
  sign_type?: SignType;
  sign_data: string;
  tbs_encoding?: TbsEncoding;
  hash_algorithm?: HashAlgorithm;
}

export interface BatchSignInfo {
  sign_type?: SignType;
  sign_data_set: string[];
  tbs_encoding?: TbsEncoding;
  hash_algorithm?: HashAlgorithm;
}

/** Uniform envelope every proxy Route Handler in this app returns, so the UI can
 * show exactly what was sent and whether the network call / idp_checksum verification
 * succeeded, independent of whether MOICA itself returned a business error_code. */
export interface ProxyResult<T> {
  request: { url: string; body: unknown };
  spChecksumPayload: string;
  spChecksum: string;
  network: { ok: boolean; status?: number; error?: string; durationMs?: number };
  response?: T;
  idpChecksumValid?: boolean;
  idpChecksumPayload?: string;
  decodedSpTicket?: DecodedSpTicket;
}

export interface MoicaErrorEnvelope {
  error_code: string;
  error_message: string;
}

// ---- SP-API-ATH-01 : getSpTicket ----
export interface GetSpTicketRequest {
  transaction_id: string;
  sp_service_id: string;
  sp_checksum: string;
  id_num: string;
  op_code: OpCode;
  op_mode: OpMode;
  hint: string;
  time_limit?: number;
  sign_info?: SignInfo;
}
export interface GetSpTicketResult {
  sp_ticket: string;
  idp_checksum: string;
}
export type GetSpTicketResponse = MoicaErrorEnvelope & { result?: GetSpTicketResult };

// ---- SP-API-ATH-02 : getAthOrSignResult ----
export interface GetAthOrSignResultRequest {
  transaction_id: string;
  sp_service_id: string;
  sp_checksum: string;
  sp_ticket_id: string;
}
export interface GetAthOrSignResultResult {
  hashed_id_num: string;
  signed_response?: string;
  signed_response_set?: string[];
  cert?: string;
  idp_checksum: string;
}
export type GetAthOrSignResultResponse = MoicaErrorEnvelope & { result?: GetAthOrSignResultResult };

// ---- SP-API-ATH-03 : requestAthOrSignPush ----
export interface RequestAthOrSignPushRequest {
  transaction_id: string;
  sp_service_id: string;
  sp_checksum: string;
  id_num: string;
  op_code: OpCode;
  hint: string;
  device_user_def_desc?: string;
  time_limit?: number;
  sign_info?: SignInfo;
}
export type RequestAthOrSignPushResponse = GetSpTicketResponse;

// ---- SP-API-ATH-04 : doBatchSigning ----
export interface DoBatchSigningRequest {
  transaction_id: string;
  sp_service_id: string;
  sp_checksum: string;
  id_num: string;
  op_code: "BATSIGN";
  op_mode: OpMode;
  hint: string;
  device_user_def_desc?: string;
  time_limit?: number;
  sign_info: BatchSignInfo;
}
export type DoBatchSigningResponse = GetSpTicketResponse;

// ---- SP-API-LF-01 : checkDeviceStatus ----
export interface CheckDeviceStatusRequest {
  transaction_id: string;
  sp_service_id: string;
  sp_checksum: string;
  id_num: string;
}
export interface CheckDeviceStatusResult {
  is_fido: "Y" | "N";
  is_mcert_sign: "Y" | "N";
  idp_checksum: string;
}
export type CheckDeviceStatusResponse = MoicaErrorEnvelope & { result?: CheckDeviceStatusResult };

// ---- SP-API-WEB-01 : fidoRedirect/web ----
export interface WebRedirectFields {
  transaction_id: string;
  op_code: OpCode;
  sp_service_id: string;
  sp_checksum: string;
  hint: string;
  sign_type?: SignType;
  sign_data?: string;
  tbs_encoding?: TbsEncoding;
  hash_algorithm?: HashAlgorithm;
  time_limit?: number;
}

export interface WebRedirectCallback {
  transaction_id: string;
  error_code: string;
  id_num: string;
  signed_response: string;
  cert?: string;
  idp_checksum: string;
}

// ---- APP-API-01 : verifySign deep link ----
export interface AppLinkParams {
  sp_ticket: string;
  rtn_url: string;
  rtn_val: string;
}

// ---- decoded sp_ticket payload (base64url JSON segment before the ".") ----
export interface DecodedSpTicket {
  payloadSegment: string;
  digestSegment: string;
  payload: Record<string, unknown> | string;
  digestValid: boolean;
}

// 錯誤代碼為：介面編號 || '-' || 系統錯誤代碼 (e.g. SP-API-ATH-01-INV_SP_CHECKSUM).
// Full table transcribed from Spec §伍 (表5-1-1).
export const ERROR_CODE_REFERENCE: Array<{ code: string; description: string; advice: string }> = [
  { code: "DB_CONN_ERR", description: "資料庫連線失敗", advice: "[1021] 系統維護中，請稍後再試。" },
  { code: "DB_SQL_EXP", description: "資料庫操作失敗", advice: "[1022] 系統維護中，請稍後再試。" },
  { code: "DB_ROOLBACK", description: "資料庫批次操作失敗，已回復到操作前狀態", advice: "[1023] 系統維護中，請稍後再試。" },
  { code: "DB_CLOSE_ERR", description: "資料庫連線關閉失敗", advice: "[1024] 系統維護中，請稍後再試。" },
  { code: "DB_JNDI_ERR", description: "資料庫設定錯誤", advice: "[1025] 系統維護中，請稍後再試。" },
  { code: "UNDEFINED", description: "未定義錯誤", advice: "[1026] 系統維護中，請稍後再試。" },
  { code: "NFCNONCE_INS_ERR", description: "NFC NONCE 於DB 資料表寫入失敗", advice: "[1027] 系統維護中，請稍後再試。" },
  { code: "OTP_INS_ERR", description: "OTP 於DB 資料表寫入失敗", advice: "[1028] 系統維護中，請稍後再試。" },
  { code: "NFCNONCE_DBSQL", description: "NFC_NONCE 查詢時發生DB 錯誤", advice: "[1029] 系統維護中，請稍後再試。" },
  { code: "NFCNONCE_DEL_ERR", description: "NFC_NONCE 刪除時發生DB 錯誤", advice: "[1030] 系統維護中，請稍後再試。" },
  { code: "OTP_EXPIRED", description: "OTP 認證碼逾期", advice: "[1031] 驗證碼逾時，請重新再試一次。" },
  { code: "OTP_IDNUM_MISMATCH", description: "身分證字號與OTP 比對不符合", advice: "[1032] 驗證碼與身分證號不符，請重新再試一次。" },
  { code: "OTP_NF", description: "找不到OTP（通常是用戶跑到測試官網註冊，然後用正式APP 綁定造成；或是用測試APP 跑到正式官網綁定造成）", advice: "[1033] 未取得驗證碼，請按照流程重新再試一次。" },
  { code: "OTP_DBSQL", description: "OTP 查詢時發生DB 錯誤", advice: "[1034] 驗證碼與身分證號不符，請重新再試一次。" },
  { code: "NFCNONCE_NF", description: "找不到 NFC NONCE", advice: "[1035] 未取得驗證碼，請按照流程重新再試一次。" },
  { code: "NFCNONCE_IDNUM_MISMATCH", description: "身分證字號與 NFC NONCE 比對不符合", advice: "[1036] 驗證碼與身分證號不符，請重新再試一次。" },
  { code: "IDNUM_USERPROF_NF", description: "身分證字號未找到對應之使用者資訊（新用戶或過去完成註銷之用戶）", advice: "[1051] 您尚未註冊綁定裝置，請先綁定裝置並申請行動自然人憑證。" },
  { code: "IDNUM_USERPROF_DBSQL", description: "身分證字號查詢使用者資訊時發生DB 錯誤", advice: "[1052] 查詢使用者資訊不成功，請洽客服人員處理。" },
  { code: "IDNUM_DEVPROF_NF", description: "身分證字號未找到對應之裝置資訊", advice: "[1053] 您尚未註冊綁定裝置，請先綁定裝置並申請行動自然人憑證。" },
  { code: "IDNUM_DEVPROF_DBSQL", description: "身分證字號查詢裝置資訊時發生DB 錯誤", advice: "[1054] 查詢使用者資訊不成功，請洽客服人員處理。" },
  { code: "DEV_LIM_REACHED", description: "裝置綁定數量到達上限", advice: "[1055] 裝置綁定已達上限，請至行動自然人憑證網站註銷後，再重新申請。" },
  { code: "DEVID_DEVPROF_NF", description: "Device_id 未找到對應之裝置資訊（憑證被廢止後會出現，出現後會清除裝置金鑰，恢復初始狀態）", advice: "[1061] 查詢裝置資訊不成功，請至行動自然人憑證官方網站確認該裝置名稱是否一致。" },
  { code: "DEVID_DEVPROF_DBSQL", description: "Device_id 查詢裝置資訊時發生DB 錯誤", advice: "[1062] 查詢裝置資訊不成功，請洽客服人員處理。" },
  { code: "DEV_DESC_MISMATCH", description: "未找到對應之自訂裝置名稱", advice: "[1063] 查詢裝置資訊不成功，請至行動自然人憑證官方網站確認該裝置名稱是否一致。" },
  { code: "DEVID_SPTKT_MISMATCH", description: "Device_id 與sp ticket 中對應之身份證字號雜湊值不符合", advice: "[1064] 裝置資訊驗證不成功，請確定使用合法裝置進行認證/簽章。" },
  { code: "USERPROF_INS_ERR", description: "使用者資訊DB 資料表寫入失敗", advice: "[1071] 系統維護中，請稍後再試。" },
  { code: "DEVPROF_INS_ERR", description: "裝置資訊DB 資料表寫入失敗", advice: "[1072] 系統維護中，請稍後再試。" },
  { code: "SPTKT_INS_ERR", description: "Sp_ticket DB 資料表寫入失敗（身分證字號驗證不符）", advice: "[1073] 系統維護中，請稍後再試。" },
  { code: "TXNLOG_INS_ERR", description: "認證簽署紀錄DB 資料表寫入失敗（常見真實問題：機關使用相同的transaction_id 送出）", advice: "[1074] 系統維護中，請稍後再試。" },
  { code: "USERPROF_DEL_ERR", description: "使用者資訊DB 資料表刪除失敗", advice: "[1075] 系統維護中，請稍後再試。" },
  { code: "DEVPROF_DEL_ERR", description: "裝置資訊DB 資料表刪除失敗", advice: "[1076] 系統維護中，請稍後再試。" },
  { code: "SPTKT_DEL_ERR", description: "Sp_ticket DB 資料表刪除失敗", advice: "[1077] 系統維護中，請稍後再試。" },
  { code: "USERPROF_UPD_ERR", description: "使用者資訊DB 資料表更新失敗", advice: "[1078] 系統維護中，請稍後再試。" },
  { code: "DEVPROF_UPD_ERR", description: "裝置資訊DB 資料表更新失敗", advice: "[1079] 系統維護中，請稍後再試。" },
  { code: "IDNUM_DEVID_MISMATCH", description: "身分證字號與 Device_id 比對不符合", advice: "[1080] 裝置名稱與使用者身分證號不符，請重新再試一次。" },
  { code: "CERT_SIGNDATA_MISMATCH", description: "輸入參數與簽章內容不符合", advice: "[1081] 簽章資料不成功，請洽客服人員。" },
  { code: "CERT_SIGNDATA_ERR", description: "簽章格式分析發生錯誤", advice: "[1082] 簽章資料不成功，請洽客服人員。" },
  { code: "SPTKT_OVD", description: "Sp_ticket 逾期", advice: "[1101] 驗證碼已過期，請重新執行驗證流程。" },
  { code: "SPTKTID_SPTKT_NF", description: "Sp_ticket_id 未找到對應之Sp_ticket（相容TWFIDO）", advice: "[1102] 驗證碼不存在，請重新執行驗證流程。" },
  { code: "SPTKTID_SPTKT_RDM", description: "Sp_ticket_id 對應之Sp_ticket 已經被使用過", advice: "[1103] 驗證碼已被使用過，請重新執行驗證流程。" },
  { code: "SPTKTID_SPTKT_DBSQL", description: "Sp_ticket_id 查詢Sp_ticket 時發生DB 錯誤", advice: "[1104] 驗證碼查詢有誤，請稍後再試。" },
  { code: "NFCNONCE_EXPIRED", description: "NFC NONCE 逾期", advice: "[1105] 驗證碼已過期，請重新執行註冊流程。" },
  { code: "SIGRESP_CNT_MISMATCH", description: "連續簽章回傳內容數量與Sp_ticket 中數量不符合", advice: "[1106] 連續簽章資料有誤，請重新執行或洽客服人員。" },
  { code: "PS_CONNECT_404", description: "推播模組PS 回應404", advice: "[3002] 系統維護中，請稍後再試。" },
  { code: "PS_CONNECT_500", description: "推播模組PS 回應500", advice: "[3003] 系統維護中，請稍後再試。" },
  { code: "PS_JSON_FMT_ERR", description: "推播模組PS 回應非JSON格式內容", advice: "[3004] 系統維護中，請稍後再試。" },
  { code: "PS_JSON_TYPE_ERR", description: "推播模組PS 回應JSON中部份型態不符合", advice: "[3005] 系統維護中，請稍後再試。" },
  { code: "PS_JSON_MISS_KEY", description: "推播模組PS 回應JSON中缺少必要欄位", advice: "[3006] 系統維護中，請稍後再試。" },
  { code: "PS_CONNECT_IOEXC", description: "推播模組PS 連線失敗", advice: "[3007] 系統維護中，請稍後再試。" },
  { code: "PS_1001", description: "訊息推播模組JSON 參數輸入錯誤", advice: "[3008] 系統維護中，請稍後再試。" },
  { code: "PS_5000", description: "訊息推播模組push_data JSON 解析錯誤", advice: "[3009] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_UNKNOWN", description: "未知的錯誤，通常是伺服器問題", advice: "[3101] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_ABORTED", description: "推播中止，推播過程發生衝突", advice: "[3102] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_ALREADY_EXISTS", description: "資源已重複存在，無法建立推播資源", advice: "[3103] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_CANCELLED", description: "推播操作已取消", advice: "[3104] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_CONFLICT", description: "資源讀寫衝突", advice: "[3105] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_DATA_LOSS", description: "資料遺失或資料毀損、接收不完全", advice: "[3106] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_DEADLINE_EXCEEDED", description: "推播逾時", advice: "[3107] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_FAILED_PRECONDITION", description: "推播失敗，請檢查系統程式完整性", advice: "[3108] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_INTERNAL", description: "推播系統內部發生錯誤", advice: "[3109] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_INVALID_ARGUMENT", description: "參數錯誤", advice: "[3110] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_NOT_FOUND", description: "APP 推播資源失效，常見原因為用戶過久未開啟行動自然人憑證APP 導致推播資源未更新", advice: "[3111] 請重新開啟APP 後再試。" },
  { code: "PS_FCM_OUT_OF_RANGE", description: "超出推播範圍", advice: "[3112] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_PERMISSION_DENIED", description: "API 無存取權限或尚未啟用", advice: "[3113] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_RESOURCE_EXHAUSTED", description: "推播資源忙碌中，超出系統負荷範圍", advice: "[3114] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_UNAUTHENTICATED", description: "未認證的名稱", advice: "[3115] 系統維護中，請稍後再試。" },
  { code: "PS_FCM_UNAVAILABLE", description: "資源目前無法存取", advice: "[3116] 系統維護中，請稍後再試。" },
  { code: "(iOS fingerprint 完成按鈕)", description: "只會發生在iOS，用戶進入指紋畫面直接點下左上角的完成按鈕造成，請用戶按照正確程序操作即可。", advice: "[10002] 操作不成功，請稍後再操作一次。" },
  { code: "(WebAuthn credentials.create)", description: "WebAuthn API: navigator.credentials.create 錯誤", advice: "[32001] 操作不成功，請稍後再操作一次。" },
  { code: "(WebAuthn credentials.get)", description: "WebAuthn API: navigator.credentials.get 錯誤", advice: "[32002] 操作不成功，請稍後再操作一次。" },
  { code: "(WebAuthn Cancel by User)", description: "只會發生在iOS，用戶進入指紋畫面，點下指紋後按了取消造成，請用戶按照正確程序操作即可。", advice: "[32003] 操作不成功，請稍後再操作一次。" },
  { code: "(WebAuthn CredentialID missing)", description: "只會發生在iOS，原因是用戶把Safari 重置或是清除瀏覽資料，造成FIDO 金鑰消失所致，需要請用戶上官方網站註銷原有裝置，再重新安裝APP 綁定。", advice: "[32004] 操作不成功，請稍後再操作一次。" },
  { code: "(WebAuthn SecurityError)", description: "WebAuthn API: SecurityError", advice: "[32005] 操作不成功，請稍後再操作一次。" },
  { code: "(WebAuthn TimeoutError)", description: "iOS 網頁，點下指紋icon 以後，等待超過30 秒會發生。", advice: "[32006] 操作不成功，請稍後再操作一次。" },
  { code: "PM_INV_NF", description: "缺少參數或者格式不正確", advice: "[5002] 簽章不成功，請洽客服人員處理。" },
  { code: "PM_SIGDATA_ERR", description: "APP 端簽章內容格式不正確", advice: "[5003] 簽章不成功，請洽客服人員處理。" },
  { code: "PM_INV_SG", description: "APP 端簽章驗證失敗", advice: "[5004] 驗證不成功，請確認憑證有效性。" },
  { code: "PM_SIGNDATA_NULL", description: "APP 端簽章明文為空值", advice: "[5005] 簽章不成功，請洽客服人員處理。" },
  { code: "SPTKT_PLD_FT_ERR", description: "Sp_ticket 格式錯誤", advice: "[9002] 資料格式有誤，請洽該應用服務之管理員。" },
  { code: "SPTKT_DIG_FT_ERR", description: "Sp_ticket 簽章驗證失敗", advice: "[9003] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "INV_SP_CHECKSUM", description: "SP CHECKSUM 檢驗失敗", advice: "[9004] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "TGT_INV", description: "無效的操作對象代碼", advice: "[9005] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "PM_IDN_FT_ERR", description: "身份證字號格式錯誤", advice: "[9006] 身分證號格式錯誤，請確認輸入資訊。" },
  { code: "SPTKTID_TXNLOG_NF", description: "查無使用者認證/簽署結果", advice: "[9007] 使用者認證/簽署作業尚未完成，請稍後再試。" },
  { code: "SIGNDATA_LEN_LIMIT", description: "簽章資料長度到達上限（上限1024 個字元）", advice: "[9008] 簽章資料長度到達上限（上限1024 個字元）。" },
  { code: "SPTKT_TIME_FT_ERR", description: "自訂 Sp_ticket 逾期時間格式錯誤", advice: "[9009] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "SPTKT_TIME_ORV", description: "自訂 Sp_ticket 逾期時間超過範圍(out of range value)", advice: "[9010] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "SPSVCID_NF", description: "Sp service id 未找到對應之 SP 資訊", advice: "[9011] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "SPSVCID_DBSQL", description: "Sp service id 查詢 SP 資訊時發生DB 錯誤", advice: "[9012] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "BATSIGN_CNT_LIMIT", description: "連續簽章文件數量達到上限", advice: "[9013] 資料驗證不成功，請洽該應用服務之管理員。" },
  { code: "APP_SIGN_FAILURE", description: "APP 簽章失敗", advice: "[9014] APP 回報簽章失敗，簽章作業終止。" },
  { code: "APP_USER_CANCEL", description: "APP 簽章時使用者取消", advice: "[9015] APP 回報使用者取消簽章，簽章作業終止。" },
  { code: "APP_DECODE_FAIL", description: "APP 簽章資料解碼失敗", advice: "[9016] APP 回報簽章資料解碼失敗，簽章作業終止。" },
  { code: "APP_DATA_NULL", description: "APP 簽章資料為空", advice: "[9017] APP 回報簽章資料為空，簽章作業終止。" },
];
