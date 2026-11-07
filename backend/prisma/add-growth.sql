-- Additive migration. Run once against the hosted ecoprawn schema.
-- Local development can use db:push instead. Do not run both on the same database.
BEGIN;
CREATE TABLE "ecoprawn"."GrowthSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "tankId" TEXT NOT NULL REFERENCES "ecoprawn"."Tank"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "batch" TEXT NOT NULL,
  "sampledAt" TIMESTAMP(3) NOT NULL,
  "stockedAt" TIMESTAMP(3) NOT NULL,
  "setupId" TEXT NOT NULL,
  "calibration" JSONB NOT NULL,
  "invalidatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("stockedAt" <= "sampledAt")
);
CREATE INDEX "GrowthSession_tankId_batch_sampledAt_idx" ON "ecoprawn"."GrowthSession"("tankId", "batch", "sampledAt");
CREATE TABLE "ecoprawn"."GrowthMeasurement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL REFERENCES "ecoprawn"."GrowthSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  "specimenId" TEXT NOT NULL,
  "imageHash" TEXT NOT NULL,
  "imageKey" TEXT NOT NULL,
  "capturedAt" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'review',
  "original" JSONB NOT NULL,
  "correction" JSONB,
  "manualLengthMm" DOUBLE PRECISION,
  "measuredWeightG" DOUBLE PRECISION,
  "approvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK ("status" IN ('review', 'approved', 'rejected')),
  CHECK ("manualLengthMm" > 0 AND "manualLengthMm" <= 10000),
  CHECK ("measuredWeightG" > 0 AND "measuredWeightG" <= 10000)
);
CREATE UNIQUE INDEX "GrowthMeasurement_imageKey_key" ON "ecoprawn"."GrowthMeasurement"("imageKey");
CREATE UNIQUE INDEX "GrowthMeasurement_sessionId_imageHash_key" ON "ecoprawn"."GrowthMeasurement"("sessionId", "imageHash");
CREATE INDEX "GrowthMeasurement_sessionId_specimenId_idx" ON "ecoprawn"."GrowthMeasurement"("sessionId", "specimenId");
ALTER TABLE "ecoprawn"."GrowthSession" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."GrowthMeasurement" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ecoprawn"."GrowthSession", "ecoprawn"."GrowthMeasurement" FROM PUBLIC, anon, authenticated;
COMMIT;
