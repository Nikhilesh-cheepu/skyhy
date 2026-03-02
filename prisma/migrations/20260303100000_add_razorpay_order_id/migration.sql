-- AlterTable
ALTER TABLE "EventBooking" ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "razorpayOrderId" TEXT;
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventBooking_razorpayOrderId_idx" ON "EventBooking"("razorpayOrderId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Order_razorpayOrderId_idx" ON "Order"("razorpayOrderId");
