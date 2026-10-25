-- Apply to the same schema used by DATABASE_URL. Hosted EcoPrawn uses ecoprawn.
BEGIN;
ALTER TABLE ecoprawn."User"
  ADD COLUMN "smsPhone" TEXT,
  ADD COLUMN "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "lastSmsAt" TIMESTAMP(3);
CREATE TABLE ecoprawn."SmsDelivery" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES ecoprawn."User"("id") ON DELETE CASCADE,
  "tankId" TEXT,
  "recipient" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'sending',
  "referenceId" TEXT UNIQUE,
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE INDEX "SmsDelivery_userId_createdAt_idx" ON ecoprawn."SmsDelivery" ("userId", "createdAt");
ALTER TABLE ecoprawn."SmsDelivery" ENABLE ROW LEVEL SECURITY;
-- Only the authenticated backend database connection can write SMS records.
REVOKE ALL ON ecoprawn."SmsDelivery" FROM anon, authenticated;
COMMIT;
