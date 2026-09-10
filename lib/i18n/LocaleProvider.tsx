"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { translate, type Locale, type TKey } from "./translations";

const STORAGE_KEY = "twfido_locale";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale | null {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return v === "en" || v === "zh" ? v : null;
  } catch {
    return null;
  }
}

/**
 * Always mounts with locale="en" so server and first client render match (avoiding a
 * hydration mismatch), then swaps to the stored preference right after mount — a one-time
 * flash on load, acceptable for this demo's client-only (no cookie/SSR) locale toggle.
 */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = readStoredLocale();
    if (stored) setLocaleState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-Hant" : "en";
  }, [locale]);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // localStorage unavailable (private browsing, blocked site data, …) — locale just
      // won't persist across reloads.
    }
  };

  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

export function useT(): (key: TKey, vars?: Record<string, string | number>) => string {
  const { locale } = useLocale();
  return (key, vars) => translate(locale, key, vars);
}
