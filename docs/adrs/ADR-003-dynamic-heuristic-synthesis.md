# ADR-003: Dynamic Heuristic AI Synthesis vs. External LLM API Calls

## Status
`Accepted`

## Context
In the **VC Portfolio Breakdown** tab, we needed to provide executive takeaways analyzing Postgres market share, competitor document store fragmentation, and migration opportunities across YC W25, a16z Speedrun, and Sequoia Arc.

We evaluated two architectural approaches for generating these takeaways:
1. **Option A: External LLM API Integration (OpenAI / Gemini / Groq via Supabase Edge Functions):**
   * *Drawbacks:* Introduces 2–3 seconds of latency on every page load/sync, costs money per token, introduces external dependency risk (API key expiration, rate limits), and risks generating hallucinations or unverified numbers.
2. **Option B: Deterministic Dynamic Heuristic Synthesis Engine (Client-Side):**
   * *Advantages:* Evaluates the exact live mathematical percentages of the ingested batch in real-time, executing deterministic synthesis rules.

## Decision
We implemented a **Dynamic Heuristic Synthesis Engine** directly within `src/components/VCPortfolioCharts.tsx`.

The engine inspects:
* `supabasePct`: If $\ge 40\%$, synthesizes Postgres market leadership and pgvector co-location insights.
* `legacyDocPct` (Firestore + MongoDB): If $\ge 30\%$, flags the "Double-Hop Vector Deficit" (Pinecone + Firestore/Mongo double billing) and identifies active AE migration targets.
* `dynamoPct`: If $\ge 10\%$, identifies DynamoDB partition key constraints on agent conversational memory.

## Consequences
### Positive:
* **0ms Latency:** Renders instantly alongside React DOM updates.
* **$0 Cost:** No third-party LLM API bills.
* **100% Reliable:** Zero risk of API outages or rate limit errors during live Loom recordings or reviewer audits.
* **Mathematically Rigorous:** The text matches the exact chart data points without hallucination.

### Negative:
* Does not possess open-ended creative prose generation beyond the heuristic rule matrix.
