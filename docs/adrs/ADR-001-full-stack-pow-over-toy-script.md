# ADR-001: Pivot from Toy Python CLI to Full-Stack PoW Engine (StackPulse)

## Status
`Accepted` (Supercedes initial 14-day sprint recommendation)

## Context
The initial career intelligence sprint plan proposed building small 20-line Python scripts that made basic REST API calls to target company endpoints, displayed a terminal output, and recorded a 2-minute Loom video walking through the script.

When evaluating the specific requirements for Supabase's **Account Executive (APAC)** and **Partnerships Manager (Ecosystem)** roles, a simple terminal script had severe limitations:
1. It demonstrated only entry-level scripting without showcasing commercial strategy or pipeline modeling.
2. It failed to address the dual nature of Supabase's GTM motions (enterprise AE outbound migration vs. VC accelerator ecosystem penetration).
3. It did not create a persistent, interactive digital asset that hiring decision-makers (Nate Asp, Dan Messina) could click and explore.

## Decision
We pivoted from a toy CLI script to developing **StackPulse**—a full-stack commercial and ecosystem intelligence platform built with React, Vite, Tailwind CSS, and Supabase Postgres.

StackPulse provides:
1. **AE Outbound Migration Intelligence:** Identifies 4,400+ AI startups, models architectural bottlenecks across Firebase Firestore, MongoDB Atlas, and AWS DynamoDB, calculates a quantitative **Migration Opportunity Score**, and values a **$89.1M ARR pipeline**.
2. **VC Portfolio Market Share Audits:** Tracks real-time Postgres adoption across Y Combinator (W25/S24), a16z Speedrun, and Sequoia Arc cohorts.
3. **Dual-Channel Outreach Generator:** Produces 1-click tailored email and LinkedIn pitches.

## Consequences
### Positive:
* Provides overwhelming proof-of-work that stands out against 99% of traditional text-only applicants.
* Demonstrates deep technical fluency with Supabase products (Postgres, pgvector, Auth, Row Level Security, Realtime).
* Serves as an interactive demo for two separate 90-second Loom videos (Sales AE vs. VC Partnerships).

### Negative:
* Required higher upfront development effort compared to a 20-line Python script.
