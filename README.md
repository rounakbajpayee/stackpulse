# ⚡ StackPulse: AI Startup Backend & Ecosystem Tracker

> **Commercial & Ecosystem Intelligence for Cloud Infrastructure.**  
> Built by **Rounak Bajpayee** as a Proof of Work (PoW) for the **Account Executive (APAC)** and **Partnerships Manager (Ecosystem)** applications at **Supabase**.

---

## 🎯 What is StackPulse?
**StackPulse** is a dual-purpose commercial intelligence engine designed to solve two core GTM challenges for developer platforms like Supabase:

1. **For Account Executives (AEs):** Identifies high-growth AI startups currently running on legacy or document databases (e.g. Firebase Firestore, DynamoDB) and calculates a **Migration Opportunity Score** based on architectural bottlenecks (e.g., lack of native SQL vector joins, split Pinecone billing). Includes 1-click tailored outbound pitch generation.
2. **For Ecosystem & VC Partnerships:** Audits venture capital accelerator cohorts (e.g. Y Combinator, a16z Speedrun, Sequoia Arc) in real time to quantify Supabase market share, track developer adoption, and unlock co-marketing / partner credit pipelines.

---

## 🏗️ Architecture & How It Works

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Live Ingestion Engine (Python / Hacker News / YC Feeds)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Multi-Vector Stack Signature Inspector                   │
│    • Client-side JS bundle detection (@supabase vs firebase) │
│    • Vector DB index detection (pgvector vs Pinecone)       │
│    • Framework profiling (Next.js, FastAPI)                 │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Database Layer (Supabase Postgres)                       │
│    • Project: stackpulse (Postgres + Auth + Realtime)       │
│    • Stored table: public.startups                          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Action Layer (Vite + React + Tailwind Frontend)           │
│    • Live Landscape Table with real-time filters            │
│    • VC Cohort Distribution Graphs                          │
│    • Slide-over AE Outbound Pitch Generator                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start (Local Setup)

### 1. Install Frontend Dependencies
```bash
cd C:\Projects\stackpulse
npm install
```

### 2. Start the Live Backend Ingestion Server
```bash
npm run server
# Running on http://127.0.0.1:8000
```

### 3. Start the Frontend Application
```bash
npm run dev
# Running on http://localhost:3000
```

---

## 🔑 Supabase Connection
This project is pre-configured with Supabase Postgres. Configuration is managed in `src/lib/supabase.ts` and `.env`:
* **Supabase Project URL:** `https://huubxklntrxcwqkoumhd.supabase.co`
* **Table:** `public.startups`

---

## 📊 Live Features
* **Live Landscape & Pipeline:** Searchable, filterable list of AI startups with stack tags (`Supabase Postgres`, `Firebase Firestore`, `Neon`, `DynamoDB`).
* **Automated AE Pitch Generator:** Click "Generate AE Pitch" on any target to see a technical breakdown of their Firestore vs. pgvector bottleneck with a pre-written, 3-line email.
* **VC Portfolio Ecosystem Breakdown:** Visual market share breakdown across Y Combinator W25, a16z Speedrun, and Sequoia Arc cohorts.
* **Live Sync Trigger:** Click *"Sync New Batch"* in the header to run live network inspection across fresh AI launches.

---

## 👨‍💻 Author
**Rounak Bajpayee**  
* Commercial Operations & Strategic Partnerships Operator  
* [LinkedIn](https://linkedin.com/in/rounakbajpayee) | [GitHub](https://github.com/rounakbajpayee) | `rounakbajpayee01@gmail.com`
