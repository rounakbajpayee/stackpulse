# 🏛️ Architecture Decision Records (ADRs) — StackPulse

This directory documents the key technical, commercial, and architectural decisions made throughout the design, development, and deployment of **StackPulse**.

---

## 📑 Index of Decision Records

| ADR ID | Title | Status | Date | Decision Summary |
| :--- | :--- | :--- | :--- | :--- |
| [**ADR-001**](ADR-001-full-stack-pow-over-toy-script.md) | Pivot from Toy Python CLI to Full-Stack PoW Engine | `Accepted` | 2026-08-20 | Built full-stack commercial intelligence SPA over trivial API script for 10x higher outreach conversion. |
| [**ADR-002**](ADR-002-hosting-topology-cloudflare-vercel.md) | Hosting Topology: Dedicated Domain via Cloudflare & Vercel | `Accepted` | 2026-08-20 | Routed `stackpulse.rounakbajpayee.com` via Cloudflare DNS CNAME to Vercel Global Edge CDN. |
| [**ADR-003**](ADR-003-dynamic-heuristic-synthesis.md) | Dynamic Heuristic Synthesis vs. External LLM Calls | `Accepted` | 2026-08-21 | Implemented local deterministic heuristic engine (0ms latency, $0 cost, 0 downtime) over fragile LLM API calls. |
| [**ADR-004**](ADR-004-zero-state-multi-source-ingestion.md) | Zero-State Architecture & Multi-Source Ingestion | `Accepted` | 2026-08-21 | Replaced hardcoded fixtures with live multi-topic ingestion streaming (HN Live + Algolia) to Supabase Postgres. |
| [**ADR-005**](ADR-005-guest-first-supabase-auth.md) | Guest-First Auth Architecture with Admin Roles | `Accepted` | 2026-08-21 | Adopted frictionless Guest Reviewer mode with optional Supabase Auth to prevent reviewer bounce rate. |
| [**ADR-006**](ADR-006-state-reconciliation-and-chunked-postgrest-pagination.md) | State Reconciliation, Chunked PostgREST Pagination & Cloud Database Seeding | `Accepted` | 2026-08-21 | Implemented parallel chunked PostgREST pagination (bypassing 1k limit) and bi-directional state merging. |
