DROP POLICY IF EXISTS "Enable insert for anonymous users" ON verified_startups;
DROP POLICY IF EXISTS "Enable upsert for anonymous users" ON verified_startups;
DROP POLICY IF EXISTS "Enable insert for all users" ON verified_startups;
DROP POLICY IF EXISTS "Enable all operations for all users" ON verified_startups;
ALTER TABLE verified_startups ENABLE ROW LEVEL SECURITY;
