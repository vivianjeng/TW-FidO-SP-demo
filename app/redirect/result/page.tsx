import Link from "next/link";
import { getCallbackResult } from "@/lib/moica/callbackStore";
import { Card, StatusBadge } from "@/components/ui";

export default async function RedirectResultPage({
  searchParams,
}: {
  searchParams: Promise<{ tx?: string; nosid?: string }>;
}) {
  const { tx, nosid } = await searchParams;
  const entry = tx ? getCallbackResult(tx) : undefined;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">SP-API-WEB-01 callback result</h1>
        <p className="text-sm opacity-70 mt-1">
          What MOICA POSTed to this app&apos;s /api/callback (the SP Callback URL) after the redirect flow
          completed.
        </p>
      </div>

      {nosid === "1" && (
        <Card>
          <p className="text-sm text-amber-700 dark:text-amber-400">
            The callback arrived without a <code>?sid=</code> query param, so this app couldn&apos;t look up which
            session&apos;s AES key to verify idp_checksum against. Use the &quot;Use this app&apos;s URL&quot;
            button on Settings to get a callback URL with the correlation id included.
          </p>
        </Card>
      )}

      {!tx && (
        <Card>
          <p className="text-sm opacity-70">
            No transaction id in the URL. Trigger a redirect from <Link href="/redirect" className="underline">/redirect</Link>{" "}
            first.
          </p>
        </Card>
      )}

      {tx && !entry && (
        <Card>
          <p className="text-sm opacity-70">
            No callback recorded yet for transaction <code>{tx}</code>. If you just submitted the redirect form,
            MOICA hasn&apos;t POSTed back here yet — reload this page once it does. If nothing ever arrives, this
            deployment&apos;s <code>sp_callback_url</code> likely isn&apos;t publicly reachable from MOICA&apos;s
            servers (see SPEC.md §3/§9).
          </p>
        </Card>
      )}

      {entry && (
        <>
          <Card title="Verification">
            <StatusBadge ok={entry.idpChecksumValid} trueLabel="idp_checksum verified" falseLabel="idp_checksum failed" />
            <p className="text-xs opacity-60 mt-2">Received {new Date(entry.receivedAt).toLocaleString()}</p>
          </Card>
          <Card title="Callback fields">
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
