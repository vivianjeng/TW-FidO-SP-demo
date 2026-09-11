"use client";

import Link from "next/link";
import { Card, StatusBadge } from "@/components/ui";
import { ReachabilityCheck } from "@/components/ReachabilityCheck";
import { useT } from "@/lib/i18n/LocaleProvider";
import type { TKey } from "@/lib/i18n/translations";
import type { Environment, EnvironmentHosts } from "@/lib/moica/types";

function FlowIcon({ href }: { href: string }) {
  const common = "h-4 w-4";
  switch (href) {
    case "/redirect":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M4 12h13M13 6l6 6-6 6" />
        </svg>
      );
    case "/ticket":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <rect x="3" y="7" width="18" height="10" rx="2" />
          <path d="M8 7v10M16 7v10" />
        </svg>
      );
    case "/push":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "/batch":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      );
    case "/result":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      );
    case "/device-status":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <rect x="5" y="2" width="14" height="20" rx="2" />
          <path d="M12 18h.01" />
        </svg>
      );
    case "/app-link":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={common}>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      );
    default:
      return null;
  }
}

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
            className="group flex items-start gap-3 rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[.03] p-4 hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-600/10 text-blue-600 dark:text-blue-400">
              <FlowIcon href={flow.href} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-mono opacity-60">{flow.id}</div>
              <div className="font-medium mt-0.5">{t(flow.titleKey)}</div>
              <p className="text-sm opacity-70 mt-1">{t(flow.descKey)}</p>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 mt-1 shrink-0 opacity-0 -translate-x-1 group-hover:opacity-50 group-hover:translate-x-0 transition-all"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
