import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { newStorageKey, presignUpload } from "@/lib/storage";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/svg+xml"];

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { filename, contentType } = await req.json();
  if (typeof filename !== "string" || !ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const key = newStorageKey(`deal-photos/${user.id}`, filename);
  const url = await presignUpload(key, contentType);
  return NextResponse.json({ key, url });
}
