-- ==============================================================================
-- StackPulse 60-Second Autonomous Ingestion Cron Setup (Supabase pg_cron + pg_net)
-- Run this in your Supabase SQL Editor to enable 24/7 background crawling and RLS.
-- ==============================================================================

-- 1. Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Verify Table Schema & Row Level Security
CREATE TABLE IF NOT EXISTS public.startups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  category TEXT,
  batch TEXT,
  database_stack TEXT,
  vector_search TEXT,
  migration_opportunity_score TEXT,
  framework TEXT,
  bottleneck_detected TEXT,
  ae_outbound_pitch TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visitor_telemetry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT,
  referrer TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_telemetry ENABLE ROW LEVEL SECURITY;

-- Drop previous restrictive policies if they exist
DROP POLICY IF EXISTS "Allow public read on startups" ON public.startups;
DROP POLICY IF EXISTS "Allow public insert on startups" ON public.startups;
DROP POLICY IF EXISTS "Allow public insert and update on startups" ON public.startups;

-- Full public read, insert, and update policies for live ingestion sync
CREATE POLICY "Allow public insert and update on startups"
ON public.startups
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public insert on visitor_telemetry"
ON public.visitor_telemetry
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 3. Schedule Recurring 60-Second Ingestion Cron Job
-- Note: In standard cron syntax, '* * * * *' runs every 60 seconds
SELECT cron.schedule(
  'stackpulse-live-feed-60s',
  '* * * * *', -- Every 60 seconds (1 minute)
  $$
    SELECT net.http_post(
      url := 'https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&query=AI&hitsPerPage=25',
      headers := '{"Content-Type": "application/json"}'::jsonb
    );
  $$
);

-- Check scheduled jobs
SELECT * FROM cron.job;
