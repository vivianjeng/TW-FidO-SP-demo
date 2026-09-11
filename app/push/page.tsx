"use client";

import { useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buttonClass, Card, ErrorBanner, Field, inputClass, selectClass } from "@/components/ui";
import { SignInfoFields } from "@/components/SignInfoFields";
import { ProxyResultView } from "@/components/ProxyResultView";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { OpCode, ProxyResult, RequestAthOrSignPushResponse, SignInfo } from "@/lib/moica/types";

export default function PushPage() {
  const t = useT();
  const [opCode, setOpCode] = useState<OpCode>("ATH");
  const [idNum, setIdNum] = useState("A123456789");
  const [hint, setHint] = useState("XX需用機關認證");
  const [deviceDesc, setDeviceDesc] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [transactionId, setTransactionId] = useState("");
  const [spServiceIdOverride, setSpServiceIdOverride] = useState("");
  const [signInfo, setSignInfo] = useState<SignInfo>({ sign_type: "PKCS#7", sign_data: "", tbs_encoding: "NONE" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyResult<RequestAthOrSignPushResponse> | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postJson<ProxyResult<RequestAthOrSignPushResponse>>("/api/ath03", {
        transaction_id: transactionId || undefined,
        id_num: idNum,
        op_code: opCode,
        hint,
        device_user_def_desc: deviceDesc || undefined,
        time_limit: timeLimit,
        sign_info: opCode === "SIGN" ? signInfo : undefined,
        sp_service_id_override: spServiceIdOverride || undefined,
      });
      setResult(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">{t("push.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("push.subtitle")}</p>
      </div>

      <ErrorBanner message={error} />

      <Card title={t("push.requestFieldsCard")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="id_num">
            <input className={inputClass} value={idNum} onChange={(e) => setIdNum(e.target.value)} />
          </Field>
          <Field label="op_code">
            <select className={selectClass} value={opCode} onChange={(e) => setOpCode(e.target.value as OpCode)}>
              <option value="ATH">ATH</option>
              <option value="SIGN">SIGN</option>
              <option value="NFCSIGN">NFCSIGN</option>
            </select>
          </Field>
        </div>
        <Field label="hint">
          <input className={inputClass} value={hint} onChange={(e) => setHint(e.target.value)} />
        </Field>
        <Field
          label={`device_user_def_desc (${t("common.optional")})`}
          hint={t("push.deviceDescHint")}
        >
          <input className={inputClass} value={deviceDesc} onChange={(e) => setDeviceDesc(e.target.value)} />
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

        <button type="button" className={buttonClass} onClick={submit} disabled={loading}>
          {loading ? t("push.requesting") : t("push.submit")}
        </button>
      </Card>

      {result && <ProxyResultView result={result} />}
    </div>
  );
}
