# ⚡ StackPulse: AI Startup Backend & Ecosystem Tracker

> **Commercial & Ecosystem Intelligence for Cloud Infrastructure.**  
> Built by **Rounak Bajpayee** as a Proof of Work (PoW) for the **Account Executive (APAC)** and **Partnerships Manager (Ecosystem)** applications at **Supabase**.  
> **Live Production URL:** [**https://stackpulse.rounakbajpayee.com**](https://stackpulse.rounakbajpayee.com)  
> **Comprehensive Workbook:** [**docs/PROJECT_WORKBOOK_STATUS.md**](docs/PROJECT_WORKBOOK_STATUS.md)

---

## 🎯 What is StackPulse?
**StackPulse** is a dual-purpose commercial intelligence engine designed to solve two core GTM challenges for developer platforms like Supabase:

1. **For Account Executives (AEs):** Identifies high-growth AI startups currently running on legacy or document databases (*Firebase Firestore, MongoDB Atlas, AWS DynamoDB, PlanetScale, Convex*) and calculates a **Migration Opportunity Score** based on architectural bottlenecks (e.g., lack of native SQL vector joins, split Pinecone billing). Includes 1-click tailored outbound pitch generation for **Email** and **LinkedIn / Text**.
2. **For Ecosystem & VC Partnerships:** Audits venture capital accelerator cohorts (*Y Combinator, a16z Speedrun, Sequoia Arc*) in real time to quantify Supabase market share, track developer adoption, and unlock co-marketing / partner credit pipelines with dynamic heuristic AI takeaways.

---

## 📊 Live Metrics & Data Pipeline
* **Tracked AI Startups:** **4,400+** indexed and growing in real time.
* **Supabase Market Share:** **39% – 41%** native Postgres adoption across top cohorts.
* **Active Migration Pipeline:** **2,680+** non-Postgres accounts.
* **Identified Pipeline ARR:** **$89.1M+** weighted opportunity.

---

## 🏗️ Architecture & Topology

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Multi-Source Ingestion Engine (Live HN & Algolia Feeds)  │
│    • Official Hacker News Live Feed (showstories.json)      │
│    • 24 technical search topics across rotating page offsets │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Multi-Vector Stack Signature Inspector                   │
│    • Client-side JS bundle detection (@supabase vs firebase) │
│    • Vector DB index detection (pgvector vs Pinecone/Qdrant)│
│    • Framework profiling (Next.js, FastAPI, Python)         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Database Layer (Supabase Postgres)                       │
│    • Project: stackpulse (Postgres + Auth + Realtime)       │
│    • Stored table: public.startups, public.visitor_telemetry│
│    • Autonomous 24/7 background crawling: Supabase pg_cron │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Action Layer (Vite + React + Tailwind Frontend)           │
│    • Live Landscape Table with 60fps pagination (20/page)   │
│    • 6-Stack VC Cohort Distribution (Supabase/Firebase/Mongo)│
│    • Dynamic Heuristic Synthesis Engine for VC takeaways     │
│    • Dual-channel Outreach Generator (Email vs LinkedIn)    │
│    • Guest-First Supabase Auth with Admin Role Recognition  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Setup)

### 1. Install Dependencies
```bash
git clone https://github.com/rounakbajpayee/stackpulse.git
cd stackpulse
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
# Running on http://localhost:3000
```

### 3. Build & Test Production Bundle
```bash
npm run build
```

---

## 🔑 Supabase Connection
This project is connected to Supabase Postgres:
* **Supabase Project URL:** `https://huubxklntrxcwqkoumhd.supabase.co`
* **Tables:** `public.startups`, `public.visitor_telemetry`
* **Cron Setup Script:** `supabase/cron_setup.sql`

---

## 📄 Documentation & Project Workbook
For the complete technical breakdown, mathematical formulas, scoring rubrics, and GTM playbooks, read:
👉 [**docs/PROJECT_WORKBOOK_STATUS.md**](docs/PROJECT_WORKBOOK_STATUS.md)

---

## 👨‍💻 Author
**Rounak Bajpayee**  
* Commercial Operations & Strategic Partnerships Operator  
* [LinkedIn](https://linkedin.com/in/rounakbajpayee) | [GitHub](https://github.com/rounakbajpayee) | `rounakbajpayee01@gmail.com`
