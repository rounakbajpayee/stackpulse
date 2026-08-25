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

// 1. Deterministic 6-Dimension Functional Ontology Normalizer
export function normalizeFunctionalOntology(startup: Startup): FunctionalOntology {
  const stack = (startup.database_stack || '').toLowerCase();
  const vectorRaw = (startup.vector_search || '').toLowerCase();
  const name = (startup.name || '').toLowerCase();

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

// 2. Dynamic Financial Pricing Valuation Formula
export function calculateCompanyArr(
  startup: Startup, 
  assumptions: FinancialAssumptions = DEFAULT_FINANCIAL_ASSUMPTIONS, 
  targetView: TargetView = 'supabase'
): number {
  // If user has set an explicit custom override on this company, use it directly
  if (typeof startup.custom_arr_override === 'number' && startup.custom_arr_override >= 0) {
    return startup.custom_arr_override;
  }

  const ontology = normalizeFunctionalOntology(startup);
  const primaryDb = ontology.primary_database;

  // Determine if company is a Champion vs Displacement Target
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

  // Champions represent retained market share ($0 displacement pipeline)
  if (isChampion || !isTarget) {
    return 0;
  }

  // A. Vintage Sizing (Base Compute ARR)
  let baseCompute = assumptions.earlyComputeArr;
  const batch = (startup.yc_batch || startup.batch || startup.category || '').toLowerCase();
  
  if (batch.includes('w1') || batch.includes('s1') || batch.includes('w20') || batch.includes('s20') || batch.includes('w21') || batch.includes('s21') || batch.includes('2021')) {
    baseCompute = assumptions.matureComputeArr;
  } else if (batch.includes('w22') || batch.includes('s22') || batch.includes('w23') || batch.includes('s23') || batch.includes('2022') || batch.includes('2023')) {
    baseCompute = assumptions.growthComputeArr;
  } else {
    baseCompute = assumptions.earlyComputeArr;
  }

  let totalArr = baseCompute;

  // B. Tool Consolidation Add-ons
  if (['Pinecone', 'Qdrant', 'Weaviate', 'Milvus'].includes(ontology.vector_engine)) {
    totalArr += assumptions.vectorConsolidationArr;
  }
  if (['Clerk', 'Auth0'].includes(ontology.auth_provider)) {
    totalArr += assumptions.authConsolidationArr;
  }
  if (['Redis', 'AWS ElastiCache'].includes(ontology.cache_layer)) {
    totalArr += assumptions.cacheConsolidationArr;
  }

  // C. Compliance & Enterprise Multiplier
  const ind = (startup.industry || '').toLowerCase();
  if (ind.includes('fintech') || ind.includes('health') || ind.includes('legal') || ind.includes('security') || ind.includes('compliance')) {
    totalArr += assumptions.regulatedSectorMultiplier;
  }

  return totalArr;
}

// 3. Instant Deterministic Technical Objection & Migration Battlecard Synthesizer (0ms / $0 Cost)
export function synthesizeDeterministicBattlecard(
  startup: Startup,
  targetView: TargetView = 'supabase',
  modeledArr: number
): BattlecardPayload {
  const ontology = normalizeFunctionalOntology(startup);
  const { primary_database, vector_engine, auth_provider, cache_layer } = ontology;

  let friction: 'Low' | 'Medium' | 'High' = 'Medium';
  let primaryObjection = '';
  let objectionBuster = '';
  let strategicAngle = '';

  if (primary_database.includes('Firebase')) {
    friction = 'Medium';
    primaryObjection = '"We heavily rely on Firebase real-time document listeners, client SDK reactivity, and Firestore security rules."';
    objectionBuster = 'Supabase Realtime provides instant websocket broadcasting with PostgreSQL Row Level Security (RLS), replacing Firebase security rules with enterprise SQL ACID transactions.';
    strategicAngle = 'Eliminate NoSQL relational query workarounds and vector store dual-billing by unifying data + pgvector in PostgreSQL.';
  } else if (primary_database.includes('MongoDB')) {
    friction = 'Medium';
    primaryObjection = '"Our data model requires dynamic JSON document flexibility without rigid schema migrations."';
    objectionBuster = 'PostgreSQL JSONB offers faster indexed document querying than MongoDB BSON, plus native relational joins and 50% lower cloud compute TCO.';
    strategicAngle = 'Cut database infrastructure cost by 50% while scaling read replicas and co-located vector search.';
  } else if (primary_database.includes('DynamoDB')) {
    friction = 'High';
    primaryObjection = '"We designed our entire backend around DynamoDB single-table composite partition keys."';
    objectionBuster = 'PostgreSQL eliminates complex GSI index overhead, query limits, and scan cost penalties with flexible SQL indexes.';
    strategicAngle = 'Unblock multi-tenant data analytics and LLM context graphs without managing cumbersome secondary indexes.';
  } else if (vector_engine.includes('Pinecone') || vector_engine.includes('Qdrant')) {
    friction = 'Low';
    primaryObjection = '"We already have our embeddings stored in Pinecone and worry about PostgreSQL HNSW index RAM footprint."';
    objectionBuster = 'pgvector with HNSW index runs natively in-memory alongside relational tables, eliminating the 150ms external network hop and separate $12k/yr vector SaaS subscription.';
    strategicAngle = 'Consolidate vector search directly inside Postgres to perform ACID-compliant hybrid keyword + semantic queries in 1 query.';
  } else {
    friction = 'Low';
    primaryObjection = '"Our current database setup is stable; why take on migration risk right now?"';
    objectionBuster = 'Supabase delivers automated branching, point-in-time recovery, connection pooling, and 3x faster developer onboarding velocity.';
    strategicAngle = 'Consolidate database, vector search, storage, and authentication into a unified enterprise platform.';
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
    modeledArrFormatted: `$${(modeledArr / 1000).toFixed(0)}k/yr`,
    aiGeneratedContent: null,
  };
}

// 4. Live AI Battlecard Generation (Optional BYOK LLM Engine)
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
  const activeKeyItem = apiConfig.llmKeys.find(k => k.isActive) || apiConfig.llmKeys[0];
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

  // Fallback to OpenAI-compatible endpoint for other providers
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
