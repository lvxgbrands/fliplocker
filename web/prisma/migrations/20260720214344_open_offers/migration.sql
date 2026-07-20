-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('OPEN', 'RESERVED', 'CLAIMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "checkout_config" ADD COLUMN     "offerHoldMinutes" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "offerId" TEXT;

-- CreateTable
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "linkToken" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "status" "OfferStatus" NOT NULL DEFAULT 'OPEN',
    "sport" TEXT NOT NULL,
    "cardYear" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "gradingCompany" TEXT NOT NULL,
    "grade" TEXT,
    "certNumber" TEXT NOT NULL,
    "description" TEXT,
    "salePriceCents" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "reservedById" TEXT,
    "reservedAt" TIMESTAMP(3),
    "reservedUntil" TIMESTAMP(3),
    "pendingDealId" TEXT,
    "claimedById" TEXT,
    "claimedDealId" TEXT,
    "claimedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_media" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_waitlist" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "userId" TEXT,
    "notifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_waitlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offer_events" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "offers_linkToken_key" ON "offers"("linkToken");

-- CreateIndex
CREATE UNIQUE INDEX "offers_shortCode_key" ON "offers"("shortCode");

-- CreateIndex
CREATE INDEX "offers_sellerId_idx" ON "offers"("sellerId");

-- CreateIndex
CREATE INDEX "offers_status_idx" ON "offers"("status");

-- CreateIndex
CREATE UNIQUE INDEX "offer_media_offerId_kind_key" ON "offer_media"("offerId", "kind");

-- CreateIndex
CREATE INDEX "offer_waitlist_offerId_idx" ON "offer_waitlist"("offerId");

-- CreateIndex
CREATE UNIQUE INDEX "offer_waitlist_offerId_email_key" ON "offer_waitlist"("offerId", "email");

-- CreateIndex
CREATE INDEX "offer_events_offerId_createdAt_idx" ON "offer_events"("offerId", "createdAt");

-- CreateIndex
CREATE INDEX "deals_offerId_idx" ON "deals"("offerId");

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_media" ADD CONSTRAINT "offer_media_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_waitlist" ADD CONSTRAINT "offer_waitlist_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offer_events" ADD CONSTRAINT "offer_events_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
