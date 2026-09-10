"use client";

import { Card } from "@/components/ui";
import { useT } from "@/lib/i18n/LocaleProvider";
import { ERROR_CODE_REFERENCE } from "@/lib/moica/types";

export default function ReferencePage() {
  const t = useT();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-semibold">{t("reference.title")}</h1>
        <p className="text-sm opacity-70 mt-1">{t("reference.subtitle")}</p>
      </div>

      <Card title={t("reference.txCard")}>
        <p className="text-sm">{t("reference.txBody")}</p>
      </Card>

      <Card title={t("reference.checksumCard")}>
        <p className="text-sm">{t("reference.checksumIntro")}</p>
        <ol className="list-decimal list-inside text-sm space-y-1">
          <li>{t("reference.checksumStep1")}</li>
          <li>{t("reference.checksumStep2")}</li>
          <li>{t("reference.checksumStep3")}</li>
          <li>{t("reference.checksumStep4")}</li>
        </ol>
        <p className="text-xs opacity-60">{t("reference.checksumNote")}</p>
      </Card>

      <Card title={t("reference.spTicketCard")}>
        <p className="text-sm font-mono">{t("reference.spTicketFormula")}</p>
        <p className="text-sm">{t("reference.spTicketBody")}</p>
      </Card>

      <Card title={t("reference.interfacesCard")} subtitle={t("reference.interfacesSubtitle")}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-black/10 dark:border-white/10">
              <th className="py-1 pr-4">{t("reference.specId")}</th>
              <th className="py-1 pr-4">{t("reference.englishName")}</th>
              <th className="py-1">{t("reference.page")}</th>
            </tr>
          </thead>
          <tbody className="align-top">
            {[
              ["SP-API-WEB-01", "fidoRedirect (web)", "/redirect"],
              ["SP-API-ATH-01", "getSpTicket", "/ticket"],
              ["SP-API-ATH-02", "getAthOrSignResult", "/result"],
              ["SP-API-ATH-03", "requestAthOrSignPush", "/push"],
              ["SP-API-ATH-04", "doBatchSigning", "/batch"],
              ["SP-API-LF-01", "checkDeviceStatus", "/device-status"],
              ["APP-API-01", "verifySign (deep link)", "/app-link"],
            ].map(([id, name, href]) => (
              <tr key={id} className="border-b border-black/5 dark:border-white/5">
                <td className="py-1 pr-4 font-mono">{id}</td>
                <td className="py-1 pr-4">{name}</td>
                <td className="py-1">
                  <a href={href} className="text-blue-600 dark:text-blue-400 underline">
                    {href}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title={t("reference.errorCodesCard")} subtitle={t("reference.errorCodesSubtitle")}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left border-b border-black/10 dark:border-white/10">
                <th className="py-1 pr-3">{t("reference.colErrorCode")}</th>
                <th className="py-1 pr-3">{t("reference.colDescription")}</th>
                <th className="py-1">{t("reference.colAdvice")}</th>
              </tr>
            </thead>
            <tbody>
              {ERROR_CODE_REFERENCE.map((row) => (
                <tr key={row.code} className="border-b border-black/5 dark:border-white/5 align-top">
                  <td className="py-1 pr-3 font-mono whitespace-nowrap">{row.code}</td>
                  <td className="py-1 pr-3">{row.description}</td>
                  <td className="py-1 opacity-80">{row.advice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
