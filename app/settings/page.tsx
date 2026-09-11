"use client";

import { useEffect, useState } from "react";
import { getJson, postJson } from "@/lib/apiClient";
import { buttonClass, Card, ErrorBanner, Field, inputClass, secondaryButtonClass, selectClass, StatusBadge } from "@/components/ui";
import { useT } from "@/lib/i18n/LocaleProvider";
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
  const t = useT();
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

  if (loading) return <p className="text-sm opacity-60">{t("common.loading")}</p>;

  return (
    <div className="max-w-2xl space-y-6 mx-auto">
      <div>
        <h1 className="text-2xl font-semibold">{t("settings.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("settings.subtitle")}</p>
      </div>

      <ErrorBanner message={error} />

      <Card>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{t("common.status")}</span>
          <StatusBadge ok={view?.configured} trueLabel={t("common.configured")} falseLabel={t("common.notConfigured")} />
          {view?.sessionId && (
            <span className="text-xs opacity-60">
              {t("common.session")} <code>{view.sessionId}</code>
            </span>
          )}
        </div>
      </Card>

      <Card title={t("settings.envCard")}>
        <Field label={t("settings.targetEnv")}>
          <select
            className={selectClass}
            value={environment}
            onChange={(e) => setEnvironment(e.target.value as Environment)}
          >
            <option value="uat">{t("settings.envUat")}</option>
            <option value="prod">{t("settings.envProd")}</option>
            <option value="custom">{t("settings.envCustom")}</option>
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
            {t("settings.resolved")} <code>{view.hosts.fidoweb}</code> / <code>{view.hosts.fidoapi}</code>
          </p>
        )}
      </Card>

      <Card title={t("settings.spCredCard")}>
        <Field label="sp_service_id">
          <input
            className={inputClass}
            value={spServiceId}
            onChange={(e) => setSpServiceId(e.target.value)}
            placeholder="7b2c7f94-9f7b-481a-89a8-56b883dea695"
          />
        </Field>
        <Field
          label={t("settings.aesKeyLabel")}
          hint={
            view?.aesKeyConfigured
              ? t("settings.aesKeyCurrentlySet", { key: view.aesKeyMasked })
              : t("settings.aesKeyNotSet")
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
            placeholder={view?.aesKeyConfigured ? t("settings.aesKeyPlaceholderKeep") : t("settings.aesKeyPlaceholderNew")}
          />
        </Field>
      </Card>

      <Card title={t("settings.callbackCard")} subtitle={t("settings.callbackCardSubtitle")}>
        <Field label="sp_callback_url" hint={t("settings.callbackHint")}>
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
              {t("settings.useAppUrl")}
            </button>
          </div>
        </Field>
      </Card>

      <button type="button" className={buttonClass} onClick={save} disabled={saving}>
        {saving ? t("settings.saving") : t("settings.save")}
      </button>
    </div>
  );
}
