// APP-API-01 (認證/簽章功能) deep link builder. No secrets involved, safe to run in
// the browser. The Spec's prose says "Base64(rtn_url)" but its own JS/Android/iOS
// sample code all call a base64url encoder — this matches the sample code, since raw
// base64 (`+ / =`) is not URL-safe inside a query string.

export type AppLinkMode = "w2a" | "a2a";

export interface AppLinkOptions {
  spTicket: string;
  rtnUrl: string;
  rtnVal: string;
  /** w2a = Web-to-App (Mobile Web to APP), a2a = App-to-App. */
  mode: AppLinkMode;
}

function base64UrlEncodeText(text: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(text, "utf8").toString("base64url");
  }
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function buildAppLink({ spTicket, rtnUrl, rtnVal, mode }: AppLinkOptions): string {
  const base =
    mode === "w2a" ? "mobilemoica://moica.moi.gov.tw/w2a/verifySign" : "mobilemoica://moica.moi.gov.tw/a2a/verifySign";
  const params = new URLSearchParams({
    sp_ticket: spTicket,
    rtn_url: base64UrlEncodeText(rtnUrl),
    rtn_val: base64UrlEncodeText(rtnVal),
  });
  return `${base}?${params.toString()}`;
}
