# ADR 006: State Reconciliation, Chunked PostgREST Pagination & Cloud Database Seeding

## Context & Problem Statement
When scaling StackPulse to monitor over 5,000+ AI startups, two critical architectural bottlenecks were identified:
1. **PostgREST 1,000-Row Default Ceiling:** PostgREST query APIs (including Supabase Cloud) enforce a default ceiling of 1,000 records per response. Calling standard `.select('*')` truncated result sets to 1,000 rows.
2. **Client State Clobbering:** On React component mount, `localStorage` contained cached startups accumulated across crawler sessions. When `loadData()` returned the truncated 1,000-row remote response, it directly overwrote React state and `localStorage`, destroying discovered records.

## Decision Drivers
* Prevent data clobbering and state loss under any network or remote condition.
* Seamlessly retrieve the complete dataset (5,000+ to 10,000+ rows) without blocking browser UI rendering.
* Guarantee that local offline or newly discovered discoveries are bidirectionally merged and synced to Supabase Cloud.

## Considered Options
1. **Server-side only cursor pagination:** Only fetch 20 records at a time per page.
   * *Pros:* Low initial payload.
   * *Cons:* Destroys real-time client-side calculation of executive KPIs (total ARR, market share percentages across all 5,000+ companies, multi-filter search).
2. **Chunked Parallel PostgREST Pagination + Bi-directional State Reconciliation (Selected):**
   * Perform initial `.select('*', { count: 'exact' }).range(0, 999)` to capture exact total count.
   * Calculate page batches (`1000-1999`, `2000-2999`, etc.) and fetch in parallel via `Promise.all`.
   * Reconcile remote cloud data with local storage cache by normalized company name / ID.
   * Sync any unsynced local discoveries back to Supabase Cloud in the background.

## Decision Outcome
Adopted Option 2.

### Positive Consequences
* Instant, accurate KPI computations across 7,400+ live records.
* Refreshing the browser preserves all 5,000+ startups without dropping or flickering.
* Fully backward compatible with client-side 20/page table rendering.
