# StackPulse Operational Runbook & Maintenance Guide

This document outlines the day-to-day operations, background jobs, database migrations, and manual enrichment procedures for StackPulse.

---

## 1. Background Enrichment Architecture (`pg_cron`)

StackPulse runs a 24/7 autonomous background crawler inside Supabase Cloud using `pg_cron` and `pg_net`.

### Scheduling the Cron Job
To re-enable or adjust the cron schedule, execute this in the [Supabase SQL Editor](https://supabase.com/dashboard/project/huubxklntrxcwqkoumhd/sql):

```sql
-- Unschedule existing job
SELECT cron.unschedule('process-vc-pipeline') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'process-vc-pipeline'
);

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
To verify live cron execution and inspect errors:

```sql
-- Check last 10 cron execution runs
SELECT jobid, runid, job_pid, database, status, return_message, start_time, end_time
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

---

## 2. Running High-Throughput Offline Enrichment

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

## 3. Database Schema & Tables

* **`verified_startups`** (Canonical Master Table):
  * `id` (Text, Primary Key, e.g. `yc_1234`)
  * `name` (Text)
  * `website_url` (Text)
  * `database_stack` (Text, e.g. `PostgreSQL + Redis`)
  * `vector_search` (Text, e.g. `pgvector`, `Pinecone`)
  * `stack_source` (Text: `github`, `job_board`, `html_signals`, `google_search`)
  * `verification_depth` (Text: `confirmed`, `surface_free`, `deep_scraped`, `unscanned`)
  * `verification_status` (Text: `verified` | `unverified`)
* **`user_workspaces`** (Multi-Tenant Territory Overrides):
  * `user_id` (UUID, Foreign Key to `auth.users`)
  * `delta` (JSONB storing deleted account IDs, custom stack overrides, and verification notes)
  * `updated_at` (Timestamp)
* **`vc_pipeline`** (Raw Ingestion Queue):
  * `id` (Text)
  * `name` (Text)
  * `investor` (Text)
  * `website` (Text)
  * `processed_at` (Timestamp, null if awaiting enrichment)

---

## 4. Secret Management & Production Keys

* **Supabase Anon Key**: Safe for frontend browser execution (protected by RLS).
* **BYOK API Keys**: Stored in client `localStorage` for zero-exposure client security.
* **Server-Side Keys**: Injected via Supabase Edge Function Secrets (`GROQ_API_KEY`, `SCRAPER_API_KEY`).
