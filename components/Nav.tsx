"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/settings", label: "Settings" },
  { href: "/redirect", label: "WEB-01 Redirect" },
  { href: "/ticket", label: "ATH-01 Ticket" },
  { href: "/push", label: "ATH-03 Push" },
  { href: "/batch", label: "ATH-04 Batch" },
  { href: "/result", label: "ATH-02 Result" },
  { href: "/device-status", label: "LF-01 Device" },
  { href: "/app-link", label: "APP-API-01 Link" },
  { href: "/reference", label: "Reference" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2">
        <Link href="/" className="font-semibold tracking-tight whitespace-nowrap">
          TW FidO SP Demo
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
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
