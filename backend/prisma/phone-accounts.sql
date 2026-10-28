ALTER TABLE ecoprawn."User" ALTER COLUMN email DROP NOT NULL;
ALTER TABLE ecoprawn."User" ADD COLUMN username text, ADD COLUMN phone text;
CREATE UNIQUE INDEX "User_username_key" ON ecoprawn."User" (username);
CREATE UNIQUE INDEX "User_phone_key" ON ecoprawn."User" (phone);
CREATE TABLE ecoprawn."AuthThrottle" (key text PRIMARY KEY, count integer NOT NULL, "expiresAt" timestamptz NOT NULL);
ALTER TABLE ecoprawn."AuthThrottle" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON ecoprawn."AuthThrottle" FROM anon, authenticated;
CREATE INDEX "AuthThrottle_expiresAt_idx" ON ecoprawn."AuthThrottle" ("expiresAt");
