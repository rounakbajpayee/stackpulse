export type TargetView = 'supabase' | 'neon' | 'planetscale' | 'mongodb' | 'clickhouse' | 'redis';

export type VerificationDepth = 'confirmed' | 'deep_scraped' | 'surface_free' | 'unscanned';

export type Industry = 
  | 'B2B SaaS / DevTools'
  | 'AI / Machine Learning'
  | 'FinTech / Payments'
  | 'Healthcare / Bio'
  | 'E-Commerce / Consumer'
  | 'Hardware / Industrial'
  | 'Security & Compliance'
  | 'Other';

export interface ApiKeyItem {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  model?: string;
  addedAt: number;
}

export interface ApiKeysConfig {
  activeEngine: 'groq' | 'openai' | 'anthropic' | 'gemini';
  llmKeys: ApiKeyItem[];
  scraperKeys: ApiKeyItem[];
  apiKey?: string;
  provider?: string;
  customPrompt?: string;
}

// 🏛️ 6-Dimension Functional Infrastructure Ontology
export interface FunctionalOntology {
  primary_database: string;
  vector_engine: string;
  cache_layer: string;
  olap_engine: string;
  auth_provider: string;
  runtime_platform: string;
}

export interface Startup {
  id: string;
  name: string;
  url: string;
  website_url?: string;
  yc_batch?: string;
  batch?: string;
  category?: string;
  industry?: string;
  database_stack: string;
  vector_search?: string;
  stack_source?: string;
  verification_depth?: VerificationDepth;
  verification_status?: string;
  last_verified_at?: string;
  investor?: string;
  signals_cache?: any;

  // 🏛️ 6-Dimension Functional Infrastructure Ontology Slots
  primary_database?: string;
  vector_engine?: string;
  cache_layer?: string;
  olap_engine?: string;
  auth_provider?: string;
  runtime_platform?: string;

  // 💰 Financial Pricing & Scale Metrics
  estimated_eng_count?: number;
  pricing_tier_id?: string;
  custom_arr_override?: number | null;
  modeled_arr?: number;

  // Backwards compatibility fields
  framework?: string;
  migration_opportunity_score?: number;
}

// 💰 User-Configurable Financial & Pricing Ontology
export interface FinancialAssumptions {
  matureComputeArr: number;
  growthComputeArr: number;
  earlyComputeArr: number;
  vectorConsolidationArr: number;
  authConsolidationArr: number;
  cacheConsolidationArr: number;
  regulatedSectorMultiplier: number;
}

export interface PipelineAssumptions extends FinancialAssumptions {
  tier1Arr: number;
  tier2Arr: number;
  minDisplacementScore: number;
}

export interface UserWorkspaceDelta {
  deleted_ids: string[];
  stack_overrides: Record<string, string>;
  verified_overrides: Record<string, boolean>;
  arr_overrides?: Record<string, number>;
  ontology_overrides?: Record<string, Partial<FunctionalOntology>>;
  custom_pricing?: Partial<FinancialAssumptions>;
}

export interface UserWorkspaceRecord {
  id?: string;
  user_id: string;
  delta: UserWorkspaceDelta;
  updated_at?: string;
}

export interface GtmMetrics {
  tracked_startups: number;
  verified_count: number;
  champions_count: number;
  migration_count: number;
  pipeline_arr_cents: number;
  pipeline_arr_formatted: string;
  supabase_share_pct: number;
  unverified_count: number;
  surface_free_count: number;
  deep_scraped_count: number;

  // Compatible property aliases
  native_champions: number;
  migration_pipeline_count: number;
  pipeline_identified_usd: string;
  ai_vector_penetration_pct: number;
}

export type MetricSummary = GtmMetrics;

export interface BattlecardPayload {
  companyName: string;
  primaryDatabase: string;
  vectorEngine: string;
  authProvider: string;
  cacheLayer: string;
  frictionLevel: 'Low' | 'Medium' | 'High';
  primaryObjection: string;
  objectionBuster: string;
  strategicAngle: string;
  modeledArrFormatted: string;
  aiGeneratedContent?: {
    executiveSummary: string;
    coldOutreachEmail: {
      subject: string;
      body: string;
    };
    technicalMigrationPlaybook: string;
    generatedWithModel: string;
    generatedAt: number;
  } | null;
}
