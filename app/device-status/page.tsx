"use client";

import { useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buttonClass, Card, ErrorBanner, Field, inputClass } from "@/components/ui";
import { ProxyResultView } from "@/components/ProxyResultView";
import type { CheckDeviceStatusResponse, ProxyResult } from "@/lib/moica/types";

export default function DeviceStatusPage() {
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
        <h1 className="text-2xl font-semibold">SP-API-LF-01 · 確認使用者裝置綁定狀態</h1>
        <p className="text-sm opacity-70 mt-1">checkDeviceStatus — is_fido / is_mcert_sign for a given id_num.</p>
      </div>

      <ErrorBanner message={error} />

      <Card title="Request fields">
        <Field label="id_num">
          <input className={inputClass} value={idNum} onChange={(e) => setIdNum(e.target.value)} />
        </Field>
        <Field label="transaction_id" hint="Leave blank to auto-generate a UUIDv4">
          <input
            className={inputClass}
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="auto"
          />
        </Field>
        <Field label="sp_service_id override (optional)">
          <input
            className={inputClass}
            value={spServiceIdOverride}
            onChange={(e) => setSpServiceIdOverride(e.target.value)}
          />
        </Field>
        <button type="button" className={buttonClass} onClick={submit} disabled={loading}>
          {loading ? "Checking…" : "Check device status"}
        </button>
      </Card>

      {result && <ProxyResultView result={result} />}
    </div>
  );
}
