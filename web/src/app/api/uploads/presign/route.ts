import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { newStorageKey, presignUpload } from "@/lib/storage";
import { rateLimit } from "@/lib/rate-limit";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

// purpose -> [allowed content types, key prefix]
const PURPOSES: Record<string, { types: string[]; prefix: string }> = {
  "deal-photo": { types: IMAGE_TYPES, prefix: "deal-photos" },
  "offer-photo": { types: IMAGE_TYPES, prefix: "offer-photos" },
  "hub-photo": { types: IMAGE_TYPES, prefix: "hub-photos" },
  "hub-video": { types: VIDEO_TYPES, prefix: "hub-videos" },
};

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  // Cap presign requests per user (each deal needs 2, each inspection 3).
  if (!rateLimit(`presign:${user.id}`, 60, 60_000).ok) {
    return NextResponse.json({ error: "Too many uploads, slow down." }, { status: 429 });
  }

  const { filename, contentType, purpose = "deal-photo" } = await req.json();
  const rule = PURPOSES[purpose];
  if (!rule || typeof filename !== "string" || !rule.types.includes(contentType)) {
    return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  }
  // Hub uploads require a facilitator/admin.
  if (purpose.startsWith("hub-") && user.role !== "FACILITATOR" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Not authorized for hub uploads" }, { status: 403 });
  }

  const key = newStorageKey(`${rule.prefix}/${user.id}`, filename);
  const url = await presignUpload(key, contentType);
  return NextResponse.json({ key, url });
}
