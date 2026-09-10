"use client";

import { useEffect, useRef, useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buttonClass, Card, ErrorBanner, Field, inputClass, secondaryButtonClass } from "@/components/ui";
import { ProxyResultView } from "@/components/ProxyResultView";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { GetAthOrSignResultResponse, ProxyResult } from "@/lib/moica/types";

const POLL_INTERVAL_MS = 4000; // Spec: "建議每次查詢認證/簽章結果間隔時間4 秒"

export default function ResultPage() {
  const t = useT();
  const [spTicket, setSpTicket] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [spTicketId, setSpTicketId] = useState("");
  const [spServiceIdOverride, setSpServiceIdOverride] = useState("");

  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [pollCount, setPollCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ProxyResult<GetAthOrSignResultResponse> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const queryOnce = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await postJson<ProxyResult<GetAthOrSignResultResponse>>("/api/ath02", {
        sp_ticket: spTicket || undefined,
        transaction_id: spTicket ? undefined : transactionId || undefined,
        sp_ticket_id: spTicket ? undefined : spTicketId || undefined,
        sp_service_id_override: spServiceIdOverride || undefined,
      });
      setResult(res);
      setPollCount((c) => c + 1);
      return res;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (intervalRef.current) return;
    setPolling(true);
    queryOnce();
    intervalRef.current = setInterval(queryOnce, POLL_INTERVAL_MS);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setPolling(false);
  };

  useEffect(() => () => stopPolling(), []);

  const signedSet = result?.response?.result?.signed_response_set;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("result.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("result.subtitle")}</p>
      </div>

      <ErrorBanner message={error} />

      <Card title={t("result.ticketCard")}>
        <Field label="sp_ticket" hint={t("result.spTicketHint")}>
          <textarea
            className={`${inputClass} font-mono min-h-20`}
            value={spTicket}
            onChange={(e) => setSpTicket(e.target.value)}
            placeholder="eyJ0cmFuc2FjdGlvbl9pZCI6...  .  ...digest"
          />
        </Field>
        <p className="text-xs opacity-60">{t("result.orIfKnown")}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="transaction_id">
            <input className={inputClass} value={transactionId} onChange={(e) => setTransactionId(e.target.value)} disabled={!!spTicket} />
          </Field>
          <Field label="sp_ticket_id">
            <input className={inputClass} value={spTicketId} onChange={(e) => setSpTicketId(e.target.value)} disabled={!!spTicket} />
          </Field>
        </div>
        <Field label={`sp_service_id override (${t("common.optional")})`}>
          <input className={inputClass} value={spServiceIdOverride} onChange={(e) => setSpServiceIdOverride(e.target.value)} />
        </Field>

        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className={buttonClass} onClick={queryOnce} disabled={loading || polling}>
            {loading && !polling ? t("result.querying") : t("result.queryOnce")}
          </button>
          {!polling ? (
            <button type="button" className={secondaryButtonClass} onClick={startPolling}>
              {t("result.startPolling", { seconds: POLL_INTERVAL_MS / 1000 })}
            </button>
          ) : (
            <button type="button" className={secondaryButtonClass} onClick={stopPolling}>
              {t("result.stopPolling")}
            </button>
          )}
          {pollCount > 0 && (
            <span className="text-xs opacity-60">
              {t(pollCount === 1 ? "result.queriesSentOne" : "result.queriesSentMany", { count: pollCount })}
            </span>
          )}
        </div>
      </Card>

      {result && (
        <>
          <ProxyResultView result={result} />
          {signedSet && (
            <Card title={t("result.signedSetCard")}>
              <ol className="list-decimal list-inside space-y-1 text-xs font-mono break-all">
                {signedSet.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
