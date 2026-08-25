# StackPulse Operational Runbook & Maintenance Guide

This document outlines the day-to-day operations, background jobs, database migrations, and manual enrichment procedures for StackPulse.

---

## 1. Background Ingestion & Enrichment Architecture (`pg_cron`)

StackPulse runs two autonomous background jobs inside Supabase Cloud using `pg_cron` and `pg_net`:

### Job 1: High-Frequency VC Portfolio Scraper (Every 3 Hours)
Pulls new startups from YC, a16z, and Sequoia into the `vc_pipeline` queue.

```sql
-- Schedule continuous portfolio batch refresh every 3 hours
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
```

### Job 2: Continuous 5-Tier Waterfall Enrichment (Every 2 Minutes)
Processes pending accounts in batches of 10 through GitHub, Ashby, and DOM scanning.

```sql
-- Schedule continuous background enrichment (every 2 minutes)
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
```

### Monitoring Cron Ingestion
To verify live cron execution and inspect status:

```sql
-- Check last 10 cron execution runs
SELECT jobid, runid, job_pid, database, status, return_message, start_time, end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

---

## 2. Managing the Financial Pricing Ontology

GTM leads can customize contract pricing models in real-time:

1. **Global Vintage Baselines**:
   * Open the **Pipeline Math** modal in the header.
   * Adjust sliders for Mature Series A/B+ ($36k), Growth ($24k), and Early Stage ($12k).
   * Sliders automatically update total pipeline ARR and table valuations with sub-3.5ms client memoization.
2. **Consolidation Add-On Multipliers**:
   * Toggle and tune values for external Vector store displacement (+$12k), Auth migration (+$8k), and Key-Value caching (+$6k).
3. **Individual Account Custom ARR Overrides**:
   * Open any account dossier $\rightarrow$ click **"Correct Details ✏️"**.
   * Enter a custom contract dollar value in **"Custom ARR ($/yr)"**.
   * Overrides are badged with `[Custom]` in the data table and persist into personal workspace deltas or master DB.

---

## 3. Running High-Throughput Offline Enrichment

For bulk ingestion of thousands of new portfolio companies:

1. **Prerequisites**:
   * Node.js v18+
   * `gh` CLI authenticated (`gh auth login`) for 5,000 req/hr GitHub Search API quota.
2. **Execution**:
   ```bash
   # Run the production enrichment runner with zero credits:
   node scripts/enrichment_runner.mjs
   ```

---

## 4. Applying Schema Migrations

Execute SQL migrations located in `supabase/migrations/` sequentially via the Supabase Dashboard SQL Editor or Supabase CLI:

```bash
# Apply migrations via Supabase CLI
supabase db push
```
