# ADR-001: Reactive Full-Stack Web Application vs. Static CLI Terminal Script

## Status
`Accepted`

## Context
When architecting a real-time developer infrastructure intelligence and account topology platform, initial explorations considered building a basic Python Command-Line Interface (CLI) that executed ad-hoc REST API queries and printed formatted tables to the terminal.

However, a terminal CLI had fundamental architectural limitations for multi-competitor ecosystem intelligence:
1. **Lack of Reactive Multi-Dimensional State**: Evaluating 4,500+ startups across multiple competitive perspectives (Supabase, Neon, PlanetScale, MongoDB Atlas, ClickHouse) requires instant reactive filtering, multi-column sorting, and immediate visual recalculation of pipeline metrics that terminal output cannot provide.
2. **High-Density Account Dossiers**: Sales Engineers and GTM leaders need interactive slide-over drawers with interactive evidence inspection (GitHub configs, ATS job board snippets, JS SDK bundle traces, and battlecards).
3. **Multi-Tenant Territory Sandboxing**: Users require personalized workspace sandboxes, guest trial states, and real-time synchronization with cloud databases across devices.

## Decision
We chose to build **StackPulse** as a high-density, full-stack Single-Page Application (SPA) leveraging **React 18, TypeScript, Vite, Tailwind CSS**, and a **Supabase PostgreSQL** backend.

StackPulse provides:
1. **Dynamic Competitive Target Views**: Real-time perspective re-evaluation across 5 distinct database architectures.
2. **Visual Portfolio Intelligence**: Real-time distribution charts and automated heuristic synthesis across venture cohorts.
3. **Interactive Battlecards & Correction Modals**: Live account intelligence adjustments with instant master and user database persistence.

## Consequences
### Positive:
* Enables sub-second interactive exploration across 4,500+ accounts with zero latency.
* Supports rich visual evidence inspection and deep-linked URL sharing.
* Delivers enterprise-grade multi-tenant workspace isolation.

### Negative:
* Requires maintaining a modern frontend bundle and component architecture compared to a single-file script.
