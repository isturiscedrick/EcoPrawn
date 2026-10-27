-- Run as database administrator. Fixtures and temporary test permissions are
-- rolled back, including on test failure when the transaction is aborted.
BEGIN;
DO $$
DECLARE
  a text := gen_random_uuid()::text;
  b text := gen_random_uuid()::text;
  tank_a text := gen_random_uuid()::text;
  tank_b text := gen_random_uuid()::text;
BEGIN
  PERFORM set_config('test.account_a', a, true);
  PERFORM set_config('test.account_b', b, true);
  PERFORM set_config('test.tank_a', tank_a, true);
  PERFORM set_config('test.tank_b', tank_b, true);
  INSERT INTO ecoprawn."User" (id, "authId", email) VALUES
    (a, a::uuid, a || '@isolation.invalid'), (b, b::uuid, b || '@isolation.invalid');
  INSERT INTO ecoprawn."Tank" (id, "userId", name, "updatedAt") VALUES
    (tank_a, a, 'Isolation test A', now()), (tank_b, b, 'Isolation test B', now());
  INSERT INTO ecoprawn."SensorTelemetry" (id, "tankId", "dissolvedOxygen", ph, temperature, salinity, "waterLevel")
    SELECT gen_random_uuid()::text, id, 6, 8, 28, 15, 98 FROM ecoprawn."Tank" WHERE id IN (tank_a, tank_b);
  INSERT INTO ecoprawn."VisionScan" (id, "tankId", "bodyLength", weight, population)
    SELECT gen_random_uuid()::text, id, 10, 18, 100 FROM ecoprawn."Tank" WHERE id IN (tank_a, tank_b);
  INSERT INTO ecoprawn."FeedSchedule" (id, "tankId", "timeSlot", "amountKg", "updatedAt")
    SELECT gen_random_uuid()::text, id, '06:00', 1, now() FROM ecoprawn."Tank" WHERE id IN (tank_a, tank_b);
  INSERT INTO ecoprawn."BioflocMetric" (id, "userId", "flocVolume", "cnRatio", tss, alkalinity) VALUES
    (gen_random_uuid()::text, a, 12, 14, 300, 140), (gen_random_uuid()::text, b, 22, 24, 400, 150);
  INSERT INTO ecoprawn."EffluentLog" (id, "userId", "tankId", event, detail) VALUES
    (gen_random_uuid()::text, a, tank_a, 'Test', 'A'), (gen_random_uuid()::text, b, tank_b, 'Test', 'B');
  INSERT INTO ecoprawn."Alert" (id, "userId", "tankId", title, detail) VALUES
    (gen_random_uuid()::text, a, tank_a, 'Test', 'A'), (gen_random_uuid()::text, b, tank_b, 'Test', 'B');
END $$;

-- The production schema is private. Temporarily allow the authenticated role
-- to exercise RLS directly; ROLLBACK restores the original permissions.
GRANT USAGE ON SCHEMA ecoprawn TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA ecoprawn TO authenticated;
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', current_setting('test.account_a'), true);
DO $$
DECLARE
  tbl text;
  visible bigint;
  affected bigint;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['User','Tank','SensorTelemetry','VisionScan','FeedSchedule','BioflocMetric','EffluentLog','Alert'] LOOP
    EXECUTE format('SELECT count(*) FROM ecoprawn.%I', tbl) INTO visible;
    IF visible <> 1 THEN RAISE EXCEPTION 'Account A sees % rows in % instead of 1', visible, tbl; END IF;
  END LOOP;
  UPDATE ecoprawn."Tank" SET name = 'Unauthorized' WHERE id = current_setting('test.tank_b');
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Cross-account update allowed'; END IF;
  DELETE FROM ecoprawn."Tank" WHERE id = current_setting('test.tank_b');
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 0 THEN RAISE EXCEPTION 'Cross-account delete allowed'; END IF;
  BEGIN
    INSERT INTO ecoprawn."SensorTelemetry" (id, "tankId", "dissolvedOxygen", ph, temperature, salinity, "waterLevel")
      VALUES (gen_random_uuid()::text, current_setting('test.tank_b'), 6, 8, 28, 15, 98);
    RAISE EXCEPTION 'Cross-account telemetry insert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    UPDATE ecoprawn."Tank" SET "userId" = current_setting('test.account_b') WHERE id = current_setting('test.tank_a');
    RAISE EXCEPTION 'Ownership reassignment allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  BEGIN
    INSERT INTO ecoprawn."Alert" (id, "userId", "tankId", title, detail)
      VALUES (gen_random_uuid()::text, current_setting('test.account_a'), current_setting('test.tank_b'), 'Test', 'Wrong tank');
    RAISE EXCEPTION 'Cross-account alert insert allowed';
  EXCEPTION WHEN insufficient_privilege THEN NULL;
  END;
  -- Own writes must still work, and logs must retain ownership after deletion.
  UPDATE ecoprawn."Tank" SET name = 'Own update' WHERE id = current_setting('test.tank_a');
  GET DIAGNOSTICS affected = ROW_COUNT;
  IF affected <> 1 THEN RAISE EXCEPTION 'Own update failed'; END IF;
  DELETE FROM ecoprawn."Tank" WHERE id = current_setting('test.tank_a');
  IF (SELECT count(*) FROM ecoprawn."EffluentLog" WHERE "tankId" IS NULL) <> 1 THEN
    RAISE EXCEPTION 'Effluent ownership lost after deletion';
  END IF;
  IF (SELECT count(*) FROM ecoprawn."Alert" WHERE "tankId" IS NULL) <> 1 THEN
    RAISE EXCEPTION 'Alert ownership lost after deletion';
  END IF;
END $$;
SELECT set_config('request.jwt.claim.sub', current_setting('test.account_b'), true);
DO $$
DECLARE tbl text; visible bigint;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['User','Tank','SensorTelemetry','VisionScan','FeedSchedule','BioflocMetric','EffluentLog','Alert'] LOOP
    EXECUTE format('SELECT count(*) FROM ecoprawn.%I', tbl) INTO visible;
    IF visible <> 1 THEN RAISE EXCEPTION 'Account B sees % rows in % instead of 1', visible, tbl; END IF;
  END LOOP;
END $$;
ROLLBACK;
SELECT 'PASS: eight-table isolation, write checks, retained log ownership; all fixtures and test grants rolled back' AS result;
