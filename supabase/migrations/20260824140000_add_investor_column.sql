ALTER TABLE verified_startups
  ADD COLUMN IF NOT EXISTS investor TEXT DEFAULT 'yc';

UPDATE verified_startups
  SET investor = 'yc'
  WHERE yc_batch IS NOT NULL AND investor IS NULL;
