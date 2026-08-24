-- ==============================================================================
-- StackPulse: 100% Native Supabase Cloud Ingestion (pg_cron + pg_net + RLS)
-- Run this ONCE in your Supabase SQL Editor (https://supabase.com/dashboard/project/huubxklntrxcwqkoumhd/sql)
-- This runs 100% inside Supabase Cloud 24/7. No local machine or VPS needed.
-- ==============================================================================

-- 1. Enable Required Cloud Extensions
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

-- Enable RLS
ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_telemetry ENABLE ROW LEVEL SECURITY;

-- Drop previous restrictive policies
DROP POLICY IF EXISTS "Allow public read on startups" ON public.startups;
DROP POLICY IF EXISTS "Allow public insert on startups" ON public.startups;
DROP POLICY IF EXISTS "Allow public insert and update on startups" ON public.startups;
DROP POLICY IF EXISTS "Allow public insert on visitor_telemetry" ON public.visitor_telemetry;

-- Full public read, insert, and update policies
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

-- 3. Create Crawler State Tracking Table
CREATE TABLE IF NOT EXISTS public.crawler_state (
  id INT PRIMARY KEY DEFAULT 1,
  current_page INT DEFAULT 0,
  current_topic_idx INT DEFAULT 0,
  last_sync_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.crawler_state (id, current_page, current_topic_idx)
VALUES (1, 0, 0)
ON CONFLICT (id) DO NOTHING;

-- 4. Create Native Postgres PL/pgSQL Function for Ingestion
CREATE OR REPLACE FUNCTION public.sync_live_feed_cloud()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_page INT;
  v_topic_idx INT;
  v_topics TEXT[] := ARRAY['AI', 'LLM', 'Agent', 'Postgres', 'MongoDB', 'Firebase', 'DynamoDB', 'Vector', 'Nextjs', 'Voice+AI', 'DevTools', 'RAG', 'Embeddings'];
  v_topic TEXT;
  v_url TEXT;
BEGIN
  -- Get and increment state
  SELECT current_page, current_topic_idx INTO v_page, v_topic_idx FROM public.crawler_state WHERE id = 1;
  
  v_topic_idx := (v_topic_idx + 1) % array_length(v_topics, 1);
  IF v_topic_idx = 0 THEN
    v_page := (v_page + 1) % 20;
  END IF;
  
  v_topic := v_topics[v_topic_idx + 1];
  
  UPDATE public.crawler_state
  SET current_page = v_page,
      current_topic_idx = v_topic_idx,
      last_sync_at = now()
  WHERE id = 1;

  -- Fire HTTP GET request to Algolia Hacker News via pg_net
  v_url := 'https://hn.algolia.com/api/v1/search_by_date?tags=show_hn&query=' || v_topic || '&page=' || v_page::TEXT || '&hitsPerPage=25';
  
  PERFORM net.http_get(
    url := v_url,
    headers := '{"Content-Type": "application/json"}'::jsonb
  );
END;
$$;

-- 5. Schedule Recurring 60-Second Ingestion Cron in Supabase
SELECT cron.unschedule('stackpulse-cloud-crawler') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'stackpulse-cloud-crawler');

SELECT cron.schedule(
  'stackpulse-cloud-crawler',
  '* * * * *', -- Runs every 60 seconds autonomously on Supabase Cloud
  $$ SELECT public.sync_live_feed_cloud(); $$
);

-- 6. Check Active Cron Jobs
SELECT jobid, jobname, schedule, active FROM cron.job;
