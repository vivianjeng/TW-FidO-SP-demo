"use client";

import { useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buildAppLink } from "@/lib/moica/applink";
import { buttonClass, Card, ErrorBanner, Field, inputClass, secondaryButtonClass, selectClass, SegmentedControl } from "@/components/ui";
import { SignInfoFields } from "@/components/SignInfoFields";
import { ProxyResultView } from "@/components/ProxyResultView";
import { QrCode } from "@/components/QrCode";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { GetSpTicketResponse, OpCode, OpMode, ProxyResult, SignInfo } from "@/lib/moica/types";

export default function TicketPage() {
  const t = useT();
  const [opMode, setOpMode] = useState<OpMode>("I-SCAN");
  const [opCode, setOpCode] = useState<OpCode>("ATH");
  const [idNum, setIdNum] = useState("A123456789");
  const [hint, setHint] = useState("XX需用機關認證");
  const [timeLimit, setTimeLimit] = useState(60);
  const [transactionId, setTransactionId] = useState("");
  const [spServiceIdOverride, setSpServiceIdOverride] = useState("");
  const [signInfo, setSignInfo] = useState<SignInfo>({ sign_type: "PKCS#7", sign_data: "", tbs_encoding: "NONE" });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyResult<GetSpTicketResponse> | null>(null);

  const [rtnUrl, setRtnUrl] = useState("");
  const [rtnVal, setRtnVal] = useState("");

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postJson<ProxyResult<GetSpTicketResponse>>("/api/ath01", {
        transaction_id: transactionId || undefined,
        id_num: idNum,
        op_code: opCode,
        op_mode: opMode,
        hint,
        time_limit: timeLimit,
        sign_info: opCode === "SIGN" ? signInfo : undefined,
        sp_service_id_override: spServiceIdOverride || undefined,
      });
      setResult(res);
      if (typeof window !== "undefined" && !rtnUrl) {
        setRtnUrl(window.location.href);
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const spTicket = result?.response?.result?.sp_ticket;
  const appLink =
    spTicket && (opMode === "APP2APP" || opMode === "MWEB2APP")
      ? buildAppLink({ spTicket, rtnUrl, rtnVal, mode: opMode === "APP2APP" ? "a2a" : "w2a" })
      : null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("ticket.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("ticket.subtitle")}</p>
      </div>

      <ErrorBanner message={error} />

      <Card title={t("ticket.opModeCard")}>
        <SegmentedControl
          value={opMode}
          onChange={setOpMode}
          options={[
            { value: "I-SCAN", label: "I-SCAN (QR)" },
            { value: "APP2APP", label: "APP2APP" },
            { value: "MWEB2APP", label: "MWEB2APP" },
          ]}
        />
      </Card>

      <Card title={t("ticket.requestFieldsCard")}>
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
        <Field label={`sp_service_id override (${t("common.optional")})`} hint={t("common.leaveBlankUseSettings")}>
          <input
            className={inputClass}
            value={spServiceIdOverride}
            onChange={(e) => setSpServiceIdOverride(e.target.value)}
            placeholder="e.g. to test SPSVCID_NF"
          />
        </Field>

        {opCode === "SIGN" && <SignInfoFields value={signInfo} onChange={setSignInfo} />}

        <button type="button" className={buttonClass} onClick={submit} disabled={loading}>
          {loading ? t("ticket.requesting") : t("ticket.submit")}
        </button>
      </Card>

      {result && (
        <>
          <ProxyResultView result={result} />

          {spTicket && opMode === "I-SCAN" && (
            <Card title={t("ticket.qrCard")} subtitle={t("ticket.qrCardSubtitle")}>
              <QrCode value={spTicket} />
            </Card>
          )}

          {spTicket && (opMode === "APP2APP" || opMode === "MWEB2APP") && (
            <Card title={t("ticket.deepLinkCard")} subtitle={t("ticket.deepLinkCardSubtitle")}>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="rtn_url">
                  <input className={inputClass} value={rtnUrl} onChange={(e) => setRtnUrl(e.target.value)} />
                </Field>
                <Field label="rtn_val">
                  <input className={inputClass} value={rtnVal} onChange={(e) => setRtnVal(e.target.value)} />
                </Field>
              </div>
              {appLink && (
                <div className="space-y-3">
                  <div className="text-xs break-all rounded-md border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-black/20 p-2 font-mono">
                    {appLink}
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <a href={appLink} className={secondaryButtonClass}>
                      {t("ticket.openApp")}
                    </a>
                    <QrCode value={appLink} size={160} />
                  </div>
                </div>
              )}
            </Card>
          )}
        </>
      )}
    </div>
  );
}
