"use client";

import { useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buildAppLink } from "@/lib/moica/applink";
import {
  buttonClass,
  Card,
  ErrorBanner,
  Field,
  inputClass,
  secondaryButtonClass,
  selectClass,
  SegmentedControl,
} from "@/components/ui";
import { ProxyResultView } from "@/components/ProxyResultView";
import { QrCode } from "@/components/QrCode";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { DoBatchSigningResponse, HashAlgorithm, OpMode, ProxyResult, SignType, TbsEncoding } from "@/lib/moica/types";

const MAX_DOCS = 20;

export default function BatchPage() {
  const t = useT();
  const [opMode, setOpMode] = useState<Extract<OpMode, "PUSH" | "APP2APP" | "MWEB2APP">>("PUSH");
  const [idNum, setIdNum] = useState("A123456789");
  const [hint, setHint] = useState("連續簽署待簽署資料");
  const [deviceDesc, setDeviceDesc] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [transactionId, setTransactionId] = useState("");
  const [spServiceIdOverride, setSpServiceIdOverride] = useState("");

  const [signType, setSignType] = useState<SignType>("RAW");
  const [tbsEncoding, setTbsEncoding] = useState<TbsEncoding>("base64");
  const [hashAlgorithm, setHashAlgorithm] = useState<HashAlgorithm>("SHA256");
  const [docs, setDocs] = useState<string[]>(["MCEwCQYFKw4DAhoFAAQU52AqDFox+uJOPeG8gd86df9UY3g="]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyResult<DoBatchSigningResponse> | null>(null);
  const [rtnUrl, setRtnUrl] = useState("");
  const [rtnVal, setRtnVal] = useState("");

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postJson<ProxyResult<DoBatchSigningResponse>>("/api/ath04", {
        transaction_id: transactionId || undefined,
        id_num: idNum,
        op_mode: opMode,
        hint,
        device_user_def_desc: deviceDesc || undefined,
        time_limit: timeLimit,
        sign_info: { sign_type: signType, sign_data_set: docs, tbs_encoding: tbsEncoding, hash_algorithm: hashAlgorithm },
        sp_service_id_override: spServiceIdOverride || undefined,
      });
      setResult(res);
      if (typeof window !== "undefined" && !rtnUrl) setRtnUrl(window.location.href);
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">{t("batch.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("batch.subtitle", { max: MAX_DOCS })}</p>
      </div>

      <ErrorBanner message={error} />

      <Card title={t("batch.opModeCard")}>
        <SegmentedControl
          value={opMode}
          onChange={setOpMode}
          options={[
            { value: "PUSH", label: "PUSH" },
            { value: "APP2APP", label: "APP2APP" },
            { value: "MWEB2APP", label: "MWEB2APP" },
          ]}
        />
      </Card>

      <Card title={t("batch.requestFieldsCard")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="id_num">
            <input className={inputClass} value={idNum} onChange={(e) => setIdNum(e.target.value)} />
          </Field>
          <Field label={`device_user_def_desc (${t("common.optional")})`}>
            <input className={inputClass} value={deviceDesc} onChange={(e) => setDeviceDesc(e.target.value)} />
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
        <Field label={`sp_service_id override (${t("common.optional")})`}>
          <input
            className={inputClass}
            value={spServiceIdOverride}
            onChange={(e) => setSpServiceIdOverride(e.target.value)}
          />
        </Field>
      </Card>

      <Card title={t("batch.signInfoCard")}>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="sign_type">
            <select className={selectClass} value={signType} onChange={(e) => setSignType(e.target.value as SignType)}>
              <option value="RAW">RAW</option>
              <option value="PKCS#1">PKCS#1</option>
              <option value="PKCS#7">PKCS#7</option>
            </select>
          </Field>
          <Field label="tbs_encoding" hint={t("batch.tbsEncodingHint")}>
            <select
              className={selectClass}
              value={tbsEncoding}
              onChange={(e) => setTbsEncoding(e.target.value as TbsEncoding)}
              disabled
            >
              <option value="base64">base64</option>
            </select>
          </Field>
        </div>
        {signType !== "RAW" && (
          <Field label="hash_algorithm">
            <select
              className={selectClass}
              value={hashAlgorithm}
              onChange={(e) => setHashAlgorithm(e.target.value as HashAlgorithm)}
            >
              <option value="SHA256">SHA256</option>
              <option value="SHA384">SHA384</option>
              <option value="SHA512">SHA512</option>
            </select>
          </Field>
        )}

        <div className="space-y-2">
          <span className="text-sm font-medium">
            sign_data_set ({docs.length}/{MAX_DOCS})
          </span>
          {docs.map((doc, i) => (
            <div key={i} className="flex gap-2 items-start">
              <textarea
                className={`${inputClass} font-mono min-h-16`}
                value={doc}
                onChange={(e) => setDocs((prev) => prev.map((d, idx) => (idx === i ? e.target.value : d)))}
              />
              <button
                type="button"
                className={secondaryButtonClass}
                onClick={() => setDocs((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={docs.length <= 1}
              >
                {t("batch.remove")}
              </button>
            </div>
          ))}
          <button
            type="button"
            className={secondaryButtonClass}
            onClick={() => setDocs((prev) => [...prev, ""])}
            disabled={docs.length >= MAX_DOCS}
          >
            {t("batch.addDocument")}
          </button>
        </div>

        <button type="button" className={buttonClass} onClick={submit} disabled={loading}>
          {loading ? t("batch.requesting") : t("batch.submit")}
        </button>
      </Card>

      {result && (
        <>
          <ProxyResultView result={result} />
          {spTicket && (opMode === "APP2APP" || opMode === "MWEB2APP") && (
            <Card title={t("batch.deepLinkCard")} subtitle={t("batch.deepLinkCardSubtitle")}>
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
                      {t("batch.openApp")}
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
