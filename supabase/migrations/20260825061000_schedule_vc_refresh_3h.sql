-- Migration: 20260825061000_schedule_vc_refresh_3h.sql
-- Description: Schedules refresh-vc-lists Edge Function every 3 hours via pg_cron

-- 1. Unschedule any legacy daily refresh job if exists
SELECT cron.unschedule('refresh-vc-portfolios-daily') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'refresh-vc-portfolios-daily'
);
SELECT cron.unschedule('refresh-vc-portfolios-3h') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'refresh-vc-portfolios-3h'
);

-- 2. Schedule continuous portfolio batch refresh every 3 hours
SELECT cron.schedule(
  'refresh-vc-portfolios-3h',
  '0 */3 * * *',
  $$ SELECT net.http_post(
    url := 'https://huubxklntrxcwqkoumhd.supabase.co/functions/v1/refresh-vc-lists',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si'
    )
  ) $$
);
