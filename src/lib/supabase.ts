import { Startup } from './types';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://huubxklntrxcwqkoumhd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DEFAULT_STARTUPS: Startup[] = [
  {
    id: '1',
    name: 'Cursorly AI',
    url: 'https://cursorly.ai',
    category: 'AI Code Generation',
    batch: 'YC W25',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '96%',
    framework: 'Next.js',
    bottleneck_detected: 'Firestore cannot perform relational joins across multi-file repository AST graphs. Pinecone introduces external network hops on every inline completion.',
    ae_outbound_pitch: 'Hi Cursorly team — tracking you as one of the sharpest AI coding agent teams out of YC W25. Noticed you are running on Firebase Firestore with Pinecone.\n\nThe bottleneck we see at your stage: Firestore cannot perform relational joins across multi-file repo graphs, and Pinecone doubles your vector infrastructure bill. Supabase merges Postgres, pgvector, Auth, and Realtime into one instance so that latency layer disappears.\n\nOpen to a 15-min architecture review this week? (Opportunity score: High 96%)'
  },
  {
    id: '2',
    name: 'Vocalis Engine',
    url: 'https://vocalis.ai',
    category: 'Voice AI Agents',
    batch: 'a16z Speedrun',
    database_stack: 'Firebase Firestore',
    vector_search: 'None',
    migration_opportunity_score: '91%',
    framework: 'FastAPI / React',
    bottleneck_detected: 'Real-time duplex voice streams require sub-50ms WebSocket state sync. Firebase document write limits create latency spikes during simultaneous agent calls.',
    ae_outbound_pitch: 'Hey Vocalis team — loved the launch at a16z Speedrun. Duplex voice AI requires sub-50ms session state without document write limits. Supabase Realtime + Postgres handles high-throughput session state with built-in pgvector for phonetic embedding match. Would love to share our voice latency benchmarks.'
  },
  {
    id: '3',
    name: 'Repline',
    url: 'https://repline.dev',
    category: 'Autonomous Code Review',
    batch: 'YC W25',
    database_stack: 'Supabase Postgres',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '18%',
    framework: 'Next.js',
    bottleneck_detected: 'Optimized architecture leveraging native Supabase pgvector HNSW indexing and Row Level Security (RLS).',
    ae_outbound_pitch: 'Repline is already native on Supabase Postgres with pgvector. Account status: High-growth retained account.'
  },
  {
    id: '4',
    name: 'Lexara Law',
    url: 'https://lexara.law',
    category: 'Legal Tech AI',
    batch: 'Sequoia Arc',
    database_stack: 'DynamoDB',
    vector_search: 'Pinecone',
    migration_opportunity_score: '88%',
    framework: 'React / Node.js',
    bottleneck_detected: 'Complex contract clauses require hierarchical relational trees plus cosine distance search over statutory precedents. DynamoDB partitioning lacks multi-table ACID transactions.',
    ae_outbound_pitch: 'Hey Lexara team — caught your launch in Sequoia Arc. Legal contract parsing hits indexing friction when splitting metadata in DynamoDB and embeddings in Pinecone. Supabase provides ACID transactional safety with native HNSW vector indexes in Postgres.'
  },
  {
    id: '5',
    name: 'Sonora Health',
    url: 'https://sonorahealth.ai',
    category: 'Clinical Health AI',
    batch: 'a16z Speedrun',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '94%',
    framework: 'Next.js',
    bottleneck_detected: 'HIPAA compliant patient telemetry requires strict database-level Row Level Security (RLS) policies rather than client-side security rules.',
    ae_outbound_pitch: 'Hi Sonora Health team — health AI requires ironclad database-level Row Level Security (RLS) for patient record isolation. Supabase Postgres provides native RLS, audit logs, and HIPAA BAA compliance out of the box.'
  },
  {
    id: '6',
    name: 'Talkbase AI',
    url: 'https://talkbase.io',
    category: 'Conversational Intelligence',
    batch: 'YC W25',
    database_stack: 'Supabase Postgres',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '15%',
    framework: 'Next.js',
    bottleneck_detected: 'Optimized on Supabase Edge Functions + pgvector.',
    ae_outbound_pitch: 'Talkbase is native on Supabase. Account status: Retained & Scaling.'
  },
  {
    id: '7',
    name: 'Clario Support',
    url: 'https://clario.app',
    category: 'Customer Ops AI',
    batch: 'a16z Speedrun',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '90%',
    framework: 'React / Python',
    bottleneck_detected: 'Support ticket RAG pipelines require joint relational filtering on customer tier and semantic search on ticket history. Firestore cannot join across collections.',
    ae_outbound_pitch: 'Hey Clario team — saw your speedrun demo. Filtering support tickets by user plan (relational) while running vector search on previous transcripts is a 1-line query in Supabase Postgres + pgvector. Open to comparing query speeds?'
  },
  {
    id: '8',
    name: 'Beacon Legal',
    url: 'https://beaconlegal.ai',
    category: 'Legal Contract Review',
    batch: 'YC W25',
    database_stack: 'Firebase Firestore',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '84%',
    framework: 'Next.js',
    bottleneck_detected: 'Running hybrid DB setup with Firebase Auth and external Postgres. Auth token syncing introduces latency overhead.',
    ae_outbound_pitch: 'Hey Beacon Legal — noticed you run a split architecture between Firebase and Postgres. Supabase unifies Auth, Postgres, and vector embeddings into a single client SDK.'
  },
  {
    id: '9',
    name: 'AgentForge',
    url: 'https://agentforge.dev',
    category: 'Autonomous Multi-Agent Systems',
    batch: 'Sequoia Arc',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '95%',
    framework: 'FastAPI / Next.js',
    bottleneck_detected: 'Multi-agent orchestration requires shared relational memory states and sub-second semantic retrieval. Document store document locking causes agent task timeouts.',
    ae_outbound_pitch: 'Hi AgentForge team — multi-agent systems hit state-locking bottlenecks when orchestrating concurrent agent tasks over Firestore. Supabase Postgres handles concurrent ACID transactions with built-in pgvector for agent memory persistence.'
  },
  {
    id: '10',
    name: 'PromptLens',
    url: 'https://promptlens.io',
    category: 'LLM Observability',
    batch: 'YC W24',
    database_stack: 'Supabase Postgres',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '12%',
    framework: 'Next.js',
    bottleneck_detected: 'High-scale time-series prompt telemetry running on Postgres partitioning and pgvector.',
    ae_outbound_pitch: 'PromptLens is native on Supabase Postgres. Retained enterprise account.'
  },
  {
    id: '11',
    name: 'DocuQuery AI',
    url: 'https://docuquery.ai',
    category: 'Enterprise Document RAG',
    batch: 'YC W24',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '93%',
    framework: 'Next.js',
    bottleneck_detected: 'Splitting document chunk metadata in Firestore and vector embeddings in Pinecone doubles API latency and billing costs.',
    ae_outbound_pitch: 'Hey DocuQuery team — running separate metadata in Firestore and vectors in Pinecone introduces multi-hop latency on enterprise RAG search. Supabase provides native pgvector with HNSW indexing inside Postgres.'
  },
  {
    id: '12',
    name: 'FinAgent AI',
    url: 'https://finagent.co',
    category: 'Financial Analytics AI',
    batch: 'a16z Speedrun',
    database_stack: 'Neon',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '68%',
    framework: 'Next.js',
    bottleneck_detected: 'High-frequency financial agent polling triggers serverless compute cold-starts. Requires dedicated Postgres compute with connection pooling.',
    ae_outbound_pitch: 'Hey FinAgent team — financial AI agent pipelines with high-frequency telemetry benefit from Supabase Supavisor connection pooling and dedicated compute.'
  },
  {
    id: '13',
    name: 'MedScribe AI',
    url: 'https://medscribe.health',
    category: 'Clinical Scribe AI',
    batch: 'Sequoia Arc',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '92%',
    framework: 'React / Python',
    bottleneck_detected: 'HIPAA healthcare data requires immutable audit logs and database-level RLS that Firebase security rules cannot guarantee at scale.',
    ae_outbound_pitch: 'Hi MedScribe team — healthcare transcription needs strict database-level Row Level Security and native audit logs. Supabase gives you enterprise Postgres compliance out of the box.'
  },
  {
    id: '14',
    name: 'CognitiveOps',
    url: 'https://cognitiveops.ai',
    category: 'DevOps & Incident AI',
    batch: 'YC W25',
    database_stack: 'Firebase Firestore',
    vector_search: 'None',
    migration_opportunity_score: '89%',
    framework: 'Next.js',
    bottleneck_detected: 'Real-time incident log analysis requires relational joins across server telemetry and historical incident graphs.',
    ae_outbound_pitch: 'Hey CognitiveOps team — incident analysis requires rich relational joins across server logs and runbooks. Supabase Postgres with Realtime gives you streaming telemetry with full SQL query power.'
  },
  {
    id: '15',
    name: 'SynthVoice',
    url: 'https://synthvoice.app',
    category: 'Voice AI',
    batch: 'a16z Speedrun',
    database_stack: 'Supabase Postgres',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '16%',
    framework: 'Next.js',
    bottleneck_detected: 'Optimized voice pipeline running on Supabase Realtime + Postgres.',
    ae_outbound_pitch: 'SynthVoice is native on Supabase Postgres. Retained account.'
  },
  {
    id: '16',
    name: 'NeuralDraft',
    url: 'https://neuraldraft.dev',
    category: 'AI Code Generation',
    batch: 'YC W25',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '96%',
    framework: 'Next.js',
    bottleneck_detected: 'Repository AST index cannot be modeled relationally in document store collections without heavy client-side stitching.',
    ae_outbound_pitch: 'Hi NeuralDraft team — tracking your coding agent out of YC W25. Modeling codebase ASTs in Firestore leads to query serialization bottlenecks. Supabase Postgres gives you native relational graphs with pgvector in one query.'
  }
];
