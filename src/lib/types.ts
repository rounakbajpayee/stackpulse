export type DatabaseStack =
  | 'Supabase Postgres'
  | 'Firebase Firestore'
  | 'MongoDB Atlas'
  | 'AWS DynamoDB'
  | 'PlanetScale'
  | 'PostgreSQL'
  | 'MySQL'
  | 'Redis'
  | 'ClickHouse'
  | 'CockroachDB'
  | 'AWS Aurora / RDS'
  | 'SQLite / DuckDB'
  | 'Convex'
  | 'Neon'
  | 'Unknown'
  | string;

export type VectorSearch =
  | 'pgvector'
  | 'Pinecone'
  | 'Qdrant'
  | 'Weaviate'
  | 'Milvus'
  | 'None'
  | string;

export type StackSource = 
  | 'github' 
  | 'github_search' 
  | 'job_board' 
  | 'html_signals' 
  | 'product_identity' 
  | 'google_search' 
  | 'web_search'
  | 'unknown'
  | string;

export type Investor = 'yc' | 'a16z' | 'sequoia' | string;

export type Industry = 
  | 'B2B SaaS / DevTools'
  | 'AI / Machine Learning'
  | 'FinTech / Payments'
  | 'Healthcare / Bio'
  | 'E-Commerce / Consumer'
  | 'Hardware / Industrial'
  | 'Other';

export type VerificationStatus = 'verified' | 'unverified' | 'pending';

export type VerificationDepth = 
  | 'confirmed'      // Confirmed database stack detected
  | 'deep_scraped'   // Checked through all 6 tiers including scrapers (Truly Unknown)
  | 'surface_free'   // Checked only on free tiers (GitHub/ATS/Bundles) - Pending Deep Scrape
  | 'unscanned';     // Waiting for first pass

export type TargetView = 'supabase' | 'neon' | 'planetscale' | 'mongodb' | 'clickhouse' | 'redis';

export interface UserWorkspaceDelta {
  deleted_ids: string[];
  stack_overrides: Record<string, string>;
  verified_overrides: Record<string, boolean>;
}

export interface UserWorkspaceRecord {
  user_id: string;
  delta: UserWorkspaceDelta;
  updated_at: string;
}

export interface PipelineAssumptions {
  enterpriseARR: number; // e.g. 36000
  growthARR: number;     // e.g. 12000
}

export interface ApiKeyItem {
  id: string;
  provider: 'groq' | 'openai' | 'anthropic' | 'gemini' | 'scraperapi' | 'firecrawl';
  key: string;
  label: string;
  category: 'llm' | 'scraper';
  isActive: boolean;
  requestCount?: number;
  requestLimit?: number;
  status?: 'active' | 'exhausted' | 'rate_limited' | 'invalid';
}

export interface ApiKeysConfig {
  llmKeys: ApiKeyItem[];
  scraperKeys: ApiKeyItem[];
  activeLlmProvider: 'groq' | 'openai' | 'anthropic' | 'gemini';
  customPrompt: string;
  // Legacy backward-compatibility fields
  provider?: 'groq' | 'openai' | 'anthropic' | 'gemini';
  apiKey?: string;
}

export interface SignalsCache {
  dnsAlive?: boolean;
  githubChecked?: boolean;
  githubMatches?: string[];
  atsChecked?: boolean;
  atsMatches?: string[];
  bundleChecked?: boolean;
  bundleMatches?: string[];
  scraperChecked?: boolean;
  scraperMatches?: string[];
  lastCheckedAt?: string;
}

export interface Startup {
  id: string;
  name: string;
  url: string;
  website_url: string | null;
  github_url: string | null;
  investor: Investor;
  yc_batch: string | null;
  batch: string;
  category: string;
  industry: Industry;
  database_stack: DatabaseStack;
  vector_search: VectorSearch;
  detected_stack?: string[];
  stack_source: StackSource;
  verification_status: VerificationStatus;
  verification_depth?: VerificationDepth;
  signals_cached?: SignalsCache;
  migration_opportunity_score: string;
  framework: string;
  bottleneck_detected: string;
  ae_outbound_pitch: string;
  created_at?: string;
  stack_verified_at?: string;
  last_verified_at?: string;
}

export interface MetricSummary {
  tracked_startups: number;
  verified_count: number;
  native_champions: number;
  migration_pipeline_count: number;
  pipeline_identified_usd: string;
  ai_vector_penetration_pct: number;
}
