"use client";

import { useTheme } from "@/lib/theme/ThemeProvider";
import { useT } from "@/lib/i18n/LocaleProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const t = useT();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t("nav.themeToDark") : t("nav.themeToLight")}
      title={isDark ? t("nav.themeToDark") : t("nav.themeToLight")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-black/15 dark:border-white/20 hover:bg-black/[.03] dark:hover:bg-white/[.06] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}
