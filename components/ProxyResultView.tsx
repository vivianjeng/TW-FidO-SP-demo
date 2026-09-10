"use client";

import { Card, JsonBlock, StatusBadge } from "@/components/ui";
import { useT } from "@/lib/i18n/LocaleProvider";
import { ERROR_CODE_REFERENCE } from "@/lib/moica/types";
import type { MoicaErrorEnvelope, ProxyResult } from "@/lib/moica/types";

export function ProxyResultView<T extends MoicaErrorEnvelope>({ result }: { result: ProxyResult<T> }) {
  const t = useT();
  const errorCode = result.response?.error_code;
  const isBusinessError = errorCode !== undefined && errorCode !== "0";
  const reference = isBusinessError
    ? ERROR_CODE_REFERENCE.find((e) => errorCode?.toUpperCase().includes(e.code.toUpperCase()))
    : undefined;

  return (
    <div className="space-y-4">
      <Card title={t("proxyResult.networkCard")}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge ok={result.network.ok} trueLabel={t("proxyResult.connected")} falseLabel={t("proxyResult.connectionFailed")} />
          <span className="opacity-70">
            {result.request.url}
            {result.network.status !== undefined && ` → HTTP ${result.network.status}`}
            {result.network.durationMs !== undefined && ` (${result.network.durationMs}ms)`}
          </span>
        </div>
        {result.network.error && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
            {t("proxyResult.networkErrorNote", { error: result.network.error })}
          </p>
        )}
      </Card>

      <Card title={t("proxyResult.spChecksumCard")}>
        <JsonBlock label={t("proxyResult.payloadHashedLabel")} value={result.spChecksumPayload} />
        <JsonBlock label={t("proxyResult.spChecksumHexLabel")} value={result.spChecksum} />
      </Card>

      <Card title={t("proxyResult.requestBodyCard")}>
        <JsonBlock value={result.request.body} />
      </Card>

      {result.response && (
        <Card title={t("proxyResult.responseBodyCard")}>
          <div className="flex items-center gap-2 text-sm mb-2">
            <StatusBadge
              ok={!isBusinessError}
              trueLabel={t("proxyResult.errorCodeZero")}
              falseLabel={t("proxyResult.errorCodeNonZero", { code: errorCode ?? "" })}
            />
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
        <Card title={t("proxyResult.idpChecksumCard")}>
          <StatusBadge ok={result.idpChecksumValid} trueLabel={t("proxyResult.idpVerified")} falseLabel={t("proxyResult.idpVerificationFailed")} />
          {result.idpChecksumPayload && (
            <JsonBlock label={t("proxyResult.idpPayloadLabel")} value={result.idpChecksumPayload} />
          )}
        </Card>
      )}

      {result.decodedSpTicket && (
        <Card title={t("proxyResult.decodedTicketCard")}>
          <StatusBadge
            ok={result.decodedSpTicket.digestValid}
            trueLabel={t("proxyResult.digestMatches")}
            falseLabel={t("proxyResult.digestMismatch")}
          />
          <JsonBlock value={result.decodedSpTicket.payload} />
        </Card>
      )}
    </div>
  );
}
