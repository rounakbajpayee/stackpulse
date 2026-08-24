# ADR-007: Multi-Tier Zero-Cost Waterfall and Graceful Degradation

## Status
**Accepted & Implemented**

## Context
Enriching thousands of early-stage startups via paid residential scraping proxies (e.g. ScraperAPI, BrightData) incurs extreme credit costs ($0.01 to $0.05 per company) and is vulnerable to API quota depletion. A naive implementation that attempts to scrape Google search results for every single account burns 50,000+ API credits in hours.

## Decision
We implemented a hierarchical 5-tier zero-cost waterfall that prioritizes direct, free signals before invoking paid scraping proxies:
1. **Tier 1 (0 Credits)**: DNS Resolution via `node:dns`.
2. **Tier 2 (0 Credits)**: Direct GitHub Monorepos (`raw.githubusercontent.com` checking `package.json`, `prisma/schema.prisma`, `docker-compose.yml`).
3. **Tier 3 (0 Credits)**: Public ATS Job Boards REST API (Ashby `api.ashbyhq.com` & Greenhouse `boards-api.greenhouse.io` job requirements + Groq LLM parsing).
4. **Tier 4 (0 Credits)**: Frontend JS SDK bundle signature inspection (`@supabase/supabase-js`, `firebaseapp.com`, `mongodb.net`).
5. **Tier 5 (Conditional)**: Scraper proxy + Google SERP extraction.

**Graceful Degradation**: If ScraperAPI keys are depleted or missing, the pipeline does not halt or fail. It tags the verified free signals, marks the scan depth as `surface_free`, and continues processing.

## Consequences
* **Cost Efficiency**: Over 85% of tech stacks are detected using 100% free signal tiers.
* **Resilience**: The pipeline runs continuously without hard-pauses or blocking on third-party quotas.
