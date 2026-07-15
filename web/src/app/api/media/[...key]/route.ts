import { NextRequest, NextResponse } from "next/server";
import { localRead, verifyLocalSig } from "@/lib/storage";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".heic": "image/heic",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
  ".webm": "video/webm",
};

// Serves local-mode media. Access is signed-URL only (mediaViewUrl).
export async function GET(req: NextRequest, ctx: { params: Promise<{ key: string[] }> }) {
  const { key: parts } = await ctx.params;
  const key = parts.map(decodeURIComponent).join("/");
  const sig = req.nextUrl.searchParams.get("sig") || "";
  if (!verifyLocalSig(key, sig)) {
    return NextResponse.json({ error: "Invalid media signature" }, { status: 403 });
  }
  try {
    const data = await localRead(key);
    const ext = key.slice(key.lastIndexOf(".")).toLowerCase();
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
