import { NextResponse } from "next/server";
import { getSessionConfig, resolveHosts } from "@/lib/moica/config";

// Distinguishes "we can't even open a TCP connection to {fidoapi}" (expected outside
// Taiwan / without IP allow-listing, per Spec §貳.三) from a MOICA business error_code.
export async function GET() {
  const config = await getSessionConfig();
  const hosts = resolveHosts(config);
  if (!hosts.fidoapi) {
    return NextResponse.json({ checked: false, error: "No {fidoapi} host configured yet." });
  }

  const url = `https://${hosts.fidoapi}/`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  const start = Date.now();
  try {
    const res = await fetch(url, { method: "GET", signal: controller.signal, cache: "no-store" });
    return NextResponse.json({
      checked: true,
      reachable: true,
      status: res.status,
      durationMs: Date.now() - start,
      url,
    });
  } catch (err) {
    const message =
      err instanceof Error ? (err.name === "AbortError" ? "Timed out after 6s" : err.message) : String(err);
    return NextResponse.json({ checked: true, reachable: false, error: message, durationMs: Date.now() - start, url });
  } finally {
    clearTimeout(timeout);
  }
}
