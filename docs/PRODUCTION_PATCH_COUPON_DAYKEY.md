# Production patch: Add Coupon.dayKey

If production shows: **"The column Coupon.dayKey does not exist in the current database"**, the migration was not applied.

## Fastest fix

### A) Deploy migration (recommended)

From your repo with env pointing to production DB:

```bash
DATABASE_URL="postgresql://..." DIRECT_URL="postgresql://..." pnpm prisma migrate deploy
```

### B) Manual SQL in Postgres console (immediate patch)

Run in your Postgres client (Railway, Supabase, etc.):

```sql
-- Add column (safe to run; ignore error if column already exists)
ALTER TABLE "Coupon" ADD COLUMN IF NOT EXISTS "dayKey" TEXT;

-- Index (ignore error if exists)
CREATE INDEX IF NOT EXISTS "Coupon_dayKey_idx" ON "Coupon"("dayKey");

-- Unique index (run once; if already exists, skip or ignore error)
CREATE UNIQUE INDEX IF NOT EXISTS "Coupon_userId_dayKey_key" ON "Coupon"("userId", "dayKey");
```

Note: `ADD COLUMN IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` require PostgreSQL 9.5+.

After this, the Pay flow will work. The app also handles missing `dayKey` gracefully (no coupon applied if DB errors).
