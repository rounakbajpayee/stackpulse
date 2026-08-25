# ADR 011: Functional Infrastructure & Financial Pricing Ontology Architecture

## Status
Accepted

## Context
StackPulse initially represented company technology stacks using flat unstructured text strings (e.g. `database_stack: "PostgreSQL + Redis"`, `vector_search: "Pinecone"`). Furthermore, financial pipeline calculations relied on static Tier 1 ($36,000) and Tier 2 ($24,000) assumptions.

This created several operational limitations for enterprise Go-To-Market (GTM) teams:
1. **Inability to Model Multi-Product Consolidation**: When an account uses PostgreSQL + Pinecone + Clerk, they represent multiple vendor displacement opportunities ($12k Vector + $8k Auth + $24k Compute = $44k ARR).
2. **Coarse Filtering**: A sales team could not filter strictly by secondary architectural layers (e.g., "Find all accounts running Postgres with external Pinecone vector stores" — the primary ICP for `pgvector` adoption).
3. **Rigid Financial Math**: Users could not adjust pricing baselines according to cohort vintage, compliance requirements, or custom deal sizes.

## Decision
We adopted a dual **Functional Infrastructure & Financial Pricing Ontology** coupled with a **Hybrid Battlecard Engine**:

### 1. The 6-Dimension Functional Infrastructure Taxonomy
Every tracked startup is decomposed into 6 typed, orthogonal architectural slots:
1. **`primary_database`**: `PostgreSQL` | `Supabase Postgres` | `Neon` | `Firebase Firestore` | `MongoDB Atlas` | `PlanetScale` | `AWS DynamoDB` | `AWS Aurora/RDS` | `MySQL` | `ClickHouse` | `SQLite/DuckDB` | `Unknown`
2. **`vector_engine`**: `pgvector (Native)` | `Pinecone` | `Qdrant` | `Weaviate` | `Milvus` | `Chroma` | `None`
3. **`cache_layer`**: `Redis` | `Upstash` | `AWS ElastiCache` | `Momento` | `None`
4. **`olap_engine`**: `ClickHouse` | `Snowflake` | `BigQuery` | `OpenSearch / Elasticsearch` | `None`
5. **`auth_provider`**: `Supabase Auth` | `Clerk` | `Auth0` | `Firebase Auth` | `NextAuth` | `None`
6. **`runtime_platform`**: `Vercel` | `Cloudflare Workers` | `AWS Lambda / ECS` | `GCP Cloud Run` | `Fly.io` | `Vercel + Cloud`

### 2. User-Configurable Financial Valuation Formula
Pipeline ARR is dynamically computed via:
$$\text{Estimated ARR} = \text{Base Compute (Cohort Vintage)} + \sum(\text{Tool Consolidation Add-ons}) + \text{Compliance Multiplier (Sector)}$$

* **Vintage Baseline**:
  * Mature Series A/B+ (YC 2021 & earlier): Configurable (Default: $36,000/yr)
  * Growth Stage (YC 2022 - 2023): Configurable (Default: $24,000/yr)
  * Emerging Pro (YC 2024 - 2025): Configurable (Default: $12,000/yr)
* **Consolidation Add-ons**:
  * External Vector Store (Pinecone/Qdrant): +$12,000/yr
  * External Auth (Clerk/Auth0): +$8,000/yr
  * Key-Value Cache (Redis/ElastiCache): +$6,000/yr
* **Compliance Multiplier**:
  * Regulated Verticals (FinTech, HealthTech, LegalTech): +$15,000/yr

### 3. Hybrid Battlecard Engine
* **Deterministic Baseline ($0 / 0ms)**: Instant rule-based technical objection buster synthesized directly from the 6D ontology.
* **AI Supercharged Mode (Optional BYOK)**: 1-click generation of personalized executive strategy, cold outreach email, and migration scripts using the active AI Inference Engine (Groq, OpenAI, Anthropic, Gemini).

### 4. High-Frequency Automated Ingestion
Accelerator batch discovery runs **every 3 hours** (`0 */3 * * *`) via Supabase `pg_cron` calling `refresh-vc-lists`.

## Consequences
- **Positive**: High-resolution GTM segmentation, accurate multi-product ARR forecasting, instant zero-latency objection playbooks, and fully customizable pricing.
- **Positive**: Sub-3.5ms memoized recalculation across 4,500+ accounts ensuring fluid 60fps UI responsiveness.
- **Negative**: Adds 6 columns to `verified_startups`, managed cleanly via nullable schema migration with client-side fallback normalization.
