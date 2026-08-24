-- D5: Schedule background cron jobs

-- Stage 1: Weekly list refresh (Sunday 2am)
SELECT cron.schedule('refresh-vc-lists', '0 2 * * 0',
  $$ SELECT net.http_post(
    url := 'https://huubxklntrxcwqkoumhd.supabase.co/functions/v1/refresh-vc-lists',
    headers := jsonb_build_object('Authorization', 'Bearer sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si')
  ) $$
);

-- Stage 2: Processing every 2 min
SELECT cron.schedule('process-vc-pipeline', '*/2 * * * *',
  $$ SELECT net.http_post(
    url := 'https://huubxklntrxcwqkoumhd.supabase.co/functions/v1/process-vc-pipeline',
    headers := jsonb_build_object('Authorization', 'Bearer sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si')
  ) $$
);
