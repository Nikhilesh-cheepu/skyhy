-- Run this once in your PostgreSQL database (Supabase SQL editor, psql, etc.)
-- if you get "column Bill.paidAmount does not exist". This adds the new Bill fields.

-- 1) Add PARTIAL to BillStatus enum (run once; if you get "already exists", skip to step 2)
ALTER TYPE "BillStatus" ADD VALUE 'PARTIAL';

-- 2) Add columns to Bill
ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "paidAmount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Bill" ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);
