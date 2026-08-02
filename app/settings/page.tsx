"use client";

import { useEffect, useState } from "react";
import { getJson, postJson } from "@/lib/apiClient";
import { buttonClass, Card, ErrorBanner, Field, inputClass, secondaryButtonClass, selectClass, StatusBadge } from "@/components/ui";
import type { Environment, EnvironmentHosts } from "@/lib/moica/types";

const KEEP_EXISTING_KEY = "__KEEP_EXISTING__";

interface ConfigView {
  environment: Environment;
  customFidoweb: string;
  customFidoapi: string;
  spServiceId: string;
  aesKeyMasked: string;
  aesKeyConfigured: boolean;
  spCallbackUrl: string;
  hosts: EnvironmentHosts;
  configured: boolean;
  sessionId?: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<ConfigView | null>(null);

  const [environment, setEnvironment] = useState<Environment>("uat");
  const [customFidoweb, setCustomFidoweb] = useState("");
  const [customFidoapi, setCustomFidoapi] = useState("");
  const [spServiceId, setSpServiceId] = useState("");
  const [aesKeyInput, setAesKeyInput] = useState("");
  const [aesKeyTouched, setAesKeyTouched] = useState(false);
  const [spCallbackUrl, setSpCallbackUrl] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getJson<ConfigView>("/api/config");
        setView(data);
        setEnvironment(data.environment);
        setCustomFidoweb(data.customFidoweb);
        setCustomFidoapi(data.customFidoapi);
        setSpServiceId(data.spServiceId);
        setSpCallbackUrl(data.spCallbackUrl);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const suggestedCallback = () => {
    if (typeof window === "undefined") return "";
    const base = `${window.location.origin}/api/callback`;
    return view?.sessionId ? `${base}?sid=${view.sessionId}` : base;
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = await postJson<ConfigView>("/api/config", {
        environment,
        customFidoweb,
        customFidoapi,
        spServiceId,
        aesKeyBase64: aesKeyTouched ? aesKeyInput : KEEP_EXISTING_KEY,
        spCallbackUrl,
      });
      setView(data);
      setAesKeyInput("");
      setAesKeyTouched(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-sm opacity-60">Loading…</p>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm opacity-70 mt-1">
          These credentials come from MOI&apos;s SP onboarding process. They&apos;re stored server-side for this
          browser session only (in-memory — a server restart clears them) and are never sent to client-side
          JavaScript; only computed checksums/tickets are.
        </p>
      </div>

      <ErrorBanner message={error} />

      <Card>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Status:</span>
          <StatusBadge ok={view?.configured} trueLabel="configured" falseLabel="not configured" />
          {view?.sessionId && (
            <span className="text-xs opacity-60">
              session: <code>{view.sessionId}</code>
            </span>
          )}
        </div>
      </Card>

      <Card title="Environment">
        <Field label="Target environment">
          <select
            className={selectClass}
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as Environment)}
          >
            <option value="uat">UAT — fido-test.moi.gov.tw / fidoapi-test.moi.gov.tw</option>
            <option value="prod">Production — fido.moi.gov.tw / fidoapi.moi.gov.tw</option>
            <option value="custom">Custom hosts</option>
          </select>
        </Field>
        {environment === "custom" && (
          <div className="grid grid-cols-2 gap-3">
            <Field label="{fidoweb} host">
              <input
                className={inputClass}
                value={customFidoweb}
                onChange={(e) => setCustomFidoweb(e.target.value)}
                placeholder="fido-test.moi.gov.tw"
              />
            </Field>
            <Field label="{fidoapi} host">
              <input
                className={inputClass}
                value={customFidoapi}
                onChange={(e) => setCustomFidoapi(e.target.value)}
                placeholder="fidoapi-test.moi.gov.tw"
              />
            </Field>
          </div>
        )}
        {environment !== "custom" && view && (
          <p className="text-xs opacity-60">
            Resolved: <code>{view.hosts.fidoweb}</code> / <code>{view.hosts.fidoapi}</code>
          </p>
        )}
      </Card>

      <Card title="SP credentials">
        <Field label="sp_service_id">
          <input
            className={inputClass}
            value={spServiceId}
            onChange={(e) => setSpServiceId(e.target.value)}
            placeholder="7b2c7f94-9f7b-481a-89a8-56b883dea695"
          />
        </Field>
        <Field
          label="AES key (base64, must decode to 32 bytes / AES-256)"
          hint={
            view?.aesKeyConfigured
              ? `Currently set (${view.aesKeyMasked}). Leave blank to keep it, or type a new key to replace it.`
              : "Not set yet."
          }
        >
          <input
            type="password"
            autoComplete="off"
            className={inputClass}
            value={aesKeyInput}
            onChange={(e) => {
              setAesKeyInput(e.target.value);
              setAesKeyTouched(true);
            }}
            placeholder={view?.aesKeyConfigured ? "•••• leave blank to keep existing key" : "base64 AES-256 key"}
          />
        </Field>
      </Card>

      <Card title="SP Callback URL" subtitle="Only needed for SP-API-WEB-01 (/redirect) — MOICA POSTs the result here.">
        <Field
          label="sp_callback_url"
          hint="Must be a publicly reachable HTTPS URL. Use this app's own /api/callback if this deployment is publicly reachable; otherwise the WEB-01 flow can be inspected up to the redirect but the callback won't arrive."
        >
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={spCallbackUrl}
              onChange={(e) => setSpCallbackUrl(e.target.value)}
              placeholder="https://your-deployment.example.com/api/callback?sid=..."
            />
            <button
              type="button"
              className={secondaryButtonClass}
              onClick={() => setSpCallbackUrl(suggestedCallback())}
            >
              Use this app&apos;s URL
            </button>
          </div>
        </Field>
      </Card>

      <button type="button" className={buttonClass} onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save settings"}
      </button>
    </div>
  );
}
