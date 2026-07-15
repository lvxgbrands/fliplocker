-- CreateTable
CREATE TABLE "upload_blobs" (
    "key" TEXT NOT NULL,
    "bytes" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "upload_blobs_pkey" PRIMARY KEY ("key")
);
