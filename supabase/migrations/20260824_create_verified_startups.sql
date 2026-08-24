-- Create the verified_startups table to hold real data
CREATE TABLE IF NOT EXISTS public.verified_startups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    github_url TEXT,
    website_url TEXT,
    yc_batch TEXT,
    database_stack TEXT,
    vector_search TEXT,
    detected_stack JSONB DEFAULT '[]'::jsonb,
    verification_status TEXT DEFAULT 'pending', -- 'verified', 'pending', 'failed', 'manual_review'
    created_at TIMESTAMPTZ DEFAULT now(),
    last_verified_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.verified_startups ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read on verified_startups"
ON public.verified_startups
FOR SELECT
TO anon, authenticated
USING (true);

-- We only want our service role (Edge Function) to insert/update, so no public insert/update policy needed.

-- Make sure pg_cron is enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the Edge Function to run every hour using pg_net
-- (Replace YOUR_PROJECT_REF and YOUR_ANON_KEY when deploying)
-- SELECT cron.unschedule('run-verification-pipeline');
SELECT cron.schedule(
    'run-verification-pipeline',
    '0 * * * *', -- Run at minute 0 of every hour
    $$
    SELECT net.http_post(
        url:='https://huubxklntrxcwqkoumhd.supabase.co/functions/v1/verify-startups',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si"}'::jsonb
    );
    $$
);
