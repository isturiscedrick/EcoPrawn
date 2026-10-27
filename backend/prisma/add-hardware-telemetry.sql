-- Additive migration for the configured hosted ecoprawn schema.
CREATE TABLE "ecoprawn"."HardwareTelemetry" (
  "id" TEXT NOT NULL,
  "tankId" TEXT NOT NULL,
  "temperature" DOUBLE PRECISION,
  "distanceCm" DOUBLE PRECISION,
  "waterLevel" DOUBLE PRECISION,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "HardwareTelemetry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "HardwareTelemetry_tankId_fkey" FOREIGN KEY ("tankId")
    REFERENCES "ecoprawn"."Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "HardwareTelemetry_temperature_check" CHECK ("temperature" BETWEEN -55 AND 125),
  CONSTRAINT "HardwareTelemetry_distance_check" CHECK ("distanceCm" BETWEEN 2 AND 400),
  CONSTRAINT "HardwareTelemetry_level_check" CHECK ("waterLevel" BETWEEN 0 AND 100),
  CONSTRAINT "HardwareTelemetry_measurement_check" CHECK ("temperature" IS NOT NULL OR "distanceCm" IS NOT NULL)
);
CREATE INDEX "HardwareTelemetry_tankId_recordedAt_idx"
  ON "ecoprawn"."HardwareTelemetry"("tankId", "recordedAt");
ALTER TABLE "ecoprawn"."HardwareTelemetry" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ecoprawn"."HardwareTelemetry" FROM PUBLIC, anon, authenticated;
