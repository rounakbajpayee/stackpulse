export interface Startup {
  id: string;
  name: string;
  url?: string;
  category: string;
  batch?: string;
  database_stack: 'Supabase Postgres' | 'Firebase Firestore' | 'Neon' | 'DynamoDB' | 'Custom / Postgres';
  vector_search: 'pgvector (Native)' | 'Pinecone' | 'Pinecone / Separate' | 'None';
  migration_opportunity_score: string;
  framework?: string;
  bottleneck_detected?: string;
  ae_outbound_pitch: string;
  created_at?: string;
}

export interface MetricSummary {
  totalStartups: number;
  supabaseAdoptionRate: number;
  firebaseMigrationTargets: number;
  pipelineARR: number;
}
