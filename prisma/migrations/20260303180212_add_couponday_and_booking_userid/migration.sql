-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "issuedAt" TIMESTAMP(3),
ADD COLUMN     "reservationId" TEXT;

-- AlterTable
ALTER TABLE "EventBooking" ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "CouponDay" (
    "dayKey" TEXT NOT NULL,
    "issuedCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CouponDay_pkey" PRIMARY KEY ("dayKey")
);

-- CreateIndex
CREATE INDEX "Coupon_userId_dayKey_idx" ON "Coupon"("userId", "dayKey");

-- CreateIndex
CREATE INDEX "EventBooking_userId_date_idx" ON "EventBooking"("userId", "date");
