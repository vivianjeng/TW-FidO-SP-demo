"use client";

import { useState } from "react";
import { getJson } from "@/lib/apiClient";
import { secondaryButtonClass, StatusBadge } from "@/components/ui";
import { useT } from "@/lib/i18n/LocaleProvider";

interface ReachabilityResponse {
  checked: boolean;
  reachable?: boolean;
  status?: number;
  error?: string;
  durationMs?: number;
  url?: string;
}

export function ReachabilityCheck() {
  const t = useT();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ReachabilityResponse | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const res = await getJson<ReachabilityResponse>("/api/reachability");
      setResult(res);
    } catch (err) {
      setResult({ checked: true, reachable: false, error: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <button type="button" className={secondaryButtonClass} onClick={run} disabled={loading}>
        {loading ? t("reachability.checking") : t("reachability.checkButton")}
      </button>
      {result?.checked && (
        <div className="text-sm flex flex-wrap items-center gap-2">
          <StatusBadge ok={result.reachable} trueLabel={t("reachability.reachable")} falseLabel={t("reachability.unreachable")} />
          <span className="opacity-70 break-all">
            {result.url} {result.status !== undefined && `→ HTTP ${result.status}`} {result.error}
            {result.durationMs !== undefined && ` (${result.durationMs}ms)`}
          </span>
        </div>
      )}
      {result?.checked && result.reachable === false && (
        <p className="text-xs opacity-60">{t("reachability.expectedNote")}</p>
      )}
    </div>
  );
}
