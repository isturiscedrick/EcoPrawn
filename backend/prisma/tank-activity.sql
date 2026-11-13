-- Persistent, account-scoped tank audit history.
-- Apply to the schema configured by DATABASE_URL (hosted EcoPrawn: ecoprawn).
BEGIN;

CREATE TABLE ecoprawn."TankActivity" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "tankId" TEXT,
  "tankName" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TankActivity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "TankActivity_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES ecoprawn."User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TankActivity_tankId_fkey"
    FOREIGN KEY ("tankId") REFERENCES ecoprawn."Tank"("id")
    ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "TankActivity_userId_tankId_createdAt_idx"
  ON ecoprawn."TankActivity" ("userId", "tankId", "createdAt");

ALTER TABLE ecoprawn."TankActivity" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ecoprawn."TankActivity" FROM anon, authenticated;

COMMIT;
