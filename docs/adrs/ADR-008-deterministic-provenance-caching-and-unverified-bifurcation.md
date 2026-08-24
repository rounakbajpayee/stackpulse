# ADR-008: Deterministic Provenance Caching & Unverified Account Bifurcation

## Status
**Accepted & Implemented**

## Context
When startups have no publicly documented database stack, treating all unverified accounts as a uniform "Unknown" causes redundant API queries and wastes tokens. Furthermore, GTM teams could not distinguish between accounts that had already been exhaustively verified as dead ends versus accounts that were only partially checked on free tiers.

## Decision
We introduced a **Provenance Ledger** and bifurcated unverified startups into explicit scan depth categories:
1. **`confirmed`**: Verified stack discovered from one of the waterfall tiers.
2. **`surface_free` (Pending Deep Scrape ⚡)**: Checked only on zero-cost tiers (GitHub/ATS/Bundles). Eligible for targeted 1-click on-demand verification.
3. **`deep_scraped` (Truly Unknown 🔒)**: Exhaustively verified across all 6 tiers including search proxies with zero stack found.
4. **`unscanned`**: Awaiting initial pass.

**Smart Provenance Cache**:
* When an account is marked `deep_scraped`, on-demand auto-verification instantly returns the cached unknown status without executing proxy searches, guaranteeing **0 wasted tokens or credits**.
* When an account is `surface_free`, auto-verification reuses existing cached artifacts and executes **only the missing scraper step**.

## Consequences
* Eliminates duplicate scraping calls across all 4,504 accounts.
* Gives AEs crystal-clear visibility into actionable vs dead-end prospects.
