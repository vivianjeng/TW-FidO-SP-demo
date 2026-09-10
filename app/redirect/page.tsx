"use client";

import { useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buttonClass, Card, ErrorBanner, Field, inputClass, JsonBlock, selectClass } from "@/components/ui";
import { SignInfoFields } from "@/components/SignInfoFields";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { OpCode, SignInfo, WebRedirectFields } from "@/lib/moica/types";

interface TokenResponse {
  fields: WebRedirectFields;
  spChecksumPayload: string;
  actionUrl: string;
}

export default function RedirectPage() {
  const t = useT();
  const [opCode, setOpCode] = useState<OpCode>("SIGN");
  const [hint, setHint] = useState("簽章提示訊息");
  const [timeLimit, setTimeLimit] = useState(60);
  const [transactionId, setTransactionId] = useState("");
  const [spServiceIdOverride, setSpServiceIdOverride] = useState("");
  const [signInfo, setSignInfo] = useState<SignInfo>({
    sign_type: "PKCS#7",
    sign_data: "Good Morning, I am your plaindata.",
    tbs_encoding: "NONE",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<TokenResponse | null>(null);

  const compute = async () => {
    setLoading(true);
    setError(null);
    setToken(null);
    try {
      const res = await postJson<TokenResponse>("/api/redirect-token", {
        transaction_id: transactionId || undefined,
        op_code: opCode,
        hint,
        time_limit: timeLimit,
        sign_type: opCode === "SIGN" ? signInfo.sign_type : undefined,
        sign_data: opCode === "SIGN" ? signInfo.sign_data : undefined,
        tbs_encoding: opCode === "SIGN" ? signInfo.tbs_encoding : undefined,
        hash_algorithm: opCode === "SIGN" ? signInfo.hash_algorithm : undefined,
        sp_service_id_override: spServiceIdOverride || undefined,
      });
      setToken(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("redirect.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("redirect.subtitle", { fidoweb: "{fidoweb}" })}</p>
      </div>

      <ErrorBanner message={error} />

      <Card title={t("redirect.requestFieldsCard")}>
        <Field label="op_code">
          <select className={selectClass} value={opCode} onChange={(e) => setOpCode(e.target.value as OpCode)}>
            <option value="SIGN">SIGN</option>
            <option value="ATH">ATH</option>
            <option value="NFCSIGN">NFCSIGN</option>
          </select>
        </Field>
        <Field label="hint">
          <input className={inputClass} value={hint} onChange={(e) => setHint(e.target.value)} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="time_limit (seconds, 30–600)">
            <input
              type="number"
              min={30}
              max={600}
              className={inputClass}
              value={timeLimit}
              onChange={(e) => setTimeLimit(Number(e.target.value))}
            />
          </Field>
          <Field label="transaction_id" hint={t("common.leaveBlankUuid")}>
            <input
              className={inputClass}
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder={t("common.auto")}
            />
          </Field>
        </div>
        <Field label={`sp_service_id override (${t("common.optional")})`}>
          <input
            className={inputClass}
            value={spServiceIdOverride}
            onChange={(e) => setSpServiceIdOverride(e.target.value)}
          />
        </Field>

        {opCode === "SIGN" && <SignInfoFields value={signInfo} onChange={setSignInfo} />}

        <button type="button" className={buttonClass} onClick={compute} disabled={loading}>
          {loading ? t("redirect.computing") : t("redirect.compute")}
        </button>
      </Card>

      {token && (
        <Card title={t("redirect.computedCard")}>
          <JsonBlock label={t("redirect.checksumPayloadLabel")} value={token.spChecksumPayload} />
          <JsonBlock label={t("redirect.formFieldsLabel")} value={token.fields} />
          <p className="text-xs opacity-60">{t("redirect.submitNote", { url: token.actionUrl })}</p>
          <form method="POST" action={token.actionUrl}>
            {Object.entries(token.fields).map(([key, value]) => (
              <input key={key} type="hidden" name={key} value={String(value ?? "")} />
            ))}
            <button type="submit" className={buttonClass}>
              {t("redirect.continueToApp")}
            </button>
          </form>
        </Card>
      )}
    </div>
  );
}
