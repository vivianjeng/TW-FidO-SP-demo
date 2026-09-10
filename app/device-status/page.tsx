"use client";

import { useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buttonClass, Card, ErrorBanner, Field, inputClass } from "@/components/ui";
import { ProxyResultView } from "@/components/ProxyResultView";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { CheckDeviceStatusResponse, ProxyResult } from "@/lib/moica/types";

export default function DeviceStatusPage() {
  const t = useT();
  const [idNum, setIdNum] = useState("A123456789");
  const [transactionId, setTransactionId] = useState("");
  const [spServiceIdOverride, setSpServiceIdOverride] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyResult<CheckDeviceStatusResponse> | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postJson<ProxyResult<CheckDeviceStatusResponse>>("/api/lf01", {
        transaction_id: transactionId || undefined,
        id_num: idNum,
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
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("deviceStatus.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("deviceStatus.subtitle")}</p>
      </div>

      <ErrorBanner message={error} />

      <Card title={t("deviceStatus.requestFieldsCard")}>
        <Field label="id_num">
          <input className={inputClass} value={idNum} onChange={(e) => setIdNum(e.target.value)} />
        </Field>
        <Field label="transaction_id" hint={t("common.leaveBlankUuid")}>
          <input
            className={inputClass}
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder={t("common.auto")}
          />
        </Field>
        <Field label={`sp_service_id override (${t("common.optional")})`}>
          <input
            className={inputClass}
            value={spServiceIdOverride}
            onChange={(e) => setSpServiceIdOverride(e.target.value)}
          />
        </Field>
        <button type="button" className={buttonClass} onClick={submit} disabled={loading}>
          {loading ? t("deviceStatus.checking") : t("deviceStatus.submit")}
        </button>
      </Card>

      {result && <ProxyResultView result={result} />}
    </div>
  );
}
