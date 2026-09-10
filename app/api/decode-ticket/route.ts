import { NextRequest, NextResponse } from "next/server";
import { decodeSpTicket } from "@/lib/moica/crypto";

// Small standalone helper used by /app-link (and anywhere else pasting a raw sp_ticket
// is useful) to decode+verify its digest without re-running a full ticket-issuing flow.
// decodeSpTicket only needs Node's crypto module (SHA-256), no AES key, so this never
// touches session config.
export async function POST(request: NextRequest) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: any;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const spTicket: string = body.sp_ticket ?? "";
  if (!spTicket) {
    return NextResponse.json({ error: "sp_ticket is required" }, { status: 400 });
  }
  try {
    const decoded = decodeSpTicket(spTicket);
    return NextResponse.json(decoded);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
