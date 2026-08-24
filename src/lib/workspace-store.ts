import { 
  Startup, 
  TargetView, 
  PipelineAssumptions, 
  ApiKeysConfig, 
  UserWorkspaceDelta,
  MetricSummary,
  VerificationDepth
} from './types';

export const DEFAULT_PIPELINE_ASSUMPTIONS: PipelineAssumptions = {
  enterpriseARR: 36000,
  growthARR: 12000,
};

export const DEFAULT_API_KEYS: ApiKeysConfig = {
  llmKeys: [
    {
      id: 'default-groq',
      provider: 'groq',
      key: '',
      label: 'Default Groq Engine',
      category: 'llm',
      isActive: true,
      status: 'active'
    }
  ],
  scraperKeys: [],
  activeLlmProvider: 'groq',
  customPrompt: `You are an elite Enterprise Sales Engineer and GTM Architect for {{TARGET_PROVIDER}}.
Analyze this startup profile and craft a hyper-personalized, technical value proposition.

TARGET STARTUP: {{COMPANY_NAME}}
DETECTED STACK: {{CURRENT_DB}}
VECTOR LAYER: {{VECTOR_ENGINE}}
IDENTIFIED BOTTLENECK: {{BOTTLENECK}}

Write a punchy, 3-paragraph cold outreach email to their VP of Engineering / CTO explaining specifically why migrating from {{CURRENT_DB}} to {{TARGET_PROVIDER}} solves their scaling bottlenecks, cuts cloud egress costs, and accelerates time-to-market.`,
  // Backward compatibility
  provider: 'groq',
  apiKey: ''
};

// 1. Target View Persistence
export function getSavedTargetView(): TargetView {
  const saved = localStorage.getItem('stackpulse_target_view');
  if (saved && ['supabase', 'neon', 'planetscale', 'mongodb', 'clickhouse', 'redis'].includes(saved)) {
    return saved as TargetView;
  }
  return 'supabase';
}

// 2. Pipeline Assumptions Persistence
export function getSavedPipelineAssumptions(): PipelineAssumptions {
  const saved = localStorage.getItem('stackpulse_pipeline_assumptions');
  if (saved) {
    try {
      return { ...DEFAULT_PIPELINE_ASSUMPTIONS, ...JSON.parse(saved) };
    } catch (e) {}
  }
  return DEFAULT_PIPELINE_ASSUMPTIONS;
}

// 3. API Keys Persistence
export function getSavedApiKeys(): ApiKeysConfig {
  const saved = localStorage.getItem('stackpulse_api_keys');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Migrate old format to multi-key format if needed
      if (!parsed.llmKeys && parsed.apiKey) {
        return {
          llmKeys: [{
            id: 'legacy-key',
            provider: parsed.provider || 'groq',
            key: parsed.apiKey,
            label: 'Primary LLM Key',
            category: 'llm',
            isActive: true,
            status: 'active'
          }],
          scraperKeys: [],
          activeLlmProvider: parsed.provider || 'groq',
          customPrompt: parsed.customPrompt || DEFAULT_API_KEYS.customPrompt,
          provider: parsed.provider || 'groq',
          apiKey: parsed.apiKey
        };
      }
      return { ...DEFAULT_API_KEYS, ...parsed };
    } catch (e) {}
  }
  return DEFAULT_API_KEYS;
}

// 4. Guest Territory Workspace Delta Persistence
export function getSavedGuestDelta(): UserWorkspaceDelta {
  const saved = localStorage.getItem('stackpulse_guest_delta');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        deleted_ids: Array.isArray(parsed.deleted_ids) ? parsed.deleted_ids : [],
        stack_overrides: typeof parsed.stack_overrides === 'object' ? parsed.stack_overrides : {},
        verified_overrides: typeof parsed.verified_overrides === 'object' ? parsed.verified_overrides : {}
      };
    } catch (e) {}
  }
  return { deleted_ids: [], stack_overrides: {}, verified_overrides: {} };
}

export function saveGuestDelta(delta: UserWorkspaceDelta): void {
  localStorage.setItem('stackpulse_guest_delta', JSON.stringify(delta));
}

// 5. Deterministic Provenance & Verification Depth Resolver
export function getProvenanceDepth(startup: Startup): VerificationDepth {
  // If explicitly tagged in record
  if (startup.verification_depth) {
    return startup.verification_depth;
  }

  // 1. Confirmed Stack
  if (startup.database_stack && startup.database_stack !== 'Unknown') {
    return 'confirmed';
  }

  // 2. Deep Scraped (Truly Unknown)
  if (startup.stack_source === 'google_search' || startup.stack_source === 'web_search') {
    return 'deep_scraped';
  }

  // 3. Surface Free Scanned (GitHub monorepos, ATS jobs, bundle sniffed without stack found)
  if (startup.stack_source === 'github' || startup.stack_source === 'github_search' || 
      startup.stack_source === 'job_board' || startup.stack_source === 'html_signals' ||
      startup.stack_source === 'product_identity') {
    return 'surface_free';
  }

  // 4. Unscanned
  if (startup.stack_source === 'unknown' || !startup.stack_source) {
    // If it has a verification timestamp, it at least underwent free pass
    if (startup.stack_verified_at || startup.last_verified_at) {
      return 'surface_free';
    }
    return 'unscanned';
  }

  return 'surface_free';
}

// 6. Apply Workspace Deltas to Master Database
export function applyWorkspaceDeltas(
  masterStartups: Startup[],
  delta: UserWorkspaceDelta
): Startup[] {
  const deletedSet = new Set(delta.deleted_ids);

  return masterStartups
    .filter(s => !deletedSet.has(s.id))
    .map(s => {
      let currentStack = s.database_stack;
      let currentStatus = s.verification_status;
      const depth = getProvenanceDepth(s);

      if (delta.stack_overrides[s.id] !== undefined) {
        currentStack = delta.stack_overrides[s.id];
      }

      if (delta.verified_overrides[s.id] !== undefined) {
        currentStatus = delta.verified_overrides[s.id] ? 'verified' : 'unverified';
      }

      return {
        ...s,
        database_stack: currentStack,
        verification_status: currentStatus,
        verification_depth: depth
      };
    });
}

// 7. Dynamic GTM Territory Classification Lens
export function getGtmClassification(startup: Startup, targetView: TargetView = 'supabase') {
  const db = (startup.database_stack || '').toLowerCase();
  const isUnknown = db === 'unknown' || !db;

  if (isUnknown) {
    const depth = getProvenanceDepth(startup);
    return {
      status: 'unverified' as const,
      badgeColor: 'zinc',
      label: depth === 'deep_scraped' ? 'Truly Unknown' : 'Unverified',
      score: 0,
      bottleneck: 'Architecture unverified from public sources',
      pitchAngle: 'Discovery call to map infrastructure topology'
    };
  }

  // 1. Supabase View
  if (targetView === 'supabase') {
    if (db.includes('supabase')) {
      return {
        status: 'champion' as const,
        badgeColor: 'emerald',
        label: 'Native Champion',
        score: 95,
        bottleneck: 'Scaling auth connections & pgvector index tuning',
        pitchAngle: 'Enterprise SLA & Multi-Region Read Replicas'
      };
    }
    if (db.includes('firebase') || db.includes('firestore')) {
      return {
        status: 'migration' as const,
        badgeColor: 'amber',
        label: 'High Opportunity',
        score: 88,
        bottleneck: 'Document query limits, vendor lock-in, and unpredictable egress billing',
        pitchAngle: 'PostgreSQL Relational power + Instant GraphQL/REST with row-level security'
      };
    }
    if (db.includes('dynamodb') || db.includes('mongodb') || db.includes('mongo')) {
      return {
        status: 'migration' as const,
        badgeColor: 'amber',
        label: 'High Opportunity',
        score: 85,
        bottleneck: 'Complex multi-table joins, manual indexing overhead, and high storage costs',
        pitchAngle: 'Consolidate to Postgres with native JSONB + pgvector support'
      };
    }
    if (db.includes('planetscale') || db.includes('aurora') || db.includes('rds')) {
      return {
        status: 'migration' as const,
        badgeColor: 'blue',
        label: 'Medium Opportunity',
        score: 80,
        bottleneck: 'High cloud infra overhead, separate auth provider, separate vector DB',
        pitchAngle: 'Integrated auth, storage, edge functions, and real-time subscriptions'
      };
    }
    return {
      status: 'evaluating' as const,
      badgeColor: 'zinc',
      label: 'Evaluating',
      score: 65,
      bottleneck: 'Legacy database management and infrastructure maintenance',
      pitchAngle: 'Modernize with Supabase managed PostgreSQL'
    };
  }

  // 2. Neon View (Postgres Serverless)
  if (targetView === 'neon') {
    if (db.includes('neon')) {
      return { status: 'champion' as const, badgeColor: 'emerald', label: 'Native Champion', score: 95, bottleneck: 'Serverless branching optimization', pitchAngle: 'Enterprise auto-scaling' };
    }
    if (db.includes('aurora') || db.includes('rds') || db.includes('postgres')) {
      return { status: 'migration' as const, badgeColor: 'amber', label: 'High Opportunity', score: 90, bottleneck: 'Fixed instance provisioning & idle cost waste', pitchAngle: 'Instant database branching + Scale to zero' };
    }
    return { status: 'evaluating' as const, badgeColor: 'zinc', label: 'Evaluating', score: 60, bottleneck: 'Managing fixed database clusters', pitchAngle: 'Serverless Postgres' };
  }

  // 3. PlanetScale View (MySQL Serverless)
  if (targetView === 'planetscale') {
    if (db.includes('planetscale')) {
      return { status: 'champion' as const, badgeColor: 'emerald', label: 'Native Champion', score: 95, bottleneck: 'Vitess query routing at scale', pitchAngle: 'Enterprise multi-region clusters' };
    }
    if (db.includes('mysql') || db.includes('aurora')) {
      return { status: 'migration' as const, badgeColor: 'amber', label: 'High Opportunity', score: 85, bottleneck: 'Schema migration downtime & lock contention', pitchAngle: 'Non-blocking schema migrations' };
    }
    return { status: 'evaluating' as const, badgeColor: 'zinc', label: 'Evaluating', score: 55, bottleneck: 'Relational database scaling limits', pitchAngle: 'Horizontally sharded MySQL' };
  }

  // 4. MongoDB Atlas View (Document DB)
  if (targetView === 'mongodb') {
    if (db.includes('mongodb') || db.includes('mongo')) {
      return { status: 'champion' as const, badgeColor: 'emerald', label: 'Native Champion', score: 95, bottleneck: 'Cluster shard balancing & Vector Search', pitchAngle: 'Atlas Dedicated Search & Vector Nodes' };
    }
    if (db.includes('firebase') || db.includes('dynamodb')) {
      return { status: 'migration' as const, badgeColor: 'amber', label: 'High Opportunity', score: 85, bottleneck: 'Proprietary cloud lock-in & query flexibility', pitchAngle: 'Flexible JSON Document Model with Atlas Vector' };
    }
    return { status: 'evaluating' as const, badgeColor: 'zinc', label: 'Evaluating', score: 55, bottleneck: 'Rigid schemas slowing developer iteration', pitchAngle: 'Schema-less document agility' };
  }

  // 5. ClickHouse View (Real-time Analytics)
  if (targetView === 'clickhouse') {
    if (db.includes('clickhouse')) {
      return { status: 'champion' as const, badgeColor: 'emerald', label: 'Native Champion', score: 95, bottleneck: 'High-ingestion query concurrency', pitchAngle: 'ClickHouse Cloud Enterprise' };
    }
    if (db.includes('elastic') || db.includes('opensearch') || db.includes('postgres') || db.includes('mysql')) {
      return { status: 'migration' as const, badgeColor: 'amber', label: 'High Opportunity', score: 80, bottleneck: 'Slow analytical queries over millions of events', pitchAngle: 'Sub-second OLAP queries across billions of rows' };
    }
    return { status: 'evaluating' as const, badgeColor: 'zinc', label: 'Evaluating', score: 50, bottleneck: 'Analytics latency impacting dashboards', pitchAngle: 'Real-time columnar analytics' };
  }

  return {
    status: 'evaluating' as const,
    badgeColor: 'zinc',
    label: 'Evaluating',
    score: 50,
    bottleneck: 'General infrastructure scaling',
    pitchAngle: 'Modern managed data infrastructure'
  };
}

// 8. Calculate KPI Metric Summaries
export function calculateGtmMetrics(
  startups: Startup[],
  targetView: TargetView,
  assumptions: PipelineAssumptions
): MetricSummary {
  const total = startups.length;
  let verifiedCount = 0;
  let nativeChampions = 0;
  let migrationTargets = 0;
  let aiVectorCount = 0;

  for (const s of startups) {
    const classification = getGtmClassification(s, targetView);
    if (s.database_stack && s.database_stack !== 'Unknown') {
      verifiedCount++;
    }
    if (classification.status === 'champion') {
      nativeChampions++;
    } else if (classification.status === 'migration') {
      migrationTargets++;
    }

    if (s.vector_search && s.vector_search !== 'None') {
      aiVectorCount++;
    }
  }

  const highValueCount = Math.round(migrationTargets * 0.4);
  const growthValueCount = migrationTargets - highValueCount;
  const totalARR = (highValueCount * assumptions.enterpriseARR) + (growthValueCount * assumptions.growthARR);

  const formattedARR = totalARR >= 1000000 
    ? `$${(totalARR / 1000000).toFixed(1)}M`
    : `$${Math.round(totalARR / 1000)}k`;

  return {
    tracked_startups: total,
    verified_count: verifiedCount,
    native_champions: nativeChampions,
    migration_pipeline_count: migrationTargets,
    pipeline_identified_usd: formattedARR,
    ai_vector_penetration_pct: total > 0 ? Math.round((aiVectorCount / total) * 100) : 0
  };
}
