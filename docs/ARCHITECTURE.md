# StackPulse Enterprise System Architecture

**StackPulse** is a high-density, real-time Go-To-Market (GTM) Intelligence and Account Topology Engine built for Enterprise Infrastructure and Developer Tool teams (specifically optimized for Supabase GTM, Neon, PlanetScale, MongoDB Atlas, and ClickHouse).

It monitors **4,504 venture-backed startups** across Y Combinator, a16z Speedrun, and Sequoia Arc, extracting their internal database, caching, analytics, and vector infrastructure with high architectural fidelity.

---

## 1. High-Level System Architecture

```mermaid
graph TD
    subgraph Ingestion & Waterfall Engine
        VC[VC Portfolios & Monorepos] --> T1[Tier 1: Free DNS Resolution]
        T1 --> T2[Tier 2: Direct GitHub Configs]
        T2 --> T3[Tier 3: Public ATS Job APIs]
        T3 --> T4[Tier 4: Client JS SDK Bundles]
        T4 --> T5[Tier 5: Scraper Proxy + AI LLM Inference]
    end

    subgraph Data & Provenance Layer
        T2 & T3 & T4 & T5 --> Prov[Provenance Ledger Engine]
        Prov --> Master[(Supabase Master DB: verified_startups)]
        Prov --> Cache[(Provenance Cache: Depth & Tiers)]
    end

    subgraph 6D Functional & Financial Ontology
        Master --> OntNorm[6D Infrastructure Normalizer]
        OntNorm --> FinCalc[Dynamic ARR Valuation Formula]
        FinCalc --> Battlecard[Hybrid Battlecard Engine]
    end

    subgraph Client Experience & RBAC
        FinCalc --> App[Vite / React SPA Dashboard]
        App --> Lens[Dynamic GTM Perspective Engine]
        Lens --> SupabaseView[Target View: Supabase]
        Lens --> NeonView[Target View: Neon]
        Lens --> MongoView[Target View: MongoDB]
        
        App --> DeltaStore{User Role Resolution}
        DeltaStore -->|Admin| MasterWrite[Direct Master DB Commits]
        DeltaStore -->|Standard User| UserDelta[(Supabase user_workspaces)]
        DeltaStore -->|Guest| LocalDelta[Browser localStorage]
    end
```

---

## 2. The 6-Dimension Functional Infrastructure Ontology

Rather than storing unstructured text tags, StackPulse standardizes each account into **6 orthogonal, typed infrastructure dimensions**:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 🏛️ Functional Infrastructure Taxonomy                                                 │
├──────────────────────────────────────┬─────────────────────────────────────────────────┤
│ Dimension                            │ Standardized Providers & Taxonomy Values        │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 1. Primary Operational Database     │ PostgreSQL | Supabase | Neon | MySQL            │
│                                      │ PlanetScale | MongoDB | DynamoDB | Aurora/RDS   │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 2. Vector & Embeddings Engine        │ pgvector (Native) | Pinecone | Qdrant           │
│                                      │ Weaviate | Milvus | Chroma | None               │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 3. Key-Value & Caching Layer         │ Redis | Upstash | AWS ElastiCache | None        │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 4. Analytics & OLAP Engine           │ ClickHouse | Snowflake | BigQuery | OpenSearch  │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 5. Auth & Identity Provider          │ Supabase Auth | Clerk | Auth0 | NextAuth        │
├──────────────────────────────────────┼─────────────────────────────────────────────────┤
│ 6. Cloud Runtime & Hosting           │ Vercel | Cloudflare Workers | AWS Lambda/ECS    │
└──────────────────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Financial & Pricing Valuation Formula

StackPulse models account pipeline ARR dynamically based on real-world infrastructure billing metrics:

$$\text{Estimated ARR} = \text{Base Compute (Cohort Vintage)} + \sum(\text{Tool Consolidation Add-ons}) + \text{Compliance Multiplier (Sector)}$$

```mermaid
graph LR
    Cohort[Cohort Vintage: W21 vs W25] --> Base[1. Compute Baseline: $12k - $36k]
    Vector[Pinecone / Qdrant Detected] --> VecAdd[2. Vector Consolidation: +$12k]
    Auth[Clerk / Auth0 Detected] --> AuthAdd[3. Auth MAU Consolidation: +$8k]
    Cache[Redis / ElastiCache Detected] --> CacheAdd[4. Cache Consolidation: +$6k]
    Fintech[Regulated Sector: Fintech/Health] --> SecAdd[5. Compliance Multiplier: +$15k]

    Base & VecAdd & AuthAdd & CacheAdd & SecAdd --> TotalARR[Modeled Account Contract ARR]
```

* **Interactive Customization**: All compute vintage baselines and tool consolidation values are user-configurable via the **Pipeline Math** modal with live recalculations across all 4,504 accounts.

---

## 4. The Hybrid Battlecard Engine

```mermaid
graph TD
    Account[Account Selected in Dossier] --> CheckKey{Active AI Key Configured in BYOK?}
    
    CheckKey -->|No Key / Default| DetEngine[Deterministic Ontology Engine]
    DetEngine --> FastBattlecard[Instant 0ms Architecture Battlecard & Objection Buster]
    
    CheckKey -->|Groq / OpenAI / Claude / Gemini| HybridOption[Render Deterministic + '⚡ Generate AI Battlecard' Button]
    HybridOption -->|User Clicks Generate| LLMPrompt[Inject Full 6D Profile into AI Inference Engine]
    LLMPrompt --> AIBattlecard[Custom Tailored Executive Deal Strategy, Cold Email & Migration Playbook]
```

---

## 5. Multi-Tenant Territory Isolation & RBAC

```mermaid
graph TD
    Master[(Supabase Master DB: 4,504 Records)] --> App[Client Application]
    
    subgraph Role Resolution
        App --> UserType{Is Authenticated?}
        UserType -->|No / Guest| GuestDelta[Local Workspace Delta: Browser localStorage]
        UserType -->|Yes / User| CloudDelta[Cloud Workspace Delta: user_workspaces Table]
        UserType -->|Yes / Admin| AdminMaster[Master DB Mutation: verified_startups Table]
    end
    
    Master --> Overlay[Delta Layer Engine]
    GuestDelta & CloudDelta --> Overlay
    Overlay --> Rendered[Active Filtered & Formatted Territory View]
```

---

## 6. Edge Infrastructure & Autonomous Ingestion Cadence

* **Front-End SPA**: Hosted on Vercel Global Edge Network with client-side SPA rewrites (`vercel.json`).
* **Accelerator Scraper**: Scheduled **every 3 hours** (`0 */3 * * *`) via Supabase `pg_cron` calling `refresh-vc-lists`.
* **Queue Enrichment Engine**: Runs **every 2 minutes** via `process-vc-pipeline` to process pending startups in batches of 10.
