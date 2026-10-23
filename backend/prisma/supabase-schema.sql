CREATE SCHEMA IF NOT EXISTS ecoprawn;
REVOKE ALL ON SCHEMA ecoprawn FROM PUBLIC, anon, authenticated;

-- CreateTable
CREATE TABLE "ecoprawn"."Tank" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pl" TEXT NOT NULL DEFAULT 'PL-42',
    "biomass" DOUBLE PRECISION NOT NULL DEFAULT 31.2,
    "targetToday" DOUBLE PRECISION NOT NULL DEFAULT 1.5,
    "fcr" DOUBLE PRECISION NOT NULL DEFAULT 1.35,
    "dispensedToday" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoprawn"."SensorTelemetry" (
    "id" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "dissolvedOxygen" DOUBLE PRECISION NOT NULL,
    "ph" DOUBLE PRECISION NOT NULL,
    "temperature" DOUBLE PRECISION NOT NULL,
    "salinity" DOUBLE PRECISION NOT NULL,
    "waterLevel" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SensorTelemetry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoprawn"."VisionScan" (
    "id" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "bodyLength" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "population" INTEGER NOT NULL,
    "abnormalCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisionScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoprawn"."FeedSchedule" (
    "id" TEXT NOT NULL,
    "tankId" TEXT NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "amountKg" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeedSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoprawn"."BioflocMetric" (
    "id" TEXT NOT NULL,
    "flocVolume" DOUBLE PRECISION NOT NULL,
    "cnRatio" DOUBLE PRECISION NOT NULL,
    "tss" DOUBLE PRECISION NOT NULL,
    "alkalinity" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BioflocMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoprawn"."EffluentLog" (
    "id" TEXT NOT NULL,
    "tankId" TEXT,
    "event" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "destination" TEXT,
    "volumeL" DOUBLE PRECISION,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EffluentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoprawn"."Alert" (
    "id" TEXT NOT NULL,
    "tankId" TEXT,
    "icon" TEXT NOT NULL DEFAULT 'info',
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ecoprawn"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'operator',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SensorTelemetry_tankId_recordedAt_idx" ON "ecoprawn"."SensorTelemetry"("tankId", "recordedAt");

-- CreateIndex
CREATE INDEX "VisionScan_tankId_recordedAt_idx" ON "ecoprawn"."VisionScan"("tankId", "recordedAt");

-- CreateIndex
CREATE INDEX "FeedSchedule_tankId_idx" ON "ecoprawn"."FeedSchedule"("tankId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "ecoprawn"."User"("email");

-- AddForeignKey
ALTER TABLE "ecoprawn"."SensorTelemetry" ADD CONSTRAINT "SensorTelemetry_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "ecoprawn"."Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecoprawn"."VisionScan" ADD CONSTRAINT "VisionScan_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "ecoprawn"."Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecoprawn"."FeedSchedule" ADD CONSTRAINT "FeedSchedule_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "ecoprawn"."Tank"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecoprawn"."EffluentLog" ADD CONSTRAINT "EffluentLog_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "ecoprawn"."Tank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ecoprawn"."Alert" ADD CONSTRAINT "Alert_tankId_fkey" FOREIGN KEY ("tankId") REFERENCES "ecoprawn"."Tank"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ecoprawn"."Tank" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."SensorTelemetry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."VisionScan" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."FeedSchedule" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."BioflocMetric" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."EffluentLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."Alert" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ecoprawn"."User" ENABLE ROW LEVEL SECURITY;
