-- Track contact clicks (WhatsApp / Call) for analytics

CREATE TABLE "ContactClick" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ContactClick_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ContactClick_type_idx" ON "ContactClick"("type");

