export type DatabaseStack =
  | 'Supabase Postgres'
  | 'Firebase Firestore'
  | 'MongoDB Atlas'
  | 'AWS DynamoDB'
  | 'PlanetScale'
  | 'Convex'
  | 'Neon'
  | string;

export type VectorSearch =
  | 'pgvector (Native)'
  | 'Pinecone'
  | 'Qdrant'
  | 'Weaviate'
  | 'Milvus'
  | 'None'
  | string;

export interface Startup {
  id: string;
  name: string;
  url: string;
  category: string;
  batch: string;
  database_stack: DatabaseStack;
  vector_search: VectorSearch;
  migration_opportunity_score: string; // e.g. "92%"
  framework: string;
  bottleneck_detected: string;
  ae_outbound_pitch: string;
  created_at?: string;
}

export interface MetricSummary {
  tracked_startups: number;
  supabase_market_share: number;
  active_migration_pipeline: number;
  pipeline_identified_usd: string;
}
