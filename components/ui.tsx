"use client";

import { useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n/LocaleProvider";

export const inputClass =
  "w-full rounded-md border border-black/15 dark:border-white/20 bg-white dark:bg-white/[.04] px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50";

export const selectClass = inputClass;

export const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none transition-colors";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-md border border-black/15 dark:border-white/20 px-3.5 py-1.5 text-sm font-medium hover:bg-black/[.03] dark:hover:bg-white/[.06] disabled:opacity-50 disabled:pointer-events-none transition-colors";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="block text-sm font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs opacity-60">{hint}</span>}
    </label>
  );
}

export function Card({ title, subtitle, children }: { title?: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/[.03] p-4 space-y-3">
      {title && (
        <div>
          <h2 className="text-sm font-semibold tracking-wide uppercase opacity-70">{title}</h2>
          {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function StatusBadge({
  ok,
  trueLabel = "verified",
  falseLabel = "failed",
  unknownLabel = "n/a",
}: {
  ok: boolean | undefined;
  trueLabel?: string;
  falseLabel?: string;
  unknownLabel?: string;
}) {
  if (ok === undefined) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs bg-black/10 dark:bg-white/10">
        {unknownLabel}
      </span>
    );
  }
  const cls = ok
    ? "bg-green-600/15 text-green-700 dark:text-green-400"
    : "bg-red-600/15 text-red-700 dark:text-red-400";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {ok ? `✓ ${trueLabel}` : `✕ ${falseLabel}`}
    </span>
  );
}

export function JsonBlock({ value, label }: { value: unknown; label?: string }) {
  const [copied, setCopied] = useState(false);
  const t = useT();
  const text = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return (
    <div className="rounded-md border border-black/10 dark:border-white/10 bg-black/[.03] dark:bg-black/20 overflow-hidden">
      {(label || text) && (
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-black/10 dark:border-white/10">
          <span className="text-xs font-medium opacity-70">{label}</span>
          <button
            type="button"
            className="text-xs underline opacity-70 hover:opacity-100"
            onClick={() => {
              navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 1200);
            }}
          >
            {copied ? t("ui.copied") : t("ui.copy")}
          </button>
        </div>
      )}
      <pre className="p-3 text-xs overflow-x-auto whitespace-pre-wrap break-all max-h-96">{text}</pre>
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400">
      {message}
    </div>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="inline-flex rounded-md border border-black/15 dark:border-white/20 p-0.5 gap-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
            value === opt.value
              ? "bg-blue-600 text-white"
              : "hover:bg-black/[.05] dark:hover:bg-white/[.08] opacity-80"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
