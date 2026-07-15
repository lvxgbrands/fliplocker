-- CreateEnum
CREATE TYPE "InspectionResult" AS ENUM ('PENDING', 'PASS', 'FAIL');

-- AlterTable
ALTER TABLE "checkout_config" ADD COLUMN     "hubCity" TEXT NOT NULL DEFAULT 'Austin',
ADD COLUMN     "hubName" TEXT NOT NULL DEFAULT 'FlipLocker Verification Hub',
ADD COLUMN     "hubState" TEXT NOT NULL DEFAULT 'TX',
ADD COLUMN     "hubStreet" TEXT NOT NULL DEFAULT '000 Placeholder St',
ADD COLUMN     "hubZip" TEXT NOT NULL DEFAULT '78701',
ADD COLUMN     "mediaPurgeDays" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "reviewWindowHours" INTEGER NOT NULL DEFAULT 48,
ADD COLUMN     "sellerLabelChargeCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "shipTimerHours" INTEGER NOT NULL DEFAULT 72;

-- AlterTable
ALTER TABLE "deal_media" ADD COLUMN     "purgeAfter" TIMESTAMP(3),
ADD COLUMN     "purgedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "deals" ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "flagReason" TEXT,
ADD COLUMN     "fundsReleasedAt" TIMESTAMP(3),
ADD COLUMN     "receivedAt" TIMESTAMP(3),
ADD COLUMN     "refundedAt" TIMESTAMP(3),
ADD COLUMN     "reviewDeadlineAt" TIMESTAMP(3),
ADD COLUMN     "shipDeadlineAt" TIMESTAMP(3),
ADD COLUMN     "tosAcceptedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "email_outbox" ADD COLUMN     "dealId" TEXT;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "disbursedAt" TIMESTAMP(3),
ADD COLUMN     "refundId" TEXT,
ADD COLUMN     "refundedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "labelChargeCents" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastScanAt" TIMESTAMP(3),
ADD COLUMN     "provider" TEXT NOT NULL DEFAULT 'SIM',
ADD COLUMN     "service" TEXT,
ADD COLUMN     "signedBy" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "hub_inspections" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "facilitatorId" TEXT,
    "tamperSealSerial" TEXT,
    "result" "InspectionResult" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "checkedInAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hub_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sms_outbox" (
    "id" TEXT NOT NULL,
    "toPhone" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "dealId" TEXT,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sms_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hub_inspections_dealId_key" ON "hub_inspections"("dealId");

-- CreateIndex
CREATE INDEX "sms_outbox_sentAt_idx" ON "sms_outbox"("sentAt");

-- CreateIndex
CREATE INDEX "deals_status_idx" ON "deals"("status");

-- CreateIndex
CREATE INDEX "email_outbox_sentAt_idx" ON "email_outbox"("sentAt");

-- AddForeignKey
ALTER TABLE "hub_inspections" ADD CONSTRAINT "hub_inspections_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hub_inspections" ADD CONSTRAINT "hub_inspections_facilitatorId_fkey" FOREIGN KEY ("facilitatorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
