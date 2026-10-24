-- Hosted migration: account_ownership. Preserve legacy records as unassigned;
-- never infer an owner from whichever account happens to log in first.
ALTER TABLE ecoprawn."Tank" ADD COLUMN "userId" text REFERENCES ecoprawn."User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE ecoprawn."BioflocMetric" ADD COLUMN "userId" text REFERENCES ecoprawn."User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE ecoprawn."EffluentLog" ADD COLUMN "userId" text REFERENCES ecoprawn."User"(id) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE ecoprawn."Alert" ADD COLUMN "userId" text REFERENCES ecoprawn."User"(id) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "Tank_userId_idx" ON ecoprawn."Tank"("userId");
CREATE INDEX "BioflocMetric_userId_recordedAt_idx" ON ecoprawn."BioflocMetric"("userId", "recordedAt");
CREATE INDEX "EffluentLog_userId_recordedAt_idx" ON ecoprawn."EffluentLog"("userId", "recordedAt");
CREATE INDEX "Alert_userId_createdAt_idx" ON ecoprawn."Alert"("userId", "createdAt");
CREATE INDEX "EffluentLog_tankId_idx" ON ecoprawn."EffluentLog"("tankId");
CREATE INDEX "Alert_tankId_idx" ON ecoprawn."Alert"("tankId");

-- If a legacy tank has been explicitly assigned, retain ownership of its logs.
UPDATE ecoprawn."EffluentLog" l SET "userId" = t."userId" FROM ecoprawn."Tank" t WHERE l."tankId" = t.id AND t."userId" IS NOT NULL;
UPDATE ecoprawn."Alert" a SET "userId" = t."userId" FROM ecoprawn."Tank" t WHERE a."tankId" = t.id AND t."userId" IS NOT NULL;

-- Keep the schema private. These policies are defense in depth for any future
-- authenticated database access; privileged Prisma queries also filter by owner.
CREATE POLICY "read_own_profile" ON ecoprawn."User" FOR SELECT TO authenticated
  USING ("authId" = (SELECT auth.uid()));

CREATE POLICY "own_tanks" ON ecoprawn."Tank" FOR ALL TO authenticated
  USING ("userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid())))
  WITH CHECK ("userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid())));
CREATE POLICY "own_biofloc" ON ecoprawn."BioflocMetric" FOR ALL TO authenticated
  USING ("userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid())))
  WITH CHECK ("userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid())));

CREATE POLICY "own_telemetry" ON ecoprawn."SensorTelemetry" FOR ALL TO authenticated
  USING ("tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))))
  WITH CHECK ("tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))));
CREATE POLICY "own_scans" ON ecoprawn."VisionScan" FOR ALL TO authenticated
  USING ("tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))))
  WITH CHECK ("tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))));
CREATE POLICY "own_schedules" ON ecoprawn."FeedSchedule" FOR ALL TO authenticated
  USING ("tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))))
  WITH CHECK ("tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))));

CREATE POLICY "own_effluent" ON ecoprawn."EffluentLog" FOR ALL TO authenticated
  USING ("userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid())))
  WITH CHECK (
    "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))
    AND ("tankId" IS NULL OR "tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" = "EffluentLog"."userId"))
  );
CREATE POLICY "own_alerts" ON ecoprawn."Alert" FOR ALL TO authenticated
  USING ("userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid())))
  WITH CHECK (
    "userId" IN (SELECT id FROM ecoprawn."User" WHERE "authId" = (SELECT auth.uid()))
    AND ("tankId" IS NULL OR "tankId" IN (SELECT id FROM ecoprawn."Tank" WHERE "userId" = "Alert"."userId"))
  );
