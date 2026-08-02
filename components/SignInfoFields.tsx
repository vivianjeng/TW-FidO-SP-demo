"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, inputClass, selectClass, SegmentedControl } from "@/components/ui";
import type { HashAlgorithm, SignInfo, SignType, TbsEncoding } from "@/lib/moica/types";

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

/**
 * Renders the customizable sign_type / TBS (sign_data) / tbs_encoding / hash_algorithm
 * inputs shared by /redirect, /ticket, and /push (see Spec §參.二 sign_info tables).
 * The operator types either plain UTF-8 text or already-base64 data; this component
 * derives the correct sign_data + tbs_encoding pair, auto-base64-encoding plain text
 * when sign_type=RAW since the Spec requires tbs_encoding=base64 in that case.
 */
export function SignInfoFields({ value, onChange }: { value: SignInfo; onChange: (next: SignInfo) => void }) {
  const [inputMode, setInputMode] = useState<"text" | "base64">("text");
  const [rawText, setRawText] = useState(value.sign_data ?? "DOC_DIGEST_1234567890");
  const [signType, setSignType] = useState<SignType>(value.sign_type ?? "PKCS#7");
  const [hashAlgorithm, setHashAlgorithm] = useState<HashAlgorithm>(value.hash_algorithm ?? "SHA256");

  const effective = useMemo(() => {
    const tbs_encoding: TbsEncoding = signType === "RAW" || inputMode === "base64" ? "base64" : "NONE";
    const sign_data = tbs_encoding === "base64" && inputMode === "text" ? utf8ToBase64(rawText) : rawText;
    const info: SignInfo = { sign_type: signType, sign_data, tbs_encoding };
    if (signType !== "RAW") info.hash_algorithm = hashAlgorithm;
    return info;
  }, [signType, hashAlgorithm, inputMode, rawText]);

  useEffect(() => {
    onChange(effective);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effective]);

  return (
    <div className="space-y-3">
      <Field label="sign_type">
        <select className={selectClass} value={signType} onChange={(e) => setSignType(e.target.value as SignType)}>
          <option value="PKCS#7">PKCS#7</option>
          <option value="PKCS#1">PKCS#1</option>
          <option value="RAW">RAW</option>
        </select>
      </Field>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">TBS (sign_data)</span>
        <SegmentedControl
          value={inputMode}
          onChange={setInputMode}
          options={[
            { value: "text", label: "Plain text" },
            { value: "base64", label: "Already base64" },
          ]}
        />
      </div>
      <textarea
        className={`${inputClass} font-mono min-h-24`}
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        placeholder={inputMode === "text" ? "Good Morning, I am your plaindata." : "RE9DX0RJR0VTVF8xMjM0NTY3ODkw"}
      />
      <p className="text-xs opacity-60">
        {rawText.length} chars (limit 1024 per Spec) · tbs_encoding=<code>{effective.tbs_encoding}</code>
        {signType === "RAW" && inputMode === "text" && " · auto-base64-encoded because sign_type=RAW"}
      </p>

      {signType !== "RAW" && (
        <Field label="hash_algorithm">
          <select
            className={selectClass}
            value={hashAlgorithm}
            onChange={(e) => setHashAlgorithm(e.target.value as HashAlgorithm)}
          >
            <option value="SHA256">SHA256</option>
            <option value="SHA1">SHA1</option>
            <option value="SHA384">SHA384</option>
            <option value="SHA512">SHA512</option>
          </select>
        </Field>
      )}
    </div>
  );
}
