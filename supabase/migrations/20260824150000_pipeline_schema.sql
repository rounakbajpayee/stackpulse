-- A1: Add stack_source and stack_verified_at to verified_startups
ALTER TABLE verified_startups
  ADD COLUMN IF NOT EXISTS stack_source TEXT NOT NULL DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS stack_verified_at TIMESTAMPTZ;

-- A2: Create vc_pipeline staging table
CREATE TABLE IF NOT EXISTS vc_pipeline (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  investor TEXT NOT NULL,
  website TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_vc_pipeline_unprocessed
  ON vc_pipeline (created_at)
  WHERE processed_at IS NULL;

-- A3: Enable pg_net extension (needed for cron HTTP calls)
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
