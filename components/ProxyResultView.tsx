"use client";

import { Card, JsonBlock, StatusBadge } from "@/components/ui";
import { ERROR_CODE_REFERENCE } from "@/lib/moica/types";
import type { MoicaErrorEnvelope, ProxyResult } from "@/lib/moica/types";

export function ProxyResultView<T extends MoicaErrorEnvelope>({ result }: { result: ProxyResult<T> }) {
  const errorCode = result.response?.error_code;
  const isBusinessError = errorCode !== undefined && errorCode !== "0";
  const reference = isBusinessError
    ? ERROR_CODE_REFERENCE.find((e) => errorCode?.toUpperCase().includes(e.code.toUpperCase()))
    : undefined;

  return (
    <div className="space-y-4">
      <Card title="Network">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge ok={result.network.ok} trueLabel="connected" falseLabel="failed" />
          <span className="opacity-70">
            {result.request.url}
            {result.network.status !== undefined && ` → HTTP ${result.network.status}`}
            {result.network.durationMs !== undefined && ` (${result.network.durationMs}ms)`}
          </span>
        </div>
        {result.network.error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {result.network.error} — expected outside Taiwan / without IP allow-listing per Spec §貳.三; see
            SPEC.md §3.
          </p>
        )}
      </Card>

      <Card title="sp_checksum (SP → IdP)">
        <JsonBlock label="payload string that was hashed" value={result.spChecksumPayload} />
        <JsonBlock label="sp_checksum (hex)" value={result.spChecksum} />
      </Card>

      <Card title="Request body sent">
        <JsonBlock value={result.request.body} />
      </Card>

      {result.response && (
        <Card title="Response body">
          <div className="flex items-center gap-2 text-sm mb-2">
            <StatusBadge ok={!isBusinessError} trueLabel="error_code = 0" falseLabel={`error_code = ${errorCode}`} />
          </div>
          {reference && (
            <p className="text-xs text-amber-700 dark:text-amber-400 mb-2">
              {reference.description} — {reference.advice}
            </p>
          )}
          <JsonBlock value={result.response} />
        </Card>
      )}

      {result.idpChecksumValid !== undefined && (
        <Card title="idp_checksum (IdP → SP) verification">
          <StatusBadge ok={result.idpChecksumValid} trueLabel="verified" falseLabel="verification failed" />
          {result.idpChecksumPayload && (
            <JsonBlock label="payload string that should hash to idp_checksum" value={result.idpChecksumPayload} />
          )}
        </Card>
      )}

      {result.decodedSpTicket && (
        <Card title="Decoded sp_ticket">
          <StatusBadge
            ok={result.decodedSpTicket.digestValid}
            trueLabel="digest matches"
            falseLabel="digest mismatch"
          />
          <JsonBlock value={result.decodedSpTicket.payload} />
        </Card>
      )}
    </div>
  );
}
