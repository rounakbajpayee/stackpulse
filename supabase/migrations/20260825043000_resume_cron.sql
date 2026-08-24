-- ==============================================================================
-- Resume & Upgrade StackPulse Background Pipeline Cron on Supabase
-- ==============================================================================

-- 1. Unschedule any legacy or paused job
SELECT cron.unschedule('process-vc-pipeline') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-vc-pipeline'
);

-- 2. Schedule the continuous background enrichment cron (every 2 minutes)
SELECT cron.schedule(
  'process-vc-pipeline',
  '*/2 * * * *',
  $$ SELECT net.http_post(
    url := 'https://huubxklntrxcwqkoumhd.supabase.co/functions/v1/process-vc-pipeline',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si'
    )
  ) $$
);
