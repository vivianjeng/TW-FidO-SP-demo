"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export function QrCode({ value, size = 220 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value, { width: size, margin: 1 })
      .then((url) => {
        if (cancelled) return;
        setDataUrl(url);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setDataUrl(null);
        setError(err instanceof Error ? err.message : String(err));
      });
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (error) return <p className="text-xs text-red-600 dark:text-red-400">Could not render QR: {error}</p>;
  if (!dataUrl) return <div style={{ width: size, height: size }} className="animate-pulse bg-black/10 dark:bg-white/10 rounded" />;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={dataUrl} alt="QR code" width={size} height={size} className="rounded border border-black/10 dark:border-white/10 bg-white p-2" />;
}
