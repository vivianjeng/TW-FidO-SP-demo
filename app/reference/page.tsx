import { Card } from "@/components/ui";
import { ERROR_CODE_REFERENCE } from "@/lib/moica/types";

export default function ReferencePage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">Reference</h1>
        <p className="text-sm opacity-70 mt-1">
          Condensed from 行動自然人憑證應用程式介面規格書 v2.9 §參.三 and §伍 — see SPEC.md for the full write-up
          this app was built from.
        </p>
      </div>

      <Card title="transaction_id">
        <p className="text-sm">
          UUIDv4 (or another identifier), ≤100 characters. A fresh one is generated per request unless you override
          it in a page&apos;s form.
        </p>
      </Card>

      <Card title="sp_checksum / idp_checksum">
        <p className="text-sm">
          Both use <code>AES_GCM_HEX( SHA256_HEX( Payload ) )</code>:
        </p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>Concatenate the interface&apos;s specified fields into one string (empty string for unused optional fields).</li>
          <li><code>hex = SHA256(payload.getBytes(&quot;UTF-8&quot;))</code> → lowercase 64-char hex string.</li>
          <li>
            AES-256-GCM encrypt the <b>hex string&apos;s UTF-8 bytes</b> (not the raw 32-byte digest) with an
            all-zero 12-byte IV and a 128-bit auth tag.
          </li>
          <li>
            Result = <code>hex(iv) + hex(ciphertext + tag)</code>.
          </li>
        </ol>
        <p className="text-xs opacity-60">
          This app&apos;s implementation is verified via an encrypt→decrypt round-trip self-test
          (<code>lib/moica/crypto.selftest.ts</code>) rather than the Spec&apos;s own worked hex examples, which had
          text-extraction artifacts across a PDF page break — see SPEC.md §6.2/§11.
        </p>
      </Card>

      <Card title="sp_ticket">
        <p className="text-sm font-mono">BASE64URL(payloadJson) + &quot;.&quot; + BASE64URL(SHA256(BASE64URL(payloadJson)))</p>
        <p className="text-sm">
          A two-segment (not three-segment / not a real JWT) token. The digest is an integrity check on the ticket
          itself — anyone can recompute it, so it does not prove the ticket came from MOICA, only that the two
          segments weren&apos;t corrupted in transit.
        </p>
      </Card>

      <Card title="Interfaces implemented" subtitle="介面編號 → this app's route">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/10">
              <th className="py-1 pr-4">Spec ID</th>
              <th className="py-1 pr-4">English name</th>
              <th className="py-1">Page</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {[
              ["SP-API-WEB-01", "fidoRedirect (web)", "/redirect"],
              ["SP-API-ATH-01", "getSpTicket", "/ticket"],
              ["SP-API-ATH-02", "getAthOrSignResult", "/result"],
              ["SP-API-ATH-03", "requestAthOrSignPush", "/push"],
              ["SP-API-ATH-04", "doBatchSigning", "/batch"],
              ["SP-API-LF-01", "checkDeviceStatus", "/device-status"],
              ["APP-API-01", "verifySign (deep link)", "/app-link"],
            ].map(([id, name, href]) => (
              <tr key={id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-1 pr-4 font-mono">{id}</td>
                <td className="py-1 pr-4">{name}</td>
                <td className="py-1">
                  <a href={href} className="text-blue-600 dark:text-blue-400 underline">
                    {href}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card
        title="Error codes"
        subtitle={"錯誤代碼為：介面編號 || '-' || 系統錯誤代碼 (e.g. SP-API-ATH-01-INV_SP_CHECKSUM)"}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-black/10 dark:border-white/10">
                <th className="py-1 pr-3">系統錯誤代碼</th>
                <th className="py-1 pr-3">詳細敘述</th>
                <th className="py-1">處理建議</th>
              </tr>
            </thead>
            <tbody>
              {ERROR_CODE_REFERENCE.map((row) => (
                <tr key={row.code} className="border-b border-black/5 dark:border-white/5 align-top">
                  <td className="py-1 pr-3 font-mono whitespace-nowrap">{row.code}</td>
                  <td className="py-1 pr-3">{row.description}</td>
                  <td className="py-1 opacity-80">{row.advice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
