import { NextRequest, NextResponse } from "next/server";
import { localWrite, verifyLocalSig } from "@/lib/storage";

// Local-mode stand-in for a presigned S3 PUT (staging without S3 credentials).
const MAX_BYTES = 15 * 1024 * 1024;

export async function PUT(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || "";
  const sig = req.nextUrl.searchParams.get("sig") || "";
  if (!key || !verifyLocalSig(key, sig)) {
    return NextResponse.json({ error: "Invalid upload signature" }, { status: 403 });
  }
  const buf = Buffer.from(await req.arrayBuffer());
  if (buf.byteLength === 0 || buf.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: "File empty or too large" }, { status: 413 });
  }
  await localWrite(key, buf);
  return NextResponse.json({ ok: true });
}
