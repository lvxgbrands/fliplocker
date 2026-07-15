-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SELLER', 'BUYER', 'FACILITATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "PlanTier" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "AuthTokenKind" AS ENUM ('EMAIL_VERIFY', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "DealStatus" AS ENUM ('DRAFT', 'CREATED', 'BUYER_NOTIFIED', 'ACCEPTED', 'PAID', 'AWAITING_SELLER_SHIPMENT', 'IN_TRANSIT_TO_HUB', 'RECEIVED_AT_HUB', 'VERIFIED', 'REPACKED', 'IN_TRANSIT_TO_BUYER', 'DELIVERED_SIGNED', 'FUNDS_RELEASED', 'COMPLETE', 'DECLINED', 'CANCELLED', 'REFUNDED', 'FLAGGED');

-- CreateEnum
CREATE TYPE "MediaKind" AS ENUM ('FRONT_PHOTO', 'REAR_PHOTO', 'HUB_VIDEO', 'HUB_PHOTO_1', 'HUB_PHOTO_2');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('CREATED', 'APPROVED', 'CAPTURED', 'VOIDED', 'REFUNDED', 'FAILED');

-- CreateEnum
CREATE TYPE "ShipmentLeg" AS ENUM ('TO_HUB', 'TO_BUYER');

-- CreateEnum
CREATE TYPE "FeePayer" AS ENUM ('BUYER', 'SELLER', 'SPLIT');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'SELLER',
    "plan" "PlanTier" NOT NULL DEFAULT 'FREE',
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "kind" "AuthTokenKind" NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "buyerEmail" TEXT NOT NULL,
    "buyerId" TEXT,
    "inviteToken" TEXT NOT NULL,
    "status" "DealStatus" NOT NULL DEFAULT 'CREATED',
    "sport" TEXT NOT NULL,
    "cardYear" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "gradingCompany" TEXT NOT NULL,
    "certNumber" TEXT NOT NULL,
    "description" TEXT,
    "salePriceCents" INTEGER NOT NULL,
    "feeTotalCents" INTEGER NOT NULL,
    "feeBuyerCents" INTEGER NOT NULL,
    "feeSellerCents" INTEGER NOT NULL,
    "shippingCents" INTEGER NOT NULL,
    "insuranceCents" INTEGER NOT NULL,
    "taxCents" INTEGER NOT NULL,
    "buyerTotalCents" INTEGER NOT NULL,
    "sellerPayoutCents" INTEGER NOT NULL,
    "feeConfigSnapshot" JSONB NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_media" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "kind" "MediaKind" NOT NULL,
    "storageKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'PAYPAL',
    "paypalOrderId" TEXT NOT NULL,
    "authorizationId" TEXT,
    "captureId" TEXT,
    "state" "PaymentState" NOT NULL DEFAULT 'CREATED',
    "grossCents" INTEGER NOT NULL,
    "platformFeeCents" INTEGER NOT NULL,
    "sellerNetCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "rawCreate" JSONB,
    "rawCapture" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipments" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "leg" "ShipmentLeg" NOT NULL,
    "carrier" TEXT NOT NULL DEFAULT 'USPS',
    "trackingNumber" TEXT,
    "labelUrl" TEXT,
    "signatureRequired" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_events" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fee_config" (
    "id" TEXT NOT NULL,
    "plan" "PlanTier" NOT NULL,
    "floorCents" INTEGER NOT NULL,
    "percentBps" INTEGER NOT NULL,
    "crossoverPriceCents" INTEGER NOT NULL,
    "whoPays" "FeePayer" NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fee_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "checkout_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "minSalePriceCents" INTEGER NOT NULL,
    "outboundShippingCents" INTEGER NOT NULL,
    "insuranceEnabled" BOOLEAN NOT NULL DEFAULT true,
    "insuranceCentsPer100" INTEGER NOT NULL,
    "taxEnabled" BOOLEAN NOT NULL DEFAULT false,
    "defaultTaxBps" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checkout_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_rates" (
    "id" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "rateBps" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tax_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_outbox" (
    "id" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_outbox_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "auth_tokens_token_key" ON "auth_tokens"("token");

-- CreateIndex
CREATE INDEX "auth_tokens_userId_idx" ON "auth_tokens"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "deals_shortCode_key" ON "deals"("shortCode");

-- CreateIndex
CREATE UNIQUE INDEX "deals_inviteToken_key" ON "deals"("inviteToken");

-- CreateIndex
CREATE INDEX "deals_sellerId_idx" ON "deals"("sellerId");

-- CreateIndex
CREATE INDEX "deals_buyerId_idx" ON "deals"("buyerId");

-- CreateIndex
CREATE UNIQUE INDEX "deal_media_dealId_kind_key" ON "deal_media"("dealId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "payments_paypalOrderId_key" ON "payments"("paypalOrderId");

-- CreateIndex
CREATE INDEX "payments_dealId_idx" ON "payments"("dealId");

-- CreateIndex
CREATE INDEX "shipments_dealId_idx" ON "shipments"("dealId");

-- CreateIndex
CREATE INDEX "deal_events_dealId_createdAt_idx" ON "deal_events"("dealId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "fee_config_plan_key" ON "fee_config"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "tax_rates_configId_state_key" ON "tax_rates"("configId", "state");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth_tokens" ADD CONSTRAINT "auth_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_media" ADD CONSTRAINT "deal_media_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipments" ADD CONSTRAINT "shipments_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_events" ADD CONSTRAINT "deal_events_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_rates" ADD CONSTRAINT "tax_rates_configId_fkey" FOREIGN KEY ("configId") REFERENCES "checkout_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;
