-- Applied to the hosted ecoprawn schema using the Supabase migration tool.
-- Existing rows remain intact and are linked on the next verified Google login.
ALTER TABLE ecoprawn."User" ADD COLUMN "authId" uuid;
CREATE UNIQUE INDEX "User_authId_key" ON ecoprawn."User" ("authId");
