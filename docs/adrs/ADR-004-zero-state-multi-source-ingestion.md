# ADR-004: Zero-State Architecture & Multi-Source Live Ingestion

## Status
`Accepted`

## Context
Early prototypes included a static array of mock startups embedded in the client code. When a user clicked "Sync Live", it re-rendered the same static data or appended fixed batches, violating the core requirement that fresh installs should start at a clean zero-state and dynamically ingest live public databases.

Furthermore, querying a single search endpoint (e.g. Algolia Page 0) resulted in fetching duplicate items, causing the background counter to appear frozen.

## Decision
We re-architected the ingestion pipeline into a **Zero-State, Multi-Source Continuous Crawler**:
1. **Zero-State Mount:** Fresh clones start with 0 companies, $0 pipeline ARR, and a clean prompt directing the user to initiate live ingestion.
2. **Multi-Source Ingestion Engine:**
   * **Source 1 (Official Firebase Hacker News Live Feed):** Hits `https://hacker-news.firebaseio.com/v0/showstories.json` and fetches live post payloads in real time.
   * **Source 2 (Algolia HN Search with Rotating Page Offsets):** Queries 24 technical search vectors (`AI`, `LLM`, `Agent`, `Postgres`, `MongoDB`, `Firebase`, `DynamoDB`, `Vector`, `Nextjs`, `Voice AI`, `RAG`, etc.) with rotating page offsets (`page=1, 2, 3...`) to continuously discover historical and live startups.
3. **Database Upsert & Deduplication:** Normalizes company names, checks existing records, updates local React state, and performs background upserts into Supabase Postgres `public.startups`.

## Consequences
### Positive:
* No hardcoded static data in production.
* Continuous real-time expansion (indexed 4,430+ startups and growing).
* Strict name/domain deduplication prevents duplicate rows.
* Persistent cloud storage in Supabase Postgres.

### Negative:
* Requires internet connectivity to populate initial state on clean devices without prior database records.
