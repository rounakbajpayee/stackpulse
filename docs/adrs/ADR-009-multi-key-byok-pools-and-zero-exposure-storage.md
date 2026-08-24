# ADR-009: Multi-Key BYOK Pools & Zero-Exposure Storage

## Status
**Accepted & Implemented**

## Context
Users need the ability to bring their own API keys (BYOK) for both LLM inference (Groq, OpenAI, Anthropic, Gemini) and Web Scraping proxies (ScraperAPI, Firecrawl). Hardcoding keys or storing them in shared unencrypted databases creates massive security vulnerabilities and quota exhaustion risks.

## Decision
1. **Partitioned Key Pools**: Separated API key management into dedicated pools for **LLM Extraction** and **Web Scraping**.
2. **Multi-Key Round-Robin & Failover**: If a scraper key hits rate limits (429) or quota limits (403/402), the runner automatically fails over to the next configured key.
3. **Zero-Exposure Storage Model**:
   * Guest and standard user keys are stored strictly in client-side `localStorage` and never logged or exposed in central databases.
   * Admin keys for background cron jobs are injected via Supabase Edge Function Secrets (`DENO_ENV`) with RLS preventing client-side inspection.

## Consequences
* Protects user API keys with zero central server leakage.
* Prevents pipeline interruptions when individual proxy keys deplete.
