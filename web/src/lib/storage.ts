import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHmac, randomBytes } from "crypto";
import path from "path";
import { db } from "@/lib/db";

// Media storage with presigned uploads. Two modes, same client-side flow
// (request presign -> browser PUTs the file -> confirm):
//   - S3 mode (S3_BUCKET set): real presigned S3 PUT/GET URLs.
//   - Local mode (no S3): "presigned" URLs point at our own /api/uploads/local
//     PUT handler, and bytes are stored in Postgres (upload_blobs) so uploads
//     work on a read-only serverless filesystem.

function s3Configured(): boolean {
  return Boolean(process.env.S3_BUCKET);
}

function s3(): S3Client {
  return new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });
}

function localSig(key: string): string {
  return createHmac("sha256", process.env.SESSION_SECRET || "dev")
    .update(key)
    .digest("hex")
    .slice(0, 32);
}

export function newStorageKey(prefix: string, filename: string): string {
  const ext = (path.extname(filename) || ".bin").toLowerCase().replace(/[^.a-z0-9]/g, "");
  return `${prefix}/${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;
}

/** URL the browser should PUT the file to. */
export async function presignUpload(key: string, contentType: string): Promise<string> {
  if (s3Configured()) {
    return getSignedUrl(
      s3(),
      new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: contentType }),
      { expiresIn: 600 }
    );
  }
  const base = process.env.APP_URL || "http://localhost:3000";
  return `${base}/api/uploads/local?key=${encodeURIComponent(key)}&sig=${localSig(key)}`;
}

/** Short-lived URL for viewing a stored object (media access is signed-URL only). */
export async function mediaViewUrl(key: string): Promise<string> {
  // Demo-seed media points at committed art under /public (e.g. the card
  // roster). Serve it directly so demo deals render without S3 or local disk;
  // this is the only path that works on a read-only serverless filesystem.
  if (key.startsWith("demo-public:")) return `/${key.slice("demo-public:".length)}`;
  if (s3Configured()) {
    return getSignedUrl(
      s3(),
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }),
      { expiresIn: 3600 }
    );
  }
  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}?sig=${localSig(key)}`;
}

// ---- Local-mode helpers used by the API routes ----

export function verifyLocalSig(key: string, sig: string): boolean {
  return localSig(key) === sig;
}

// Local mode stores uploaded bytes in Postgres (upload_blobs) so they survive on
// a read-only serverless filesystem. Keys are opaque and access is signed-URL
// only, so no path traversal surface exists.
export async function localWrite(key: string, data: Buffer): Promise<void> {
  const bytes = new Uint8Array(data);
  await db.uploadBlob.upsert({
    where: { key },
    create: { key, bytes },
    update: { bytes },
  });
}

export async function localRead(key: string): Promise<Buffer> {
  const blob = await db.uploadBlob.findUnique({ where: { key } });
  if (!blob) throw new Error("Not found");
  return Buffer.from(blob.bytes);
}

/** Permanently delete a stored object (used by the 30-day media purge). */
export async function mediaViewKeyDelete(key: string): Promise<void> {
  // Never delete shared /public demo assets during the 30-day purge.
  if (key.startsWith("demo-public:")) return;
  if (s3Configured()) {
    await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    return;
  }
  await db.uploadBlob.deleteMany({ where: { key } });
}
