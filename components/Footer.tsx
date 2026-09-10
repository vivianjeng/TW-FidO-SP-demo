"use client";

import { useT } from "@/lib/i18n/LocaleProvider";

export function Footer() {
  const t = useT();
  return (
    <footer className="border-t border-black/10 dark:border-white/10 py-4">
      <div className="max-w-6xl mx-auto px-4 text-xs opacity-60">{t("layout.footer")}</div>
    </footer>
  );
}
