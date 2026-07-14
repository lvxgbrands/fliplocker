import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { createHmac, randomBytes } from "crypto";
import path from "path";
import fs from "fs/promises";

// Media storage with presigned uploads. Two modes, same client-side flow
// (request presign -> browser PUTs the file -> confirm):
//   - S3 mode (S3_BUCKET set): real presigned S3 PUT/GET URLs.
//   - Local mode (staging demo): "presigned" URLs point at our own
//     /api/uploads/local PUT handler, files land in web/.data/uploads.

const LOCAL_ROOT = path.join(process.cwd(), ".data", "uploads");

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

function safeLocalPath(key: string): string {
  const p = path.normalize(path.join(LOCAL_ROOT, key));
  if (!p.startsWith(LOCAL_ROOT)) throw new Error("Invalid storage key");
  return p;
}

export async function localWrite(key: string, data: Buffer): Promise<void> {
  const p = safeLocalPath(key);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, data);
}

export async function localRead(key: string): Promise<Buffer> {
  return fs.readFile(safeLocalPath(key));
}
