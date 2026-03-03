-- Add dayKey to Coupon for daily quota and per-user-per-day uniqueness
ALTER TABLE "Coupon" ADD COLUMN "dayKey" TEXT;

-- Optional index for querying by dayKey
CREATE INDEX "Coupon_dayKey_idx" ON "Coupon"("dayKey");

-- Ensure at most one coupon per user per day
CREATE UNIQUE INDEX "Coupon_userId_dayKey_key" ON "Coupon"("userId", "dayKey");

