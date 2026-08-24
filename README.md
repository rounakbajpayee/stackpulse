<div align="center">

# StackPulse ⚡

**Real-Time Developer Infrastructure Intelligence & GTM Account Topology Engine**  
*Monitoring 4,504 Venture-Backed Startups across Y Combinator, a16z Speedrun, and Sequoia Arc.*

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
│ Target View:  [ Supabase Postgres ▾ ]   ·   Pipeline ARR Identified:  $17.3M                           │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ [✓]  Company & Sector     Cohort   Database Architecture      Provenance & GTM           Action        │
│ ────────────────────────────────────────────────────────────────────────────────────────────────────── │
│ [ ]  Venu AI              YC W24   PostgreSQL + Redis         [Confirmed Stack]          [Dossier ↗]   │
│ [ ]  Broad                YC S21   Firebase Firestore         [High Opportunity · $36k]  [Dossier ↗]   │
│ [ ]  Affogato AI          YC W24   Unverified                 [Surface Scanned ⚡]        [Verify ⚡]    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Key Capabilities

### 1. Dynamic Competitive Target View Lens
Switching the **Target View** instantly re-evaluates all 4,504 companies from that provider's competitive perspective:
* **Supabase Postgres**: Highlights Firebase / DynamoDB / MongoDB users as prime displacement targets; surfaces PostgreSQL + pgvector champions.
* **Neon**: Targets fixed-instance AWS RDS/Aurora Postgres for serverless auto-scaling and branching.
* **PlanetScale**: Identifies MySQL / Aurora workloads bottlenecked by schema migration downtime.
* **MongoDB Atlas**: Surfaces document and vector search migration candidates.
* **ClickHouse**: Isolates companies running analytical queries over PostgreSQL/Elasticsearch that require columnar sub-second OLAP.

### 2. The 5-Tier Zero-Cost Enrichment Waterfall
Avoids burning thousands of paid proxy credits through a hierarchical discovery sequence:
1. **Tier 1 (0 Credits)**: DNS Resolution via `node:dns`.
2. **Tier 2 (0 Credits)**: Direct GitHub Monorepos (`raw.githubusercontent.com` checking `package.json`, `prisma/schema.prisma`, `docker-compose.yml`).
3. **Tier 3 (0 Credits)**: Public ATS Job Boards REST API (Ashby & Greenhouse job descriptions + Groq LLM parsing).
4. **Tier 4 (0 Credits)**: Frontend JS SDK bundle signature inspection (`@supabase/supabase-js`, `firebaseapp.com`, `mongodb.net`).
5. **Tier 5 (Conditional)**: ScraperAPI proxy + Google SERP extraction (gracefully skipped if keys deplete).

### 3. Smart Provenance Caching & Unverified Account Bifurcation
* **`⚡ Pending Deep Scrape (Surface Scanned)`**: Accounts checked across all zero-cost tiers where the search proxy step was skipped. Eligible for 1-click on-demand verification.
* **`🔒 Truly Unknown (Exhaustive Scan)`**: Accounts exhaustively checked across all 6 tiers with zero public stack found. Permanently cached at **0 token and credit cost**.

### 4. Company Intelligence Correction Modal
* Edit any account's **Database Architecture**, **Vector Layer**, **Website URL**, **Industry**, and **Framework** directly from the UI with real-time master and cloud delta sync.

### 5. Multi-Key BYOK Pools (LLM + Scraper)
* Multi-key pools for **Groq**, **OpenAI**, **Anthropic**, and **Google Gemini** with custom prompt engineering.
* Multi-key proxy rotation for **ScraperAPI** and **Firecrawl** with automatic failover.
* Zero-exposure client storage (`localStorage`) for public and standard users.

### 6. Multi-Tenant RBAC & Cross-Device Cloud Sync
* **Admin Role**: Writes directly to canonical `verified_startups` in Supabase (updating the default view for all global visitors).
* **Standard Logged-in Users**: Territory customizations sync to `user_workspaces` in Supabase across devices.
* **Guest Users**: Session lives in `localStorage` with non-intrusive cloud sync toasts.

### 7. Path-Based Routing & SPA Topology
* Supports shareable URLs: `/supabase`, `/neon`, `/planetscale`, `/mongodb`, `/clickhouse`.
* Deep-linking query params: `?tab=cohorts`, `?status=migration`, `?account=venu-ai`.

---

## 🛠️ Tech Stack

* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
* **Backend & Database**: Supabase (PostgreSQL, Row Level Security, pg_cron, pg_net, Edge Functions)
* **Inference Engine**: Groq (`openai/gpt-oss-20b`), OpenAI GPT-4o, Google Gemini
* **Hosting**: Vercel Edge with SPA rewrites (`vercel.json`)

---

## 📦 Getting Started Locally

```bash
# 1. Clone the repository
git clone https://github.com/rounakbajpayee/stackpulse.git
cd stackpulse

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

---

## 📜 Architectural Decision Records (ADRs)

Key architectural decisions are documented in [`docs/adrs/`](./docs/adrs/):
* **[ADR-001](./docs/adrs/ADR-001-full-stack-architecture-over-cli-script.md)**: Full-Stack Architecture vs. CLI Script
* **[ADR-007](./docs/adrs/ADR-007-multi-tier-zero-cost-waterfall-and-graceful-degradation.md)**: Multi-Tier Zero-Cost Waterfall
* **[ADR-008](./docs/adrs/ADR-008-deterministic-provenance-caching-and-unverified-bifurcation.md)**: Deterministic Provenance Caching
* **[ADR-009](./docs/adrs/ADR-009-multi-key-byok-pools-and-zero-exposure-storage.md)**: Multi-Key BYOK Pools
* **[ADR-010](./docs/adrs/ADR-010-path-based-routing-deep-linking-and-spa-rewrites.md)**: Path-Based Routing & SPA Rewrites

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE). Designed for Enterprise Infrastructure Go-To-Market and Ecosystem Intelligence.
