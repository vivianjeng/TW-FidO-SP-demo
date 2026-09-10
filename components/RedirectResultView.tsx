"use client";

import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { StoredCallback } from "@/lib/moica/callbackStore";

export function RedirectResultView({
  tx,
  nosid,
  entry,
}: {
  tx?: string;
  nosid?: string;
  entry?: StoredCallback;
}) {
  const t = useT();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("redirectResult.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("redirectResult.subtitle")}</p>
      </div>

      {nosid === "1" && (
        <Card>
          <p className="text-sm text-amber-700 dark:text-amber-400">{t("redirectResult.noSidWarning")}</p>
        </Card>
      )}

      {!tx && (
        <Card>
          <p className="text-sm opacity-70">
            {t("redirectResult.noTxPrefix")}{" "}
            <Link href="/redirect" className="underline">
              /redirect
            </Link>{" "}
            {t("redirectResult.noTxSuffix")}
          </p>
        </Card>
      )}

      {tx && !entry && (
        <Card>
          <p className="text-sm opacity-70">{t("redirectResult.noEntry", { tx })}</p>
        </Card>
      )}

      {entry && (
        <>
          <Card title={t("redirectResult.verificationCard")}>
            <StatusBadge
              ok={entry.idpChecksumValid}
              trueLabel={t("redirectResult.checksumVerified")}
              falseLabel={t("redirectResult.checksumFailed")}
            />
            <p className="text-xs opacity-60 mt-2">
              {t("redirectResult.received", { time: new Date(entry.receivedAt).toLocaleString() })}
            </p>
          </Card>
          <Card title={t("redirectResult.fieldsCard")}>
            <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="opacity-60">transaction_id</dt>
              <dd className="font-mono break-all">{entry.callback.transaction_id}</dd>
              <dt className="opacity-60">error_code</dt>
              <dd className="font-mono">{entry.callback.error_code}</dd>
              <dt className="opacity-60">id_num</dt>
              <dd className="font-mono">{entry.callback.id_num}</dd>
              <dt className="opacity-60">signed_response</dt>
              <dd className="font-mono break-all">{entry.callback.signed_response}</dd>
              {entry.callback.cert && (
                <>
                  <dt className="opacity-60">cert</dt>
                  <dd className="font-mono break-all">{entry.callback.cert}</dd>
                </>
              )}
              <dt className="opacity-60">idp_checksum</dt>
              <dd className="font-mono break-all">{entry.callback.idp_checksum}</dd>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
