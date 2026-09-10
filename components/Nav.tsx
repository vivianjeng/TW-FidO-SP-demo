"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/LocaleProvider";
import type { TKey } from "@/lib/i18n/translations";

const links: Array<{ href: string; labelKey: TKey }> = [
  { href: "/", labelKey: "nav.dashboard" },
  { href: "/settings", labelKey: "nav.settings" },
  { href: "/redirect", labelKey: "nav.webRedirect" },
  { href: "/ticket", labelKey: "nav.ticket" },
  { href: "/push", labelKey: "nav.push" },
  { href: "/batch", labelKey: "nav.batch" },
  { href: "/result", labelKey: "nav.result" },
  { href: "/device-status", labelKey: "nav.deviceStatus" },
  { href: "/app-link", labelKey: "nav.appLink" },
  { href: "/reference", labelKey: "nav.reference" },
];

export function Nav() {
  const pathname = usePathname();
  const t = useT();
  const { locale, setLocale } = useLocale();

  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="font-semibold tracking-tight whitespace-nowrap">
          {t("nav.brand")}
        </Link>
        <nav className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {links.map((link) => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "font-semibold text-blue-600 dark:text-blue-400" : "opacity-70 hover:opacity-100"}
              >
                {t(link.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="https://github.com/vivianjeng/TW-FidO-SP-demo"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-md border border-black/15 dark:border-white/20 px-2.5 py-1 text-xs font-medium hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors"
          >
            GitHub
          </a>
          <button
            type="button"
            onClick={() => setLocale(locale === "en" ? "zh" : "en")}
            className="rounded-md border border-black/15 dark:border-white/20 px-2.5 py-1 text-xs font-medium hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors"
          >
            {t("nav.localeToggleLabel")}
          </button>
        </div>
      </div>
    </header>
  );
}
