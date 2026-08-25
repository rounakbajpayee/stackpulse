import { 
  Startup, 
  TargetView, 
  FunctionalOntology, 
  FinancialAssumptions, 
  BattlecardPayload,
  ApiKeysConfig 
} from './types';

export const DEFAULT_FINANCIAL_ASSUMPTIONS: FinancialAssumptions = {
  matureComputeArr: 36000,
  growthComputeArr: 24000,
  earlyComputeArr: 12000,
  vectorConsolidationArr: 12000,
  authConsolidationArr: 8000,
  cacheConsolidationArr: 6000,
  regulatedSectorMultiplier: 15000,
};

export interface CompanyArrBreakdown {
  vintageStage: 'Mature Series A/B+' | 'Growth Dedicated' | 'Emerging Pro';
  vintageLabel: string;
  computeBase: number;
  vectorAddon: number;
  vectorLabel?: string;
  authAddon: number;
  authLabel?: string;
  cacheAddon: number;
  cacheLabel?: string;
  complianceMultiplier: number;
  complianceLabel?: string;
  totalArr: number;
  isChampion: boolean;
  isCustomOverride: boolean;
}

// 1. Deterministic 6-Dimension Functional Ontology Normalizer
export function normalizeFunctionalOntology(startup: Startup): FunctionalOntology {
  const stack = (startup.database_stack || '').toLowerCase();
  const vectorRaw = (startup.vector_search || '').toLowerCase();

  // 1. Primary Operational Database
  let primaryDb = startup.primary_database || 'Unknown';
  if (primaryDb === 'Unknown' || !primaryDb) {
    if (stack.includes('supabase')) primaryDb = 'Supabase Postgres';
    else if (stack.includes('postgres') || stack.includes('postgresql')) primaryDb = 'PostgreSQL';
    else if (stack.includes('firebase') || stack.includes('firestore')) primaryDb = 'Firebase Firestore';
    else if (stack.includes('mongo')) primaryDb = 'MongoDB Atlas';
    else if (stack.includes('planetscale')) primaryDb = 'PlanetScale';
    else if (stack.includes('dynamodb')) primaryDb = 'AWS DynamoDB';
    else if (stack.includes('aurora') || stack.includes('rds')) primaryDb = 'AWS Aurora / RDS';
    else if (stack.includes('mysql')) primaryDb = 'MySQL';
    else if (stack.includes('clickhouse')) primaryDb = 'ClickHouse';
    else if (stack.includes('sqlite') || stack.includes('duckdb')) primaryDb = 'SQLite / DuckDB';
    else primaryDb = 'Unknown';
  }

  // 2. Vector & Embeddings Engine
  let vector = startup.vector_engine || 'None';
  if (vector === 'None' || !vector) {
    if (vectorRaw.includes('pgvector') || stack.includes('pgvector')) vector = 'pgvector (Native)';
    else if (vectorRaw.includes('pinecone') || stack.includes('pinecone')) vector = 'Pinecone';
    else if (vectorRaw.includes('qdrant') || stack.includes('qdrant')) vector = 'Qdrant';
    else if (vectorRaw.includes('weaviate') || stack.includes('weaviate')) vector = 'Weaviate';
    else if (vectorRaw.includes('milvus') || stack.includes('milvus')) vector = 'Milvus';
    else if (vectorRaw.includes('chroma') || stack.includes('chroma')) vector = 'Chroma';
    else vector = 'None';
  }

  // 3. Key-Value & Caching Layer
  let cache = startup.cache_layer || 'None';
  if (cache === 'None' || !cache) {
    if (stack.includes('upstash')) cache = 'Upstash';
    else if (stack.includes('elasticache')) cache = 'AWS ElastiCache';
    else if (stack.includes('redis')) cache = 'Redis';
    else cache = 'None';
  }

  // 4. Analytics & OLAP Engine
  let olap = startup.olap_engine || 'None';
  if (olap === 'None' || !olap) {
    if (stack.includes('clickhouse')) olap = 'ClickHouse';
    else if (stack.includes('snowflake')) olap = 'Snowflake';
    else if (stack.includes('bigquery')) olap = 'BigQuery';
    else if (stack.includes('elasticsearch') || stack.includes('opensearch')) olap = 'OpenSearch / Elasticsearch';
    else olap = 'None';
  }

  // 5. Auth & Identity Provider
  let auth = startup.auth_provider || 'None';
  if (auth === 'None' || !auth) {
    if (stack.includes('clerk')) auth = 'Clerk';
    else if (stack.includes('auth0')) auth = 'Auth0';
    else if (stack.includes('supabase auth')) auth = 'Supabase Auth';
    else if (stack.includes('firebase auth')) auth = 'Firebase Auth';
    else if (stack.includes('nextauth') || stack.includes('better auth')) auth = 'NextAuth';
    else auth = 'None';
  }

  // 6. Cloud Runtime & Hosting
  let runtime = startup.runtime_platform || 'None';
  if (runtime === 'None' || !runtime) {
    if (stack.includes('vercel')) runtime = 'Vercel';
    else if (stack.includes('cloudflare')) runtime = 'Cloudflare Workers';
    else if (stack.includes('aws') || stack.includes('lambda')) runtime = 'AWS Lambda / ECS';
    else if (stack.includes('fly.io')) runtime = 'Fly.io';
    else runtime = 'Vercel + Cloud';
  }

  return {
    primary_database: primaryDb,
    vector_engine: vector,
    cache_layer: cache,
    olap_engine: olap,
    auth_provider: auth,
    runtime_platform: runtime,
  };
}

// 2. Full Structured Breakdown of Pricing Breakdown Formula
export function getCompanyArrBreakdown(
  startup: Startup, 
  assumptions: FinancialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS, 
  targetView: TargetView = 'supabase'
): CompanyArrBreakdown {
  const ontology = normalizeFunctionalOntology(startup);
  const primaryDb = ontology.primary_database;

  let isChampion = false;
  let isTarget = false;

  if (targetView === 'supabase') {
    isChampion = primaryDb.includes('Supabase') || (primaryDb.includes('Postgres') && ontology.vector_engine.includes('pgvector'));
    isTarget = !isChampion && primaryDb !== 'Unknown';
  } else if (targetView === 'neon') {
    isChampion = primaryDb.includes('Neon');
    isTarget = primaryDb.includes('RDS') || primaryDb.includes('Aurora') || primaryDb.includes('PostgreSQL');
  } else if (targetView === 'planetscale') {
    isChampion = primaryDb.includes('PlanetScale');
    isTarget = primaryDb.includes('MySQL') || primaryDb.includes('Aurora');
  } else if (targetView === 'mongodb') {
    isChampion = primaryDb.includes('MongoDB');
    isTarget = primaryDb.includes('Firestore') || primaryDb.includes('DynamoDB');
  } else if (targetView === 'clickhouse') {
    isChampion = primaryDb.includes('ClickHouse');
    isTarget = ontology.olap_engine.includes('Elasticsearch') || ontology.olap_engine.includes('Snowflake') || primaryDb.includes('PostgreSQL');
  }

  if (isChampion || !isTarget) {
    return {
      vintageStage: 'Emerging Pro',
      vintageLabel: 'Retained Native Champion',
      computeBase: 0,
      vectorAddon: 0,
      authAddon: 0,
      cacheAddon: 0,
      complianceMultiplier: 0,
      totalArr: 0,
      isChampion: true,
      isCustomOverride: false,
    };
  }

  if (typeof startup.custom_arr_override === 'number' && startup.custom_arr_override >= 0) {
    return {
      vintageStage: 'Growth Dedicated',
      vintageLabel: 'Manual Custom Contract Override',
      computeBase: startup.custom_arr_override,
      vectorAddon: 0,
      authAddon: 0,
      cacheAddon: 0,
      complianceMultiplier: 0,
      totalArr: startup.custom_arr_override,
      isChampion: false,
      isCustomOverride: true,
    };
  }

  const batch = (startup.yc_batch || startup.batch || startup.category || '').toLowerCase();
  let vintageStage: 'Mature Series A/B+' | 'Growth Dedicated' | 'Emerging Pro' = 'Emerging Pro';
  let vintageLabel = 'Emerging Pro Sizing (YC 2024 - 2025)';
  let computeBase = assumptions.earlyComputeArr;

  if (batch.includes('w1') || batch.includes('s1') || batch.includes('w20') || batch.includes('s20') || batch.includes('w21') || batch.includes('s21') || batch.includes('2021')) {
    vintageStage = 'Mature Series A/B+';
    vintageLabel = 'Mature Dedicated 4XL Sizing (YC 2021 & earlier)';
    computeBase = assumptions.matureComputeArr;
  } else if (batch.includes('w22') || batch.includes('s22') || batch.includes('w23') || batch.includes('s23') || batch.includes('2022') || batch.includes('2023')) {
    vintageStage = 'Growth Dedicated';
    vintageLabel = 'Growth Dedicated 2XL Sizing (YC 2022 - 2023)';
    computeBase = assumptions.growthComputeArr;
  }

  let vectorAddon = 0;
  let vectorLabel: string | undefined;
  if (['Pinecone', 'Qdrant', 'Weaviate', 'Milvus', 'Chroma'].includes(ontology.vector_engine)) {
    vectorAddon = assumptions.vectorConsolidationArr;
    vectorLabel = `Displacing external ${ontology.vector_engine} to pgvector`;
  }

  let authAddon = 0;
  let authLabel: string | undefined;
  if (['Clerk', 'Auth0', 'Firebase Auth'].includes(ontology.auth_provider)) {
    authAddon = assumptions.authConsolidationArr;
    authLabel = `Consolidating ${ontology.auth_provider} MAU billing`;
  }

  let cacheAddon = 0;
  let cacheLabel: string | undefined;
  if (['Redis', 'Upstash', 'AWS ElastiCache'].includes(ontology.cache_layer)) {
    cacheAddon = assumptions.cacheConsolidationArr;
    cacheLabel = `Consolidating ${ontology.cache_layer} instance`;
  }

  let complianceMultiplier = 0;
  let complianceLabel: string | undefined;
  const ind = (startup.industry || '').toLowerCase();
  if (ind.includes('fintech') || ind.includes('health') || ind.includes('legal') || ind.includes('security') || ind.includes('compliance')) {
    complianceMultiplier = assumptions.regulatedSectorMultiplier;
    complianceLabel = `${startup.industry || 'Regulated Sector'} SOC2 / HIPAA Isolation SLA`;
  }

  const totalArr = computeBase + vectorAddon + authAddon + cacheAddon + complianceMultiplier;

  return {
    vintageStage,
    vintageLabel,
    computeBase,
    vectorAddon,
    vectorLabel,
    authAddon,
    authLabel,
    cacheAddon,
    cacheLabel,
    complianceMultiplier,
    complianceLabel,
    totalArr,
    isChampion: false,
    isCustomOverride: false,
  };
}

// 3. Dynamic Financial Pricing Valuation Formula
export function calculateCompanyArr(
  startup: Startup, 
  assumptions: FinancialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS, 
  targetView: TargetView = 'supabase'
): number {
  return getCompanyArrBreakdown(startup, assumptions, targetView).totalArr;
}

// 4. Instant Deterministic Technical Objection & Migration Battlecard Synthesizer (0ms / $0 Cost)
export function synthesizeDeterministicBattlecard(
  startup: Startup,
  targetView: TargetView = 'supabase',
  modeledArr: number
): BattlecardPayload {
  const ontology = normalizeFunctionalOntology(startup);
  const { primary_database, vector_engine, auth_provider, cache_layer } = ontology;
  const db = primary_database.toLowerCase();

  let friction: 'Low' | 'Medium' | 'High' | 'Zero (Champion)' = 'Medium';
  let primaryObjection = '';
  let objectionBuster = '';
  let strategicAngle = '';
  let isChampionAccount = false;
  const tacticalAddons: string[] = [];

  // ==========================================
  // 1. SUPABASE TARGET VIEW
  // ==========================================
  if (targetView === 'supabase') {
    if (primary_database.includes('Supabase') || (primary_database.includes('Postgres') && vector_engine.includes('pgvector'))) {
      isChampionAccount = true;
      friction = 'Zero (Champion)';
      primaryObjection = '"We already run Supabase in production and are satisfied with our current tier."';
      objectionBuster = 'Proactively offer dedicated Enterprise Solutions Architecture, Point-in-Time Recovery (PITR), Read Replicas, and SOC2/HIPAA compliance packages to secure long-term platform retention and ARR expansion.';
      strategicAngle = 'Upsell from standard Pro plan to Enterprise Dedicated Compute with 99.99% uptime SLA and tailored vector indexing optimization.';
    } else if (db.includes('firebase') || db.includes('firestore')) {
      friction = 'Medium';
      primaryObjection = '"We heavily rely on Firebase real-time document listeners, client SDK reactivity, and Firestore security rules."';
      objectionBuster = 'Supabase Realtime provides instant websocket broadcasting with PostgreSQL Row Level Security (RLS), replacing Firebase security rules with enterprise SQL ACID transactions.';
      strategicAngle = 'Eliminate NoSQL relational query workarounds, avoid deep query nesting penalties, and save up to 60% on high-read document charges.';
    } else if (db.includes('mongo')) {
      friction = 'Medium';
      primaryObjection = '"Our application relies on dynamic JSON document flexibility without upfront schema migrations."';
      objectionBuster = 'PostgreSQL JSONB provides GIN-indexed schema agility with the ability to perform relational joins, ACID transactions, and native pgvector embeddings.';
      strategicAngle = 'Cut database compute overhead by 50% while scaling read replicas and co-located vector search without separate search cluster fees.';
    } else if (db.includes('dynamodb')) {
      friction = 'High';
      primaryObjection = '"We designed our entire backend around DynamoDB single-table composite partition keys and GSI indices."';
      objectionBuster = 'PostgreSQL eliminates complex single-table query workarounds, unbounded scan cost penalties, and 400KB item size limits.';
      strategicAngle = 'Unblock multi-tenant data analytics and LLM context graphs with standard SQL without maintaining cumbersome secondary partition indices.';
    } else if (db.includes('rds') || db.includes('aurora') || db.includes('postgres')) {
      friction = 'Low';
      primaryObjection = '"We already run managed PostgreSQL on AWS RDS/Aurora with established Terraform and VPC peering."';
      objectionBuster = 'AWS RDS/Aurora charges premium fixed I/O pricing and requires separate services for Auth, Vector DB, Storage, and Realtime. Supabase provides the entire developer data stack with built-in pgvector, Auth, and instant database branching.';
      strategicAngle = 'Consolidate 4 separate vendor bills (RDS + Clerk + Pinecone + S3) into a unified managed Postgres platform with automated branching.';
    } else if (db.includes('planetscale') || db.includes('mysql')) {
      friction = 'Medium';
      primaryObjection = '"Our ORM and schema are built around MySQL dialect and storage engines."';
      objectionBuster = 'PostgreSQL is the industry standard for modern AI and enterprise SaaS, offering superior JSONB performance, native array types, and pgvector.';
      strategicAngle = 'Migrate with automated pgloader tools to unlock pgvector and rich PostgreSQL extension ecosystem.';
    } else if (db.includes('sqlite') || db.includes('duckdb')) {
      friction = 'Low';
      primaryObjection = '"We use embedded SQLite / DuckDB files for zero-network latency in local development and edge worker instances."';
      objectionBuster = 'Embedded SQLite creates concurrency bottlenecks during multi-user write spikes and lacks point-in-time cloud backups. Supabase gives microsecond connection pooling and instant branching.';
      strategicAngle = 'Graduate from single-file embedded databases to production-grade distributed PostgreSQL with instant edge caching.';
    } else {
      friction = 'Low';
      primaryObjection = '"Our internal infrastructure topology is private and not publicly indexed."';
      objectionBuster = 'Supabase open-source local development CLI (supabase start) allows engineering teams to spin up PostgreSQL, Auth, and pgvector locally in under 30 seconds.';
      strategicAngle = 'Run a zero-risk 1-week pilot with Supabase CLI and evaluate migration benchmarks against existing private infra.';
    }

    // Add tactical tool consolidation busters
    if (['Pinecone', 'Qdrant', 'Weaviate', 'Milvus', 'Chroma'].includes(vector_engine)) {
      tacticalAddons.push(`Displace external ${vector_engine} to co-located pgvector: cuts 150ms network hop and eliminates ~$12k/yr vector SaaS subscription.`);
    }
    if (['Clerk', 'Auth0', 'Firebase Auth'].includes(auth_provider)) {
      tacticalAddons.push(`Consolidate ${auth_provider} into Supabase Auth: eliminates per-MAU billing markups with direct PostgreSQL RLS integration.`);
    }
    if (['Redis', 'Upstash', 'AWS ElastiCache'].includes(cache_layer)) {
      tacticalAddons.push(`Consolidate ${cache_layer} into PostgreSQL Unlogged tables and Supabase Realtime websocket channels.`);
    }
  }

  // ==========================================
  // 2. NEON TARGET VIEW (Postgres Serverless)
  // ==========================================
  else if (targetView === 'neon') {
    if (db.includes('neon')) {
      isChampionAccount = true;
      friction = 'Zero (Champion)';
      primaryObjection = '"We already run Neon for our development and staging database branches."';
      objectionBuster = 'Expand to Neon Enterprise autoscaling compute (up to 32 vCPUs) and production multi-region read replicas with dedicated SLA.';
      strategicAngle = 'Graduate development branches to production workloads with autoscaling and zero cold-start latency.';
    } else if (db.includes('rds') || db.includes('aurora')) {
      friction = 'Low';
      primaryObjection = '"We provisioned fixed instance sizes in AWS RDS / Aurora."';
      objectionBuster = 'Fixed RDS instances waste up to 70% of spend on idle compute during non-peak hours. Neon scales compute to zero when idle and scales instantly under burst traffic.';
      strategicAngle = 'Enable copy-on-write instant database branching for every developer PR, accelerating CI/CD pipeline velocity 10x.';
    } else if (db.includes('postgres') || db.includes('supabase')) {
      friction = 'Low';
      primaryObjection = '"We need continuous database connection pooling and fast database branching."';
      objectionBuster = 'Neon decouples storage and compute using Page Server architecture, creating instant lightweight database clones in under 500ms.';
      strategicAngle = 'Slash dev/staging database spend by 90% with automated scale-to-zero compute.';
    } else {
      friction = 'Medium';
      primaryObjection = '"We manage fixed relational database instances."';
      objectionBuster = 'Neon serverless architecture eliminates capacity planning and auto-scales compute up to 32 vCPUs on demand.';
      strategicAngle = 'Modernize to serverless Postgres with instant branching and zero idle cost.';
    }
  }

  // ==========================================
  // 3. PLANETSCALE TARGET VIEW (MySQL Vitess)
  // ==========================================
  else if (targetView === 'planetscale') {
    if (db.includes('planetscale')) {
      isChampionAccount = true;
      friction = 'Zero (Champion)';
      primaryObjection = '"We are already leveraging PlanetScale Vitess for horizontal sharding."';
      objectionBuster = 'Scale to Enterprise multi-region Vitess clusters with custom failover routing and dedicated database reliability engineering support.';
      strategicAngle = 'Expand from single cluster to global distributed horizontal partitions.';
    } else if (db.includes('mysql') || db.includes('aurora')) {
      friction = 'Low';
      primaryObjection = '"We worry about schema migration downtime and table locks on large multi-GB datasets."';
      objectionBuster = 'PlanetScale Vitess enables 100% non-blocking online schema changes (DDL) with zero table locks, zero downtime, and instant safe reverts.';
      strategicAngle = 'Eliminate late-night maintenance windows and unlock continuous zero-downtime schema deployments.';
    } else {
      friction = 'Medium';
      primaryObjection = '"We are hitting scaling limits on monolithic relational database instances."';
      objectionBuster = 'PlanetScale provides unlimited horizontal sharding without rewriting application queries or managing Vitess vttablet proxies.';
      strategicAngle = 'Scale transactional throughput to millions of QPS with automatic sharding.';
    }
  }

  // ==========================================
  // 4. MONGODB ATLAS TARGET VIEW (Document DB)
  // ==========================================
  else if (targetView === 'mongodb') {
    if (db.includes('mongo')) {
      isChampionAccount = true;
      friction = 'Zero (Champion)';
      primaryObjection = '"We already run MongoDB Atlas for our primary operational store."';
      objectionBuster = 'Enable Atlas Vector Search on dedicated search nodes, Atlas Stream Processing, and multi-cloud clusters.';
      strategicAngle = 'Expand from basic document store to unified operational data platform with real-time vector search.';
    } else if (db.includes('firebase') || db.includes('dynamodb')) {
      friction = 'Low';
      primaryObjection = '"We are locked into cloud provider proprietary document APIs."';
      objectionBuster = 'MongoDB Atlas provides an open, portable document model with powerful aggregation pipelines ($facet, $lookup) and full multi-cloud availability across AWS, GCP, and Azure.';
      strategicAngle = 'Escape cloud vendor lock-in and gain advanced analytics, vector search, and time-series collections in a unified platform.';
    } else {
      friction = 'Medium';
      primaryObjection = '"Rigid relational database schemas slow down our product iteration speed."';
      objectionBuster = 'MongoDB flexible document model allows polymorphic data structures, accelerating sprint velocity for AI applications with evolving schemas.';
      strategicAngle = 'Store complex nested LLM agent memories and user context graphs as native JSON documents.';
    }
  }

  // ==========================================
  // 5. CLICKHOUSE TARGET VIEW (Real-Time OLAP)
  // ==========================================
  else if (targetView === 'clickhouse') {
    if (db.includes('clickhouse')) {
      isChampionAccount = true;
      friction = 'Zero (Champion)';
      primaryObjection = '"We already use ClickHouse Cloud for analytical query acceleration."';
      objectionBuster = 'Scale ClickHouse Cloud multi-cluster shared storage across multiple availability zones and optimize ingestion compression.';
      strategicAngle = 'Expand analytical coverage across product events, logs, and real-time user-facing reporting.';
    } else if (ontology.olap_engine.includes('Elasticsearch') || ontology.olap_engine.includes('OpenSearch')) {
      friction = 'Low';
      primaryObjection = '"We use Elasticsearch for log analytics and text search aggregations."';
      objectionBuster = 'ClickHouse delivers 10x-50x faster analytical queries over billions of rows at 80% lower RAM and disk storage cost through columnar compression.';
      strategicAngle = 'Slash observability and analytics infrastructure spend by replacing heavy Lucene indexes with blazing-fast ClickHouse columnar storage.';
    } else if (ontology.olap_engine.includes('Snowflake') || ontology.olap_engine.includes('BigQuery')) {
      friction = 'Medium';
      primaryObjection = '"We run data warehousing queries on Snowflake / BigQuery."';
      objectionBuster = 'ClickHouse offers sub-second real-time queries for customer-facing dashboards and real-time product analytics that are cost-prohibitive on batch data warehouses.';
      strategicAngle = 'Power user-facing real-time analytics with sub-50ms p99 latencies directly from ClickHouse Cloud.';
    } else {
      friction = 'Low';
      primaryObjection = '"We run analytical reporting queries directly on our transactional OLTP database."';
      objectionBuster = 'Running aggregate queries (GROUP BY over millions of rows) on Postgres locks OLTP connections. ClickHouse offloads analytics with 100x query speedups.';
      strategicAngle = 'Protect production OLTP database performance and deliver instant real-time telemetry dashboards.';
    }
  }

  return {
    companyName: startup.name,
    primaryDatabase: primary_database,
    vectorEngine: vector_engine,
    authProvider: auth_provider,
    cacheLayer: cache_layer,
    frictionLevel: friction,
    primaryObjection,
    objectionBuster,
    strategicAngle,
    tacticalAddons,
    isChampionAccount,
    modeledArrFormatted: `$${(modeledArr / 1000).toFixed(0)}k/yr`,
    aiGeneratedContent: null,
  };
}

// 5. Live AI Battlecard Generation (Optional BYOK LLM Engine)
export async function generateAIBattlecardWithLLM(
  startup: Startup,
  targetView: TargetView,
  modeledArr: number,
  apiConfig: ApiKeysConfig
): Promise<{
  executiveSummary: string;
  coldOutreachEmail: { subject: string; body: string };
  technicalMigrationPlaybook: string;
  generatedWithModel: string;
  generatedAt: number;
}> {
  const activeKeyItem = apiConfig.llmKeys.find(k => k.isActive && k.key) || apiConfig.llmKeys[0];
  if (!activeKeyItem || !activeKeyItem.key) {
    throw new Error('No active AI Inference key configured. Please add an API key in the API Keys menu.');
  }

  const ontology = normalizeFunctionalOntology(startup);
  const prompt = `You are a Principal Solutions Architect and Enterprise Account Executive at ${targetView.toUpperCase()}.
Target Account: ${startup.name}
Website: ${startup.website_url || startup.url}
Cohort/Vintage: ${startup.yc_batch || startup.batch || 'Emerging AI Startup'}
Industry: ${startup.industry || 'AI / Software'}
Current Tech Stack:
- Primary Database: ${ontology.primary_database}
- Vector Search: ${ontology.vector_engine}
- Key-Value Cache: ${ontology.cache_layer}
- OLAP Engine: ${ontology.olap_engine}
- Auth Provider: ${ontology.auth_provider}
- Runtime: ${ontology.runtime_platform}
Modeled Deal Size: $${(modeledArr / 1000).toFixed(0)}k/yr ARR

Generate a high-density, hyper-technical GTM battlecard and a personalized cold outreach email.
Return ONLY valid JSON with this exact schema:
{
  "executiveSummary": "2-3 concise sentences on why this account is a prime displacement target and the architectural bottleneck.",
  "coldOutreachEmail": {
    "subject": "Compelling subject line mentioning their specific stack",
    "body": "Crisp 3-paragraph outreach email written for a CTO/Founder highlighting concrete technical benefits (latency, TCO, vector consolidation)."
  },
  "technicalMigrationPlaybook": "Step-by-step 3-step technical migration outline from their current stack to ${targetView}."
}`;

  const engine = apiConfig.activeEngine || 'groq';

  if (engine === 'groq') {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKeyItem.key}`
      },
      body: JSON.stringify({
        model: activeKeyItem.model || 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
      })
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`AI Inference API error (${res.status}): ${errText.slice(0, 150)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content.replace(/```json/gi, '').replace(/```/g, '').trim());

    return {
      executiveSummary: parsed.executiveSummary || 'Architectural consolidation opportunity.',
      coldOutreachEmail: parsed.coldOutreachEmail || { subject: 'Database Architecture Optimization', body: 'Let us connect.' },
      technicalMigrationPlaybook: parsed.technicalMigrationPlaybook || '1. Provision cluster\n2. Migrate tables\n3. Connect client SDK.',
      generatedWithModel: activeKeyItem.model || 'AI Inference Engine',
      generatedAt: Date.now()
    };
  }

  // Fallback to OpenAI-compatible endpoint
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${activeKeyItem.key}`
    },
    body: JSON.stringify({
      model: activeKeyItem.model || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    })
  });

  if (!res.ok) {
    throw new Error(`AI Inference API error (${res.status})`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content || '{}';
  const parsed = JSON.parse(content.replace(/```json/gi, '').replace(/```/g, '').trim());

  return {
    executiveSummary: parsed.executiveSummary || 'Architectural consolidation opportunity.',
    coldOutreachEmail: parsed.coldOutreachEmail || { subject: 'Database Optimization', body: 'Let us connect.' },
    technicalMigrationPlaybook: parsed.technicalMigrationPlaybook || '1. Provision cluster\n2. Migrate tables\n3. Connect client SDK.',
    generatedWithModel: activeKeyItem.model || 'AI Inference Engine',
    generatedAt: Date.now()
  };
}
