-- AlterTable: Bill billType default and existing values
UPDATE "Bill" SET "billType" = 'a_la_carte' WHERE "billType" = 'alakart';
ALTER TABLE "Bill" ALTER COLUMN "billType" SET DEFAULT 'a_la_carte';

-- AlterTable: Order add userId
ALTER TABLE "Order" ADD COLUMN "userId" TEXT;
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- AlterTable: CouponClaim add orderId, make billId optional
ALTER TABLE "CouponClaim" ADD COLUMN "orderId" TEXT;
ALTER TABLE "CouponClaim" ALTER COLUMN "billId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CouponClaim" ADD CONSTRAINT "CouponClaim_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "CouponClaim_dayKey_orderId_key" ON "CouponClaim"("dayKey", "orderId");
