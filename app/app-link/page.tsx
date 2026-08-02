"use client";

import { useState } from "react";
import { postJson } from "@/lib/apiClient";
import { buildAppLink, type AppLinkMode } from "@/lib/moica/applink";
import { buttonClass, Card, ErrorBanner, Field, inputClass, secondaryButtonClass, SegmentedControl, StatusBadge, JsonBlock } from "@/components/ui";
import { QrCode } from "@/components/QrCode";
import type { DecodedSpTicket } from "@/lib/moica/types";

export default function AppLinkPage() {
  const [spTicket, setSpTicket] = useState("");
  const [rtnUrl, setRtnUrl] = useState(typeof window !== "undefined" ? window.location.href : "");
  const [rtnVal, setRtnVal] = useState("");
  const [mode, setMode] = useState<AppLinkMode>("w2a");

  const [decoded, setDecoded] = useState<DecodedSpTicket | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [decoding, setDecoding] = useState(false);

  const link = spTicket ? buildAppLink({ spTicket, rtnUrl, rtnVal, mode }) : null;

  const decode = async () => {
    setDecoding(true);
    setDecodeError(null);
    setDecoded(null);
    try {
      const res = await postJson<DecodedSpTicket>("/api/decode-ticket", { sp_ticket: spTicket });
      setDecoded(res);
    } catch (err) {
      setDecodeError((err as Error).message);
    } finally {
      setDecoding(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">APP-API-01 · 認證/簽章功能 (verifySign)</h1>
        <p className="text-sm opacity-70 mt-1">
          Standalone <code>mobilemoica://…/verifySign</code> deep-link builder — works with any sp_ticket, from any
          of the ticket-issuing pages, and independently decodes/verifies a ticket&apos;s digest.
        </p>
      </div>

      <ErrorBanner message={decodeError} />

      <Card title="Inputs">
        <Field label="sp_ticket">
          <textarea
            className={`${inputClass} font-mono min-h-24`}
            value={spTicket}
            onChange={(e) => setSpTicket(e.target.value)}
            placeholder="eyJ0cmFuc2FjdGlvbl9pZCI6...  .  ...digest"
          />
        </Field>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Mode</span>
          <SegmentedControl
            value={mode}
            onChange={setMode}
            options={[
              { value: "w2a", label: "Mobile Web → App (w2a)" },
              { value: "a2a", label: "App → App (a2a)" },
            ]}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="rtn_url">
            <input className={inputClass} value={rtnUrl} onChange={(e) => setRtnUrl(e.target.value)} />
          </Field>
          <Field label="rtn_val">
            <input className={inputClass} value={rtnVal} onChange={(e) => setRtnVal(e.target.value)} />
          </Field>
        </div>
        <button type="button" className={secondaryButtonClass} onClick={decode} disabled={!spTicket || decoding}>
          {decoding ? "Decoding…" : "Decode & verify ticket digest"}
        </button>
      </Card>

      {decoded && (
        <Card title="Decoded sp_ticket">
          <StatusBadge ok={decoded.digestValid} trueLabel="digest matches" falseLabel="digest mismatch" />
          <JsonBlock value={decoded.payload} />
        </Card>
      )}

      {link && (
        <Card title="Deep link">
          <div className="text-xs break-all rounded-md border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-black/20 p-2 font-mono">
            {link}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a href={link} className={buttonClass}>
              Open 行動自然人憑證 App
            </a>
            <QrCode value={link} size={180} />
          </div>
        </Card>
      )}
    </div>
  );
}
