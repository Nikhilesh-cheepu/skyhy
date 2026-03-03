-- CreateEnum
CREATE TYPE "CouponClaimStatus" AS ENUM ('HELD', 'USED', 'RELEASED');

-- AlterTable
ALTER TABLE "Bill" ADD COLUMN     "billType" TEXT NOT NULL DEFAULT 'alakart';

-- CreateTable
CREATE TABLE "CouponClaim" (
    "id" TEXT NOT NULL,
    "dayKey" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "billId" TEXT NOT NULL,
    "status" "CouponClaimStatus" NOT NULL DEFAULT 'HELD',
    "holdExpiresAt" TIMESTAMP(3) NOT NULL,
    "discountAmount" INTEGER,
    "discountPercent" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CouponClaim_dayKey_idx" ON "CouponClaim"("dayKey");

-- CreateIndex
CREATE INDEX "CouponClaim_billId_idx" ON "CouponClaim"("billId");

-- CreateIndex
CREATE UNIQUE INDEX "CouponClaim_dayKey_userId_key" ON "CouponClaim"("dayKey", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "CouponClaim_dayKey_billId_key" ON "CouponClaim"("dayKey", "billId");

-- AddForeignKey
ALTER TABLE "CouponClaim" ADD CONSTRAINT "CouponClaim_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CouponClaim" ADD CONSTRAINT "CouponClaim_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;
