"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useT } from "@/lib/i18n/LocaleProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { TKey } from "@/lib/i18n/translations";

const links: Array<{ href: string; labelKey: TKey; apiId?: string }> = [
  { href: "/", labelKey: "nav.dashboard" },
  { href: "/settings", labelKey: "nav.settings" },
  { href: "/redirect", labelKey: "nav.webRedirect", apiId: "SP-API-WEB-01" },
  { href: "/ticket", labelKey: "nav.ticket", apiId: "SP-API-ATH-01" },
  { href: "/push", labelKey: "nav.push", apiId: "SP-API-ATH-03" },
  { href: "/batch", labelKey: "nav.batch", apiId: "SP-API-ATH-04" },
  { href: "/result", labelKey: "nav.result", apiId: "SP-API-ATH-02" },
  { href: "/device-status", labelKey: "nav.deviceStatus", apiId: "SP-API-LF-01" },
  { href: "/app-link", labelKey: "nav.appLink", apiId: "APP-API-01" },
  { href: "/reference", labelKey: "nav.reference" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 rounded-md";

export function Nav() {
  const pathname = usePathname();
  const t = useT();
  const { locale, setLocale } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes (link click, back/forward, etc.).
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-4 py-2.5">
          <Link href="/" className={`font-semibold tracking-tight whitespace-nowrap ${focusRing}`}>
            {t("nav.brand")}
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="https://github.com/vivianjeng/TW-FidO-SP-demo"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              title="GitHub"
              className={`inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/15 dark:border-white/20 hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors ${focusRing}`}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.09 3.29 9.4 7.86 10.93.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.75.11 3.04.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.79-.01 3.17 0 .3.21.66.79.55A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
              </svg>
            </a>
            <button
              type="button"
              onClick={() => setLocale(locale === "en" ? "zh" : "en")}
              className={`inline-flex h-8 items-center justify-center rounded-md border border-black/15 dark:border-white/20 px-2.5 text-xs font-medium hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors ${focusRing}`}
            >
              {t("nav.localeToggleLabel")}
            </button>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
              aria-expanded={menuOpen}
              className={`lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/15 dark:border-white/20 hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors ${focusRing}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        <nav className="hidden lg:flex flex-wrap gap-x-5 gap-y-1.5 text-sm border-t border-black/5 dark:border-white/5 py-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              title={link.apiId}
              className={
                `${focusRing} ` +
                (isActive(pathname, link.href)
                  ? "font-semibold text-blue-600 dark:text-blue-400"
                  : "opacity-70 hover:opacity-100 transition-opacity")
              }
            >
              {t(link.labelKey)}
            </Link>
          ))}
        </nav>

        {menuOpen && (
          <nav className="lg:hidden flex flex-col gap-0.5 pb-3 text-sm">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                title={link.apiId}
                className={
                  `rounded-md px-2.5 py-1.5 ${focusRing} ` +
                  (isActive(pathname, link.href)
                    ? "font-semibold text-blue-600 dark:text-blue-400 bg-blue-600/10"
                    : "opacity-80 hover:opacity-100 hover:bg-black/[.03] dark:hover:bg-white/[.06]")
                }
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
