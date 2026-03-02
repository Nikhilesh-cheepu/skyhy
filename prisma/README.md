# Database (Prisma + PostgreSQL)

## Connection

- **DATABASE_URL** — Used at runtime (and for migrations when no pooler).
- **DIRECT_URL** — Used for migrations when using a connection pooler (e.g. PgBouncer).

**Local migrations:** If your `DIRECT_URL` points to an internal host (e.g. `postgres.railway.internal`), run migrations using the public URL:

```bash
DIRECT_URL="$DATABASE_URL" npx prisma migrate dev --name your_migration_name
```

Or set `DIRECT_URL` in `.env` to your public PostgreSQL URL when working locally.

## Commands

- `npm run db:generate` — Generate Prisma Client.
- `npm run db:migrate` — Create and apply migrations (dev).
- `npm run db:migrate:deploy` — Apply pending migrations (production).
- `npm run db:studio` — Open Prisma Studio.

## Verify connection

- **API:** `GET /api/db` returns connection status and table counts (no secrets).
