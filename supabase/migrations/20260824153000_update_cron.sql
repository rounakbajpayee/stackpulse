SELECT cron.unschedule('process-vc-pipeline');
SELECT cron.schedule('process-vc-pipeline', '*/2 * * * *',
  $$ SELECT net.http_post(
    url := 'https://huubxklntrxcwqkoumhd.supabase.co/functions/v1/process-vc-pipeline',
    headers := jsonb_build_object('Authorization', 'Bearer sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si')
  ) $$
);
