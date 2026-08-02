import Link from "next/link";
import { getSessionConfig, resolveHosts, isConfigComplete } from "@/lib/moica/config";
import { Card, StatusBadge } from "@/components/ui";
import { ReachabilityCheck } from "@/components/ReachabilityCheck";

const flows = [
  {
    href: "/redirect",
    id: "SP-API-WEB-01",
    title: "網頁轉導模式介面 · Web Redirect",
    description: "Build the hidden auto-submit form to fidoRedirect/web and inspect the callback MOICA POSTs back.",
  },
  {
    href: "/ticket",
    id: "SP-API-ATH-01",
    title: "請求 SP ticket · getSpTicket",
    description: "I-SCAN (QR), APP2APP, and MWEB2APP ticket issuance for ATH / SIGN / NFCSIGN.",
  },
  {
    href: "/push",
    id: "SP-API-ATH-03",
    title: "請求認證/簽章推播 · Push",
    description: "Push an auth/sign request straight to the user's bound device(s).",
  },
  {
    href: "/batch",
    id: "SP-API-ATH-04",
    title: "請求連續簽章 SP ticket · Batch",
    description: "BATSIGN continuous signing across up to 20 documents in one ticket.",
  },
  {
    href: "/result",
    id: "SP-API-ATH-02",
    title: "查詢認證/簽章結果 · Poll Result",
    description: "Poll a sp_ticket (≥4s recommended interval) for its auth/sign outcome.",
  },
  {
    href: "/device-status",
    id: "SP-API-LF-01",
    title: "確認使用者裝置綁定狀態 · Device Status",
    description: "Check whether an id_num has a bound FIDO device / usable certificate.",
  },
  {
    href: "/app-link",
    id: "APP-API-01",
    title: "認證/簽章功能 · App Deep Link",
    description: "Build & decode mobilemoica://…/verifySign links independent of how the ticket was issued.",
  },
];

export default async function DashboardPage() {
  const config = await getSessionConfig();
  const hosts = resolveHosts(config);
  const configured = isConfigComplete(config);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">TW FidO SP Demo</h1>
        <p className="text-sm opacity-70 max-w-3xl">
          A Service-Provider-side sandbox for Taiwan&apos;s 行動自然人憑證 (Mobile Citizen Digital Certificate) API.
          Every page here calls the real MOICA backend with your own <code>sp_service_id</code> / AES key — nothing
          is simulated. See <code>SPEC.md</code> for the full write-up.
        </p>
      </div>

      <Card title="Environment status">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge ok={configured} trueLabel="configured" falseLabel="not configured" />
          <span>
            environment: <b>{config.environment}</b>
          </span>
          <span className="opacity-70">
            fidoweb: <code>{hosts.fidoweb || "—"}</code> · fidoapi: <code>{hosts.fidoapi || "—"}</code>
          </span>
          {!configured && (
            <Link href="/settings" className="text-blue-600 dark:text-blue-400 underline">
              Go to Settings →
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
            <div className="font-medium mt-0.5">{flow.title}</div>
            <p className="text-sm opacity-70 mt-1">{flow.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
