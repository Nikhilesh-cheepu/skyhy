import type { PrismaClient } from "@prisma/client";

// Ensure that the Bill table and BillStatus enum in the database
// have the columns/values expected by the current Prisma schema.
// This mirrors the 20260305000000_add_bill_partial_paid_fields migration,
// but is safe to run multiple times (errors are swallowed).
export async function ensureBillSchema(prisma: PrismaClient) {
  try {
    // Add PARTIAL to BillStatus enum if it doesn't exist yet.
    try {
      // If PARTIAL already exists, this will throw; we can safely ignore.
      await prisma.$executeRawUnsafe(
        'ALTER TYPE "BillStatus" ADD VALUE \'PARTIAL\';',
      );
    } catch {
      // ignore
    }

    // Add paidAmount and paidAt columns if missing.
    try {
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "paidAmount" INTEGER NOT NULL DEFAULT 0;',
      );
      await prisma.$executeRawUnsafe(
        'ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);',
      );
    } catch {
      // ignore
    }
  } catch {
    // Final safety: never block the request if this helper fails.
  }
}

