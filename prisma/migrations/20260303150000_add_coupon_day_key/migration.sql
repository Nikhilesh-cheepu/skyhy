-- Add dayKey to Coupon for daily quota and per-user-per-day uniqueness
ALTER TABLE "Coupon" ADD COLUMN "dayKey" TEXT;

CREATE INDEX "Coupon_dayKey_idx" ON "Coupon"("dayKey");

CREATE UNIQUE INDEX "Coupon_userId_dayKey_key" ON "Coupon"("userId", "dayKey");
