"use client";

import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui";
import { ReachabilityCheck } from "@/components/ReachabilityCheck";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { TKey } from "@/lib/i18n/translations";
import type { Environment, EnvironmentHosts } from "@/lib/moica/types";

const flows: Array<{ href: string; id: string; titleKey: TKey; descKey: TKey }> = [
  { href: "/redirect", id: "SP-API-WEB-01", titleKey: "home.flow.web01.title", descKey: "home.flow.web01.desc" },
  { href: "/ticket", id: "SP-API-ATH-01", titleKey: "home.flow.ath01.title", descKey: "home.flow.ath01.desc" },
  { href: "/push", id: "SP-API-ATH-03", titleKey: "home.flow.ath03.title", descKey: "home.flow.ath03.desc" },
  { href: "/batch", id: "SP-API-ATH-04", titleKey: "home.flow.ath04.title", descKey: "home.flow.ath04.desc" },
  { href: "/result", id: "SP-API-ATH-02", titleKey: "home.flow.ath02.title", descKey: "home.flow.ath02.desc" },
  { href: "/device-status", id: "SP-API-LF-01", titleKey: "home.flow.lf01.title", descKey: "home.flow.lf01.desc" },
  { href: "/app-link", id: "APP-API-01", titleKey: "home.flow.applink.title", descKey: "home.flow.applink.desc" },
];

export function DashboardView({
  environment,
  hosts,
  configured,
}: {
  environment: Environment;
  hosts: EnvironmentHosts;
  configured: boolean;
}) {
  const t = useT();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">{t("home.title")}</h1>
        <p className="text-sm opacity-70 max-w-3xl">{t("home.subtitle")}</p>
      </div>

      <Card title={t("home.envStatus")}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge ok={configured} trueLabel={t("common.configured")} falseLabel={t("common.notConfigured")} />
          <span>
            {t("home.environment")} <b>{environment}</b>
          </span>
          <span className="opacity-70">
            fidoweb: <code>{hosts.fidoweb || "—"}</code> · fidoapi: <code>{hosts.fidoapi || "—"}</code>
          </span>
          {!configured && (
            <Link href="/settings" className="text-blue-600 dark:text-blue-400 underline">
              {t("home.goToSettings")}
            </Link>
          )}
        </div>
        <ReachabilityCheck />
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        {flows.map((flow) => (
          <Link
            key={flow.href}
            href={flow.href}
            className="block rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[.03] p-4 hover:border-blue-500/50 hover:shadow-sm transition-all"
          >
            <div className="text-xs font-mono opacity-60">{flow.id}</div>
            <div className="font-medium mt-0.5">{t(flow.titleKey)}</div>
            <p className="text-sm opacity-70 mt-1">{t(flow.descKey)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
