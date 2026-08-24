-- A5: Delete HN garbage rows (run in Supabase SQL Editor)
DELETE FROM verified_startups
WHERE investor = 'yc' AND yc_batch IS NULL;

-- Verify
SELECT COUNT(*) AS remaining_junk FROM verified_startups
WHERE investor = 'yc' AND yc_batch IS NULL;
