export type TargetView = 'supabase' | 'neon' | 'planetscale' | 'mongodb' | 'clickhouse' | 'redis';
export type GtmClassificationStatus = 'champion' | 'migration' | 'evaluating';
export type VerificationDepth = 'confirmed' | 'deep_scraped' | 'surface_free' | 'unscanned';

export type Industry = 
  | 'AI / Machine Learning' 
  | 'B2B SaaS / DevTools' 
  | 'FinTech / Payments' 
  | 'Healthcare / Bio' 
  | 'Hardware / Industrial' 
  | 'E-Commerce / Consumer' 
  | 'Other';

export interface FunctionalOntology {
  primary_database: string;
  vector_engine: string;
  cache_layer: string;
  olap_engine: string;
  auth_provider: string;
  runtime_platform: string;
}

export interface FinancialAssumptions {
  matureComputeArr: number;       // YC 2021 & earlier ($36k default)
  growthComputeArr: number;       // YC 2022 - 2023 ($24k default)
  earlyComputeArr: number;        // YC 2024 - 2025 ($12k default)
  vectorConsolidationArr: number; // Displacing Pinecone/Qdrant (+$12k default)
  authConsolidationArr: number;   // Consolidating Clerk/Auth0 (+$8k default)
  cacheConsolidationArr: number;  // Consolidating Redis/Upstash (+$6k default)
  regulatedSectorMultiplier: number; // FinTech / HealthTech compliance (+$15k default)
}

export interface Startup {
  id: string;
  name: string;
  database_stack: string;
  vector_search?: string;
  website_url?: string;
  url?: string;
  industry?: string;
  investor?: string;
  description?: string;
  framework?: string;
  yc_batch?: string;
  batch?: string;
  category?: string;
  stack_source?: string;
  verification_depth?: VerificationDepth;
  verification_status?: 'verified' | 'unverified';
  stack_verified_at?: string;
  last_verified_at?: string;
  custom_arr_override?: number;
  
  // 6D Functional Ontology Fields
  primary_database?: string;
  vector_engine?: string;
  cache_layer?: string;
  olap_engine?: string;
  auth_provider?: string;
  runtime_platform?: string;
  estimated_eng_count?: number;
  pricing_tier_id?: string;
}

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
  geminiKey?: string;
  groqKey?: string;
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
  frictionLevel: 'Low' | 'Medium' | 'High' | 'Zero (Champion)';
  primaryObjection: string;
  objectionBuster: string;
  strategicAngle: string;
  tacticalAddons?: string[];
  isChampionAccount?: boolean;
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
