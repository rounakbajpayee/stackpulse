-- Migration: 20260825060000_functional_and_financial_ontology.sql
-- Description: Adds 6-dimension infrastructure ontology and financial pricing fields to verified_startups

-- 1. Add Functional Infrastructure Ontology Columns
ALTER TABLE public.verified_startups
  ADD COLUMN IF NOT EXISTS primary_database text DEFAULT 'Unknown',
  ADD COLUMN IF NOT EXISTS vector_engine text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS cache_layer text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS olap_engine text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS auth_provider text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS runtime_platform text DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS estimated_eng_count integer DEFAULT 5,
  ADD COLUMN IF NOT EXISTS pricing_tier_id text DEFAULT 'growth',
  ADD COLUMN IF NOT EXISTS custom_arr_override numeric DEFAULT NULL;

-- 2. Backfill existing 4,504 rows from database_stack and vector_search
UPDATE public.verified_startups
SET
  primary_database = CASE
    WHEN database_stack ILIKE '%supabase%' THEN 'Supabase Postgres'
    WHEN database_stack ILIKE '%postgres%' THEN 'PostgreSQL'
    WHEN database_stack ILIKE '%firebase%' OR database_stack ILIKE '%firestore%' THEN 'Firebase Firestore'
    WHEN database_stack ILIKE '%mongo%' THEN 'MongoDB Atlas'
    WHEN database_stack ILIKE '%planetscale%' THEN 'PlanetScale'
    WHEN database_stack ILIKE '%dynamodb%' THEN 'AWS DynamoDB'
    WHEN database_stack ILIKE '%aurora%' OR database_stack ILIKE '%rds%' THEN 'AWS Aurora / RDS'
    WHEN database_stack ILIKE '%mysql%' THEN 'MySQL'
    WHEN database_stack ILIKE '%clickhouse%' THEN 'ClickHouse'
    WHEN database_stack ILIKE '%sqlite%' OR database_stack ILIKE '%duckdb%' THEN 'SQLite / DuckDB'
    ELSE 'Unknown'
  END,
  vector_engine = CASE
    WHEN vector_search IS NOT NULL AND vector_search != 'None' AND vector_search != '' THEN vector_search
    WHEN database_stack ILIKE '%pgvector%' THEN 'pgvector'
    WHEN database_stack ILIKE '%pinecone%' THEN 'Pinecone'
    WHEN database_stack ILIKE '%qdrant%' THEN 'Qdrant'
    WHEN database_stack ILIKE '%weaviate%' THEN 'Weaviate'
    WHEN database_stack ILIKE '%milvus%' THEN 'Milvus'
    ELSE 'None'
  END,
  cache_layer = CASE
    WHEN database_stack ILIKE '%redis%' THEN 'Redis'
    WHEN database_stack ILIKE '%upstash%' THEN 'Upstash'
    WHEN database_stack ILIKE '%elasticache%' THEN 'AWS ElastiCache'
    ELSE 'None'
  END,
  olap_engine = CASE
    WHEN database_stack ILIKE '%clickhouse%' THEN 'ClickHouse'
    WHEN database_stack ILIKE '%snowflake%' THEN 'Snowflake'
    WHEN database_stack ILIKE '%bigquery%' THEN 'BigQuery'
    WHEN database_stack ILIKE '%elasticsearch%' OR database_stack ILIKE '%opensearch%' THEN 'OpenSearch / Elasticsearch'
    ELSE 'None'
  END,
  auth_provider = CASE
    WHEN database_stack ILIKE '%clerk%' THEN 'Clerk'
    WHEN database_stack ILIKE '%auth0%' THEN 'Auth0'
    WHEN database_stack ILIKE '%supabase auth%' THEN 'Supabase Auth'
    WHEN database_stack ILIKE '%firebase auth%' THEN 'Firebase Auth'
    WHEN database_stack ILIKE '%nextauth%' OR database_stack ILIKE '%better auth%' THEN 'NextAuth'
    ELSE 'None'
  END
WHERE primary_database = 'Unknown' OR primary_database IS NULL;

-- 3. Create index on ontology dimensions for high-speed multi-filter queries
CREATE INDEX IF NOT EXISTS idx_verified_startups_primary_db ON public.verified_startups(primary_database);
CREATE INDEX IF NOT EXISTS idx_verified_startups_vector_engine ON public.verified_startups(vector_engine);
CREATE INDEX IF NOT EXISTS idx_verified_startups_auth_provider ON public.verified_startups(auth_provider);
