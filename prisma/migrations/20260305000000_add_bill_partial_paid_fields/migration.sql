-- AlterEnum: Add PARTIAL to BillStatus (run once; ignore error if value already exists)
ALTER TYPE "BillStatus" ADD VALUE 'PARTIAL';

-- AlterTable: Add paidAmount and paidAt to Bill
ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "paidAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
