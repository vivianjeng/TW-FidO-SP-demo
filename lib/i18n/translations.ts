// Flat, namespaced UI-copy dictionary for the English/Mandarin toggle (see
// components/LocaleProvider.tsx). API/spec field names (id_num, op_code, sp_ticket, …)
// are intentionally left untranslated everywhere they appear, since they must match the
// spec literally — only descriptive labels, headings, buttons, and help text are here.

export type Locale = "en" | "zh";

export const translations = {
  // Nav
  "nav.brand": { en: "TW FidO SP Demo", zh: "TW FidO SP Demo" },
  "nav.dashboard": { en: "Dashboard", zh: "儀表板" },
  "nav.settings": { en: "Settings", zh: "設定" },
  "nav.webRedirect": { en: "Redirect", zh: "網頁轉導" },
  "nav.ticket": { en: "Ticket", zh: "票證" },
  "nav.push": { en: "Push", zh: "推播" },
  "nav.batch": { en: "Batch", zh: "連續簽章" },
  "nav.result": { en: "Result", zh: "結果查詢" },
  "nav.deviceStatus": { en: "Device Status", zh: "裝置狀態" },
  "nav.appLink": { en: "App Link", zh: "深層連結" },
  "nav.reference": { en: "Reference", zh: "參考資料" },
  "nav.localeToggleLabel": { en: "中文", zh: "English" },
  "nav.themeToDark": { en: "Switch to light mode", zh: "切換至淺色模式" },
  "nav.themeToLight": { en: "Switch to dark mode", zh: "切換至深色模式" },
  "nav.openMenu": { en: "Open menu", zh: "開啟選單" },
  "nav.closeMenu": { en: "Close menu", zh: "關閉選單" },

  // Layout footer
  "layout.footer": {
    en: "Unofficial demo/sandbox client for the 行動自然人憑證應用程式介面規格書 (MOI_CA_DEV_API v2.9). Not affiliated with the Ministry of the Interior.",
    zh: "本站為「行動自然人憑證應用程式介面規格書」(MOI_CA_DEV_API v2.9) 的非官方展示/沙盒用戶端，與內政部無關。",
  },

  // Common
  "common.loading": { en: "Loading…", zh: "載入中…" },
  "common.status": { en: "Status:", zh: "狀態：" },
  "common.configured": { en: "configured", zh: "已設定" },
  "common.notConfigured": { en: "not configured", zh: "尚未設定" },
  "common.optional": { en: "optional", zh: "選填" },
  "common.leaveBlankUuid": { en: "Leave blank to auto-generate a UUIDv4", zh: "留空將自動產生 UUIDv4" },
  "common.auto": { en: "auto", zh: "自動" },
  "common.session": { en: "session:", zh: "工作階段：" },
  "common.leaveBlankUseSettings": { en: "Leave blank to use the value from Settings", zh: "留空將使用「設定」頁的值" },

  // Home / dashboard
  "home.title": { en: "TW FidO SP Demo", zh: "TW FidO SP Demo" },
  "home.subtitle": {
    en: "A Service-Provider-side sandbox for Taiwan's 行動自然人憑證 (Mobile Citizen Digital Certificate) API. Every page here calls the real MOICA backend with your own sp_service_id / AES key — nothing is simulated. See SPEC.md for the full write-up.",
    zh: "這是台灣「行動自然人憑證」API 的服務提供者 (SP) 端沙盒。本站每個頁面都會用你自己的 sp_service_id / AES 金鑰呼叫真正的 MOICA 後端，沒有任何模擬資料。完整說明請見 SPEC.md。",
  },
  "home.envStatus": { en: "Environment status", zh: "環境狀態" },
  "home.environment": { en: "environment:", zh: "環境：" },
  "home.goToSettings": { en: "Go to Settings →", zh: "前往設定 →" },
  "home.flow.web01.title": { en: "網頁轉導模式介面 · Web Redirect", zh: "網頁轉導模式介面 · Web Redirect" },
  "home.flow.web01.desc": {
    en: "Build the hidden auto-submit form to fidoRedirect/web and inspect the callback MOICA POSTs back.",
    zh: "建立自動送出至 fidoRedirect/web 的隱藏表單，並檢視 MOICA 回傳的 callback 內容。",
  },
  "home.flow.ath01.title": { en: "請求 SP ticket · getSpTicket", zh: "請求 SP ticket · getSpTicket" },
  "home.flow.ath01.desc": {
    en: "I-SCAN (QR), APP2APP, and MWEB2APP ticket issuance for ATH / SIGN / NFCSIGN.",
    zh: "核發 I-SCAN（QR code）、APP2APP、MWEB2APP 的票證，適用 ATH / SIGN / NFCSIGN。",
  },
  "home.flow.ath03.title": { en: "請求認證/簽章推播 · Push", zh: "請求認證/簽章推播 · Push" },
  "home.flow.ath03.desc": {
    en: "Push an auth/sign request straight to the user's bound device(s).",
    zh: "將認證/簽章請求直接推播至使用者已綁定的裝置。",
  },
  "home.flow.ath04.title": { en: "請求連續簽章 SP ticket · Batch", zh: "請求連續簽章 SP ticket · Batch" },
  "home.flow.ath04.desc": {
    en: "BATSIGN continuous signing across up to 20 documents in one ticket.",
    zh: "BATSIGN 連續簽章，一張票證最多可簽署 20 份文件。",
  },
  "home.flow.ath02.title": { en: "查詢認證/簽章結果 · Poll Result", zh: "查詢認證/簽章結果 · Poll Result" },
  "home.flow.ath02.desc": {
    en: "Poll a sp_ticket (≥4s recommended interval) for its auth/sign outcome.",
    zh: "查詢 sp_ticket 的認證/簽章結果（建議查詢間隔 ≥4 秒）。",
  },
  "home.flow.lf01.title": { en: "確認使用者裝置綁定狀態 · Device Status", zh: "確認使用者裝置綁定狀態 · Device Status" },
  "home.flow.lf01.desc": {
    en: "Check whether an id_num has a bound FIDO device / usable certificate.",
    zh: "確認指定 id_num 是否已綁定 FIDO 裝置或擁有可用憑證。",
  },
  "home.flow.applink.title": { en: "認證/簽章功能 · App Deep Link", zh: "認證/簽章功能 · App Deep Link" },
  "home.flow.applink.desc": {
    en: "Build & decode mobilemoica://…/verifySign links independent of how the ticket was issued.",
    zh: "建立與解析 mobilemoica://…/verifySign 深層連結，不受票證核發方式限制。",
  },

  // Settings
  "settings.title": { en: "Settings", zh: "設定" },
  "settings.subtitle": {
    en: "These credentials come from MOI's SP onboarding process. They're stored server-side for this browser session only (in-memory — a server restart clears them) and are never sent to client-side JavaScript; only computed checksums/tickets are.",
    zh: "這些憑證資訊來自內政部的 SP 進件流程，僅儲存於伺服器端、對應此瀏覽器工作階段（存於記憶體，伺服器重啟即清除），且絕不會傳送到前端 JavaScript，只有計算出的 checksum / 票證會傳出。",
  },
  "settings.envCard": { en: "Environment", zh: "環境" },
  "settings.targetEnv": { en: "Target environment", zh: "目標環境" },
  "settings.envUat": { en: "UAT — fido-test.moi.gov.tw / fidoapi-test.moi.gov.tw", zh: "UAT 測試環境 — fido-test.moi.gov.tw / fidoapi-test.moi.gov.tw" },
  "settings.envProd": { en: "Production — fido.moi.gov.tw / fidoapi.moi.gov.tw", zh: "正式環境 — fido.moi.gov.tw / fidoapi.moi.gov.tw" },
  "settings.envCustom": { en: "Custom hosts", zh: "自訂主機" },
  "settings.resolved": { en: "Resolved:", zh: "解析結果：" },
  "settings.spCredCard": { en: "SP credentials", zh: "SP 憑證資訊" },
  "settings.aesKeyLabel": { en: "AES key (base64, must decode to 32 bytes / AES-256)", zh: "AES 金鑰（base64，解碼後須為 32 bytes／AES-256）" },
  "settings.aesKeyCurrentlySet": {
    en: "Currently set ({key}). Leave blank to keep it, or type a new key to replace it.",
    zh: "目前已設定（{key}）。留空將保留原值，輸入新值則會覆蓋。",
  },
  "settings.aesKeyNotSet": { en: "Not set yet.", zh: "尚未設定。" },
  "settings.aesKeyPlaceholderKeep": { en: "•••• leave blank to keep existing key", zh: "•••• 留空將保留原有金鑰" },
  "settings.aesKeyPlaceholderNew": { en: "base64 AES-256 key", zh: "base64 編碼的 AES-256 金鑰" },
  "settings.callbackCard": { en: "SP Callback URL", zh: "SP 回呼網址" },
  "settings.callbackCardSubtitle": {
    en: "Only needed for SP-API-WEB-01 (/redirect) — MOICA POSTs the result here.",
    zh: "僅供 SP-API-WEB-01（/redirect）使用 — MOICA 會將結果 POST 至此網址。",
  },
  "settings.callbackHint": {
    en: "Must be a publicly reachable HTTPS URL. Use this app's own /api/callback if this deployment is publicly reachable; otherwise the WEB-01 flow can be inspected up to the redirect but the callback won't arrive.",
    zh: "須為可公開連線的 HTTPS 網址。若此部署可公開連線，可使用本站自帶的 /api/callback；否則 WEB-01 流程只能觀察到轉導前的步驟，callback 不會送達。",
  },
  "settings.useAppUrl": { en: "Use this app's URL", zh: "使用本站網址" },
  "settings.save": { en: "Save settings", zh: "儲存設定" },
  "settings.saving": { en: "Saving…", zh: "儲存中…" },

  // Ticket (ATH-01)
  "ticket.title": { en: "SP-API-ATH-01 · 請求 SP ticket", zh: "SP-API-ATH-01 · 請求 SP ticket" },
  "ticket.subtitle": {
    en: "getSpTicket — issues a ticket for I-SCAN (QR), APP2APP, or MWEB2APP.",
    zh: "getSpTicket — 核發適用 I-SCAN（QR code）、APP2APP 或 MWEB2APP 的票證。",
  },
  "ticket.opModeCard": { en: "Operation mode", zh: "操作模式" },
  "ticket.requestFieldsCard": { en: "Request fields", zh: "請求欄位" },
  "ticket.requesting": { en: "Requesting…", zh: "請求中…" },
  "ticket.submit": { en: "Request sp_ticket", zh: "送出 sp_ticket 請求" },
  "ticket.qrCard": { en: "I-SCAN QR code", zh: "I-SCAN QR code" },
  "ticket.qrCardSubtitle": {
    en: "Encodes the raw sp_ticket for the 行動自然人憑證 App camera to scan.",
    zh: "將原始 sp_ticket 編碼為 QR code，供「行動自然人憑證」App 相機掃描。",
  },
  "ticket.deepLinkCard": { en: "APP-API-01 deep link", zh: "APP-API-01 深層連結" },
  "ticket.deepLinkCardSubtitle": { en: "verifySign — built from this ticket's sp_ticket.", zh: "verifySign — 由此票證的 sp_ticket 建立。" },
  "ticket.openApp": { en: "Open 行動自然人憑證 App", zh: "開啟「行動自然人憑證」App" },

  // Push (ATH-03)
  "push.title": { en: "SP-API-ATH-03 · 請求認證/簽章推播", zh: "SP-API-ATH-03 · 請求認證/簽章推播" },
  "push.subtitle": {
    en: "requestAthOrSignPush — pushes an ATH/SIGN/NFCSIGN request straight to the user's bound device(s).",
    zh: "requestAthOrSignPush — 將 ATH/SIGN/NFCSIGN 請求直接推播至使用者已綁定的裝置。",
  },
  "push.deviceDescHint": { en: "Leave blank to push to every device the user has bound", zh: "留空將推播至使用者已綁定的所有裝置" },
  "push.requestFieldsCard": { en: "Request fields", zh: "請求欄位" },
  "push.requesting": { en: "Requesting…", zh: "請求中…" },
  "push.submit": { en: "Send push", zh: "送出推播" },

  // Batch (ATH-04)
  "batch.title": { en: "SP-API-ATH-04 · 請求連續簽章 SP ticket", zh: "SP-API-ATH-04 · 請求連續簽章 SP ticket" },
  "batch.subtitle": {
    en: "doBatchSigning (BATSIGN) — up to {max} documents in one ticket.",
    zh: "doBatchSigning（BATSIGN）— 一張票證最多可簽署 {max} 份文件。",
  },
  "batch.opModeCard": { en: "Operation mode", zh: "操作模式" },
  "batch.requestFieldsCard": { en: "Request fields", zh: "請求欄位" },
  "batch.signInfoCard": { en: "sign_info (applies to the whole sign_data_set)", zh: "sign_info（套用至整個 sign_data_set）" },
  "batch.tbsEncodingHint": { en: "Batch only supports base64", zh: "連續簽章僅支援 base64" },
  "batch.remove": { en: "Remove", zh: "移除" },
  "batch.addDocument": { en: "+ Add document", zh: "+ 新增文件" },
  "batch.requesting": { en: "Requesting…", zh: "請求中…" },
  "batch.submit": { en: "Request batch sp_ticket", zh: "送出連續簽章請求" },
  "batch.deepLinkCard": { en: "APP-API-01 deep link", zh: "APP-API-01 深層連結" },
  "batch.deepLinkCardSubtitle": { en: "verifySign — built from this ticket's sp_ticket.", zh: "verifySign — 由此票證的 sp_ticket 建立。" },
  "batch.openApp": { en: "Open 行動自然人憑證 App", zh: "開啟「行動自然人憑證」App" },

  // Result (ATH-02)
  "result.title": { en: "SP-API-ATH-02 · 查詢認證/簽章結果", zh: "SP-API-ATH-02 · 查詢認證/簽章結果" },
  "result.subtitle": {
    en: 'getAthOrSignResult — poll a ticket for its auth/sign outcome. Spec recommends a ≥4s interval between queries, enforced here when you use "Start polling".',
    zh: "getAthOrSignResult — 查詢票證的認證/簽章結果。規格書建議查詢間隔 ≥4 秒，使用「開始輪詢」時本站會強制套用此間隔。",
  },
  "result.ticketCard": { en: "Ticket to query", zh: "欲查詢的票證" },
  "result.spTicketHint": {
    en: "Paste the full sp_ticket returned by ATH-01/03/04 — transaction_id and sp_ticket_id are extracted from it automatically.",
    zh: "貼上 ATH-01/03/04 回傳的完整 sp_ticket，系統會自動從中取出 transaction_id 及 sp_ticket_id。",
  },
  "result.orIfKnown": { en: "— or, if you already know both values —", zh: "— 或者，若你已經知道以下兩個值 —" },
  "result.queryOnce": { en: "Query once", zh: "查詢一次" },
  "result.querying": { en: "Querying…", zh: "查詢中…" },
  "result.startPolling": { en: "Start polling (every {seconds}s)", zh: "開始輪詢（每 {seconds} 秒）" },
  "result.stopPolling": { en: "Stop polling", zh: "停止輪詢" },
  "result.queriesSentOne": { en: "{count} query sent", zh: "已送出 {count} 次查詢" },
  "result.queriesSentMany": { en: "{count} queries sent", zh: "已送出 {count} 次查詢" },
  "result.signedSetCard": { en: "signed_response_set (batch)", zh: "signed_response_set（連續簽章）" },

  // Device status (LF-01)
  "deviceStatus.title": { en: "SP-API-LF-01 · 確認使用者裝置綁定狀態", zh: "SP-API-LF-01 · 確認使用者裝置綁定狀態" },
  "deviceStatus.subtitle": {
    en: "checkDeviceStatus — is_fido / is_mcert_sign for a given id_num.",
    zh: "checkDeviceStatus — 查詢指定 id_num 的 is_fido / is_mcert_sign 狀態。",
  },
  "deviceStatus.requestFieldsCard": { en: "Request fields", zh: "請求欄位" },
  "deviceStatus.checking": { en: "Checking…", zh: "查詢中…" },
  "deviceStatus.submit": { en: "Check device status", zh: "查詢裝置狀態" },

  // App link (APP-API-01)
  "appLink.title": { en: "APP-API-01 · 認證/簽章功能 (verifySign)", zh: "APP-API-01 · 認證/簽章功能 (verifySign)" },
  "appLink.subtitle": {
    en: "Standalone mobilemoica://…/verifySign deep-link builder — works with any sp_ticket, from any of the ticket-issuing pages, and independently decodes/verifies a ticket's digest.",
    zh: "獨立的 mobilemoica://…/verifySign 深層連結產生器 — 可搭配任何頁面核發的 sp_ticket 使用，並能獨立解析/驗證票證的摘要。",
  },
  "appLink.inputsCard": { en: "Inputs", zh: "輸入欄位" },
  "appLink.mode": { en: "Mode", zh: "模式" },
  "appLink.modeW2a": { en: "Mobile Web → App (w2a)", zh: "行動網頁 → App（w2a）" },
  "appLink.modeA2a": { en: "App → App (a2a)", zh: "App → App（a2a）" },
  "appLink.decoding": { en: "Decoding…", zh: "解析中…" },
  "appLink.decode": { en: "Decode & verify ticket digest", zh: "解析並驗證票證摘要" },
  "appLink.decodedCard": { en: "Decoded sp_ticket", zh: "已解析的 sp_ticket" },
  "appLink.digestMatches": { en: "digest matches", zh: "摘要相符" },
  "appLink.digestMismatch": { en: "digest mismatch", zh: "摘要不符" },
  "appLink.deepLinkCard": { en: "Deep link", zh: "深層連結" },
  "appLink.openApp": { en: "Open 行動自然人憑證 App", zh: "開啟「行動自然人憑證」App" },

  // Redirect (WEB-01)
  "redirect.title": { en: "SP-API-WEB-01 · 網頁轉導模式介面", zh: "SP-API-WEB-01 · 網頁轉導模式介面" },
  "redirect.subtitle": {
    en: "fidoRedirect/web — this SP computes transaction_id + sp_checksum locally, then the browser POSTs straight to {fidoweb}, exactly like the Spec's own HTML samples. Requires an SP Callback URL configured on Settings.",
    zh: "fidoRedirect/web — 此 SP 會在本地端計算 transaction_id 與 sp_checksum，接著由瀏覽器直接 POST 至 {fidoweb}，與規格書內的 HTML 範例完全相同。使用前須先在「設定」頁配置 SP 回呼網址。",
  },
  "redirect.requestFieldsCard": { en: "Request fields", zh: "請求欄位" },
  "redirect.computing": { en: "Computing…", zh: "計算中…" },
  "redirect.compute": { en: "Compute sp_checksum", zh: "計算 sp_checksum" },
  "redirect.computedCard": { en: "Computed — ready to redirect", zh: "計算完成，可開始轉導" },
  "redirect.checksumPayloadLabel": { en: "sp_checksum payload string", zh: "sp_checksum 待雜湊字串" },
  "redirect.formFieldsLabel": { en: "form fields that will be POSTed", zh: "將被 POST 送出的表單欄位" },
  "redirect.curlCard": { en: "cURL command", zh: "cURL 指令" },
  "redirect.curlLabel": { en: "reproduce this request from a terminal", zh: "可在終端機重現此請求" },
  "redirect.submitNote": {
    en: "Submitting navigates this tab away to {url} — the MOICA-hosted redirect UI, outside this app.",
    zh: "送出後此分頁將導向 {url} — 該轉導頁面由 MOICA 提供，不屬於本站。",
  },
  "redirect.continueToApp": { en: "Continue to 行動自然人憑證 →", zh: "繼續前往「行動自然人憑證」→" },

  // Redirect result (callback)
  "redirectResult.title": { en: "SP-API-WEB-01 callback result", zh: "SP-API-WEB-01 callback 結果" },
  "redirectResult.subtitle": {
    en: "What MOICA POSTed to this app's /api/callback (the SP Callback URL) after the redirect flow completed.",
    zh: "轉導流程完成後，MOICA POST 到本站 /api/callback（SP 回呼網址）的內容。",
  },
  "redirectResult.noSidWarning": {
    en: 'The callback arrived without a ?sid= query param, so this app couldn\'t look up which session\'s AES key to verify idp_checksum against. Use the "Use this app\'s URL" button on Settings to get a callback URL with the correlation id included.',
    zh: "此 callback 沒有帶 ?sid= 參數，本站因此無法判斷該用哪個工作階段的 AES 金鑰來驗證 idp_checksum。請在「設定」頁使用「使用本站網址」按鈕，取得含關聯 id 的回呼網址。",
  },
  "redirectResult.noTxPrefix": { en: "No transaction id in the URL. Trigger a redirect from", zh: "網址中沒有 transaction id。請先從" },
  "redirectResult.noTxSuffix": { en: "first.", zh: "觸發一次轉導。" },
  "redirectResult.noEntry": {
    en: "No callback recorded yet for transaction {tx}. If you just submitted the redirect form, MOICA hasn't POSTed back here yet — reload this page once it does. If nothing ever arrives, this deployment's sp_callback_url likely isn't publicly reachable from MOICA's servers (see SPEC.md §3/§9).",
    zh: "交易 {tx} 尚無 callback 紀錄。若你剛送出轉導表單，可能是 MOICA 還沒 POST 回來 — 等收到後重新整理此頁即可。若一直沒有收到，很可能是此部署的 sp_callback_url 無法被 MOICA 伺服器公開連線（詳見 SPEC.md §3/§9）。",
  },
  "redirectResult.verificationCard": { en: "Verification", zh: "驗證結果" },
  "redirectResult.checksumVerified": { en: "idp_checksum verified", zh: "idp_checksum 驗證成功" },
  "redirectResult.checksumFailed": { en: "idp_checksum failed", zh: "idp_checksum 驗證失敗" },
  "redirectResult.received": { en: "Received {time}", zh: "接收時間 {time}" },
  "redirectResult.fieldsCard": { en: "Callback fields", zh: "Callback 欄位" },

  // Reference
  "reference.title": { en: "Reference", zh: "參考資料" },
  "reference.subtitle": {
    en: "Condensed from 行動自然人憑證應用程式介面規格書 v2.9 §參.三 and §伍 — see SPEC.md for the full write-up this app was built from.",
    zh: "摘錄自「行動自然人憑證應用程式介面規格書」v2.9 §參.三 及 §伍 — 完整內容請見本站據以開發的 SPEC.md。",
  },
  "reference.txCard": { en: "transaction_id", zh: "transaction_id" },
  "reference.txBody": {
    en: "UUIDv4 (or another identifier), ≤100 characters. A fresh one is generated per request unless you override it in a page's form.",
    zh: "UUIDv4（或其他識別碼），長度 ≤100 字元。除非在頁面表單中覆寫，否則每次請求都會自動產生新值。",
  },
  "reference.checksumCard": { en: "sp_checksum / idp_checksum", zh: "sp_checksum / idp_checksum" },
  "reference.checksumIntro": { en: "Both use AES_GCM_HEX( SHA256_HEX( Payload ) ):", zh: "兩者皆採用 AES_GCM_HEX( SHA256_HEX( Payload ) )：" },
  "reference.checksumStep1": {
    en: "Concatenate the interface's specified fields into one string (empty string for unused optional fields).",
    zh: "將該介面規定的欄位串接成一個字串（未使用的選用欄位以空字串處理）。",
  },
  "reference.checksumStep2": { en: 'hex = SHA256(payload.getBytes("UTF-8")) → lowercase 64-char hex string.', zh: 'hex = SHA256(payload.getBytes("UTF-8")) → 小寫 64 字元十六進位字串。' },
  "reference.checksumStep3": {
    en: "AES-256-GCM encrypt the hex string's UTF-8 bytes (not the raw 32-byte digest) with an all-zero 12-byte IV and a 128-bit auth tag.",
    zh: "以全零的 12-byte IV 及 128-bit 認證標籤，對該十六進位字串的 UTF-8 位元組（而非原始 32-byte 摘要）進行 AES-256-GCM 加密。",
  },
  "reference.checksumStep4": { en: "Result = hex(iv) + hex(ciphertext + tag).", zh: "結果 = hex(iv) + hex(ciphertext + tag)。" },
  "reference.checksumNote": {
    en: "This app's implementation is verified via an encrypt→decrypt round-trip self-test (lib/moica/crypto.selftest.ts) rather than the Spec's own worked hex examples, which had text-extraction artifacts across a PDF page break — see SPEC.md §6.2/§11.",
    zh: "本站的實作是透過加密→解密的自我測試（lib/moica/crypto.selftest.ts）來驗證，而非直接比對規格書內的十六進位範例 — 該範例因 PDF 跨頁而有文字擷取瑕疵，詳見 SPEC.md §6.2/§11。",
  },
  "reference.spTicketCard": { en: "sp_ticket", zh: "sp_ticket" },
  "reference.spTicketFormula": {
    en: 'BASE64URL(payloadJson) + "." + BASE64URL(SHA256(BASE64URL(payloadJson)))',
    zh: 'BASE64URL(payloadJson) + "." + BASE64URL(SHA256(BASE64URL(payloadJson)))',
  },
  "reference.spTicketBody": {
    en: "A two-segment (not three-segment / not a real JWT) token. The digest is an integrity check on the ticket itself — anyone can recompute it, so it does not prove the ticket came from MOICA, only that the two segments weren't corrupted in transit.",
    zh: "這是一個兩段式（非三段式，並非真正的 JWT）token。摘要僅為票證本身的完整性檢查 — 任何人都能重新計算，因此無法證明票證來自 MOICA，只能證明這兩段內容在傳輸過程中未遭竄改。",
  },
  "reference.interfacesCard": { en: "Interfaces implemented", zh: "已實作介面" },
  "reference.interfacesSubtitle": { en: "介面編號 → this app's route", zh: "介面編號 → 本站對應路由" },
  "reference.specId": { en: "Spec ID", zh: "介面編號" },
  "reference.englishName": { en: "English name", zh: "英文名稱" },
  "reference.page": { en: "Page", zh: "頁面" },
  "reference.errorCodesCard": { en: "Error codes", zh: "錯誤代碼" },
  "reference.errorCodesSubtitle": {
    en: "錯誤代碼為：介面編號 || '-' || 系統錯誤代碼 (e.g. SP-API-ATH-01-INV_SP_CHECKSUM)",
    zh: "錯誤代碼為：介面編號 || '-' || 系統錯誤代碼（例如 SP-API-ATH-01-INV_SP_CHECKSUM）",
  },
  "reference.colErrorCode": { en: "系統錯誤代碼", zh: "系統錯誤代碼" },
  "reference.colDescription": { en: "詳細敘述", zh: "詳細敘述" },
  "reference.colAdvice": { en: "處理建議", zh: "處理建議" },

  // Shared: ProxyResultView
  "proxyResult.networkCard": { en: "Network", zh: "網路連線" },
  "proxyResult.connected": { en: "connected", zh: "已連線" },
  "proxyResult.connectionFailed": { en: "failed", zh: "連線失敗" },
  "proxyResult.networkErrorNote": {
    en: "{error} — expected outside Taiwan / without IP allow-listing per Spec §貳.三; see SPEC.md §3.",
    zh: "{error} — 依規格書 §貳.三，若非在台灣境內或未被列入 IP 白名單，此屬預期行為；詳見 SPEC.md §3。",
  },
  "proxyResult.spChecksumCard": { en: "sp_checksum (SP → IdP)", zh: "sp_checksum（SP → IdP）" },
  "proxyResult.payloadHashedLabel": { en: "payload string that was hashed", zh: "被雜湊的原始字串" },
  "proxyResult.spChecksumHexLabel": { en: "sp_checksum (hex)", zh: "sp_checksum（十六進位）" },
  "proxyResult.requestBodyCard": { en: "Request body sent", zh: "送出的請求內容" },
  "proxyResult.curlCard": { en: "cURL command", zh: "cURL 指令" },
  "proxyResult.curlLabel": { en: "reproduce this request from a terminal", zh: "可在終端機重現此請求" },
  "proxyResult.responseBodyCard": { en: "Response body", zh: "回應內容" },
  "proxyResult.errorCodeZero": { en: "error_code = 0", zh: "error_code = 0" },
  "proxyResult.errorCodeNonZero": { en: "error_code = {code}", zh: "error_code = {code}" },
  "proxyResult.idpChecksumCard": { en: "idp_checksum (IdP → SP) verification", zh: "idp_checksum（IdP → SP）驗證" },
  "proxyResult.idpVerified": { en: "verified", zh: "驗證成功" },
  "proxyResult.idpVerificationFailed": { en: "verification failed", zh: "驗證失敗" },
  "proxyResult.idpPayloadLabel": { en: "payload string that should hash to idp_checksum", zh: "應雜湊為 idp_checksum 的原始字串" },
  "proxyResult.decodedTicketCard": { en: "Decoded sp_ticket", zh: "已解析的 sp_ticket" },
  "proxyResult.digestMatches": { en: "digest matches", zh: "摘要相符" },
  "proxyResult.digestMismatch": { en: "digest mismatch", zh: "摘要不符" },

  // Shared: reachability check
  "reachability.checking": { en: "Checking…", zh: "檢查中…" },
  "reachability.checkButton": { en: "Check {fidoapi} reachability", zh: "檢查 {fidoapi} 連線狀態" },
  "reachability.reachable": { en: "reachable", zh: "可連線" },
  "reachability.unreachable": { en: "unreachable", zh: "無法連線" },
  "reachability.expectedNote": {
    en: "Expected in most places: per the Spec, the UAT host is documented as unreachable from outside Taiwan and production is IP-allow-listed to registered agencies (see SPEC.md §3).",
    zh: "在多數地區屬預期行為：依規格書所述，UAT 主機在台灣境外無法連線，正式環境則僅開放給已登記機關的 IP 白名單（詳見 SPEC.md §3）。",
  },

  // Shared: sign_info fields
  "signInfo.tbsLabel": { en: "TBS (sign_data)", zh: "TBS（sign_data）" },
  "signInfo.plainText": { en: "Plain text", zh: "純文字" },
  "signInfo.alreadyBase64": { en: "Already base64", zh: "已是 base64" },
  "signInfo.charsLimit": { en: "{count} chars (limit 1024 per Spec) · tbs_encoding=", zh: "{count} 字元（規格書上限 1024）· tbs_encoding=" },
  "signInfo.autoBase64Note": { en: "· auto-base64-encoded because sign_type=RAW", zh: "· 因 sign_type=RAW，已自動轉為 base64" },

  // Shared: ui.tsx
  "ui.copy": { en: "copy", zh: "複製" },
  "ui.copied": { en: "copied", zh: "已複製" },
} as const satisfies Record<string, Record<Locale, string>>;

export type TKey = keyof typeof translations;

/** Simple `{placeholder}` interpolation, e.g. translate("x", "en", { count: 3 }). */
export function translate(locale: Locale, key: TKey, vars?: Record<string, string | number>): string {
  const template = translations[key][locale];
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in vars ? String(vars[name]) : match
  );
}
