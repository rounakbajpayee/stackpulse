<div align="center">

# StackPulse ⚡

**Real-Time Developer Infrastructure Intelligence & GTM Account Topology Engine**  
*Monitoring 4,507 Venture-Backed Startups across Y Combinator, a16z Speedrun, and Sequoia Arc.*

[![Live Application](https://img.shields.io/badge/Live_App-stackpulse.rounakbajpayee.com-10b981?style=for-the-badge&logo=vercel&logoColor=white)](https://stackpulse.rounakbajpayee.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Database](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

[**Explore Live Dashboard ↗**](https://stackpulse.rounakbajpayee.com/) · [**Architecture Deep Dive**](./docs/ARCHITECTURE.md) · [**ADRs**](./docs/adrs/) · [**Operations Runbook**](./docs/OPERATIONS.md)

</div>

---

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ [ All Accounts ] [ Verified Stacks (811) ] [ Champions (168) ] [ Migration Targets (480) ] [ Unverified ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ Target View:  [ Supabase Postgres ▾ ]   ·   Pipeline ARR Identified:  $18.4M                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [✓]  Company & Sector     Cohort   6D Architecture Ledger     GTM Opportunity & ARR      Action        │
│ ────────────────────────────────────────────────────────────────────────────────────────────────────── │
│ [ ]  Venu AI              YC W24   PostgreSQL · pgvector · Redis [Growth Dedicated · $30k] [Dossier ↗] │
│ [ ]  Broad                YC S21   Firebase · Pinecone · Clerk   [Consolidation · $56k]     [Dossier ↗] │
│ [ ]  Affogato AI          YC W24   Unverified                 [Surface Scanned ⚡]        [Verify ⚡]    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities

### 1. 🏛️ 6-Dimension Functional Infrastructure Ontology
Decomposes every tracked company into 6 typed, orthogonal architectural layers:
* **Primary Database**: PostgreSQL, Supabase, Neon, MySQL, PlanetScale, MongoDB Atlas, AWS DynamoDB, Aurora/RDS.
* **Vector & Embeddings**: pgvector (Native), Pinecone, Qdrant, Weaviate, Milvus, Chroma.
* **Key-Value Cache**: Redis, Upstash, AWS ElastiCache.
* **Analytics / OLAP**: ClickHouse, Snowflake, BigQuery, OpenSearch / Elasticsearch.
* **Auth & Identity**: Supabase Auth, Clerk, Auth0, Firebase Auth, NextAuth.
* **Cloud Runtime**: Vercel, Cloudflare Workers, AWS Lambda / ECS, GCP Cloud Run, Fly.io.

### 2. 💰 Financial & Pricing Ontology Builder
* **Dynamic ARR Valuation**: Calculates deal sizing dynamically based on Compute Baseline (Cohort Vintage) + Tool Consolidation Add-ons (+$12k Vector, +$8k Auth, +$6k Cache) + Compliance Multipliers (+$15k for FinTech/HealthTech).
* **Interactive Sliders**: Fully user-configurable via the **Pipeline Math** modal with live, sub-3.5ms client recalculation across all 4,507 accounts.
* **Custom ARR Overrides**: Set custom dollar valuations directly on individual account dossiers.

### 3. ⚔️ Hybrid Battlecard & Technical Objection Engine
* **Deterministic Baseline ($0 / 0ms)**: Instant rule-based technical objection buster synthesized directly from the 6D ontology (e.g. Firebase NoSQL nesting counter, Pinecone dual-billing consolidation, Clerk Auth migration).
* **AI Supercharged Mode (Optional BYOK)**: 1-click **"⚡ Generate AI Battlecard"** producing customized executive deal strategies, cold outreach emails, and migration playbooks using your configured AI Inference Engine (Groq, OpenAI, Anthropic, Gemini).

### 4. 🔄 High-Frequency Autonomous Ingestion
* **3-Hour Accelerator Ingestion**: Automated `pg_cron` schedule discovering newly added YC, a16z, and Sequoia startups every 3 hours.
* **5-Tier Zero-Cost Enrichment**: Ingests technology stacks without burning proxy credits using DNS resolution, GitHub monorepos, Ashby ATS APIs, and DOM inspection.

### 5. 🛡️ Multi-Tenant Territory Sandboxing & RBAC
* **Admin Role**: Commits intelligence corrections and deletions directly to the master Supabase database.
* **Authenticated User**: Persists personal overrides, custom ARR, and territory exclusions to `user_workspaces`.
* **Guest User**: Full interactive exploratory mode isolated cleanly in browser `localStorage`.

---

## 🏗️ Project Architecture

```
stackpulse/
├── src/
│   ├── components/       # React UI Components (LandscapeTable, AccountDrawer, PipelineMathModal, etc.)
│   ├── lib/              # Core Engines (ontology.ts, router.ts, supabase.ts, workspace-store.ts)
│   └── App.tsx           # Reactive Root Application & State Engine
├── supabase/
│   ├── functions/        # Edge Functions (process-vc-pipeline, refresh-vc-lists)
│   └── migrations/       # SQL Migrations & Schema Definitions (001-011)
├── docs/
│   ├── ARCHITECTURE.md   # Enterprise Architectural Documentation
│   ├── OPERATIONS.md     # Operations Runbook & Background Cron Schedules
│   └── adrs/             # 11 Architectural Decision Records (ADR-001 - ADR-011)
├── scripts/              # High-Throughput Offline Enrichment Runner
└── vercel.json           # Global Edge Routing & SPA Rewrites
```

---

## 🚀 Quickstart & Local Development

```bash
# 1. Clone the repository
git clone https://github.com/rounakbajpayee/stackpulse.git
cd stackpulse

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Build for production
npm run build
```

---

## 📄 License
Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.
