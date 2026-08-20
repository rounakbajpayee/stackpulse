import { createClient } from '@supabase/supabase-js';

// Supabase Project Credentials for stackpulse
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://huubxklntrxcwqkoumhd.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const DEFAULT_STARTUPS = [
  {
    id: '1',
    name: 'Cursorly',
    url: 'https://cursorly.ai',
    category: 'AI Coding Agent',
    batch: 'Y Combinator W25',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '94%',
    framework: 'Next.js',
    bottleneck_detected: 'Firestore cannot do relational joins across repo graphs, and Pinecone doubles your vector bill. Supabase collapses Postgres, pgvector, auth, storage into one instance.',
    ae_outbound_pitch: 'Hi Cursorly team — tracking you as one of the sharpest AI Coding Agent teams out of Y Combinator W25, now running on Firebase Firestore with Pinecone.\n\nThe bottleneck we see at your stage: Firestore can\'t do relational joins across repo graphs, and Pinecone doubles your vector bill. Supabase collapses Postgres, pgvector, auth, storage and realtime into one instance so that whole layer disappears.\n\nWe migrate teams like yours in under two weeks with a dedicated engineer — worth 20 minutes this week? (Opportunity score: High 94%)'
  },
  {
    id: '2',
    name: 'Vocalis',
    url: 'https://vocalis.ai',
    category: 'Voice AI',
    batch: 'a16z Speedrun',
    database_stack: 'Firebase Firestore',
    vector_search: 'None',
    migration_opportunity_score: '91%',
    framework: 'FastAPI / React',
    bottleneck_detected: 'Realtime audio state requires sub-50ms WebSocket streaming. Firebase real-time database hits document write limits during multi-speaker conversations.',
    ae_outbound_pitch: 'Hey Vocalis team — loved the launch at a16z Speedrun. Realtime voice workflows require sub-50ms sync without document write limits. Supabase Realtime + Postgres handles high-throughput session state with built-in pgvector for phonetic embedding match. Would love to show you our voice latency benchmarks.'
  },
  {
    id: '3',
    name: 'Repline',
    url: 'https://repline.dev',
    category: 'AI Coding Agent',
    batch: 'Y Combinator W25',
    database_stack: 'Supabase Postgres',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '20%',
    framework: 'Next.js',
    bottleneck_detected: 'Optimized on Supabase Postgres with native pgvector index and RLS security policies.',
    ae_outbound_pitch: 'Repline is already native on Supabase Postgres with pgvector. Account status: High-growth retained account.'
  },
  {
    id: '4',
    name: 'Lexara',
    url: 'https://lexara.law',
    category: 'Legal Tech AI',
    batch: 'Sequoia Arc',
    database_stack: 'DynamoDB',
    vector_search: 'Pinecone',
    migration_opportunity_score: '88%',
    framework: 'React / Node.js',
    bottleneck_detected: 'Complex legal contract clauses require hierarchical relational trees + cosine distance search over statutory precedents.',
    ae_outbound_pitch: 'Hey Lexara team — caught your launch in Sequoia Arc. Legal contract parsing hits indexing friction when splitting metadata in DynamoDB and embeddings in Pinecone. Supabase gives you ACID transactional safety with native HNSW vector indexes in Postgres.'
  },
  {
    id: '5',
    name: 'Sonora Health',
    url: 'https://sonorahealth.ai',
    category: 'Health AI',
    batch: 'a16z Speedrun',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '93%',
    framework: 'Next.js',
    bottleneck_detected: 'HIPAA compliant patient telemetry requires strict Row Level Security (RLS) policies at the database layer rather than client-side rules.',
    ae_outbound_pitch: 'Hi Sonora Health team — health AI requires ironclad database-level Row Level Security (RLS) for patient record isolation. Supabase Postgres provides native RLS, audit logs, and HIPAA BAA support out of the box.'
  },
  {
    id: '6',
    name: 'Talkbase',
    url: 'https://talkbase.io',
    category: 'Voice AI',
    batch: 'Y Combinator W25',
    database_stack: 'Supabase Postgres',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '20%',
    framework: 'Next.js',
    bottleneck_detected: 'Optimized architecture leveraging Supabase Edge Functions + pgvector.',
    ae_outbound_pitch: 'Talkbase is native on Supabase. Account status: Retained & Scaling.'
  },
  {
    id: '7',
    name: 'Clario',
    url: 'https://clario.app',
    category: 'Support Automation',
    batch: 'a16z Speedrun',
    database_stack: 'Firebase Firestore',
    vector_search: 'Pinecone',
    migration_opportunity_score: '90%',
    framework: 'React / Python',
    bottleneck_detected: 'Support ticket RAG pipelines require joint relational filtering on customer tier and semantic search on ticket history.',
    ae_outbound_pitch: 'Hey Clario team — saw your speedrun demo. Filtering support tickets by user plan (relational) while running vector search on previous transcripts is a 1-line query in Supabase Postgres + pgvector. Open to comparing query speeds?'
  },
  {
    id: '8',
    name: 'Beacon Legal',
    url: 'https://beaconlegal.ai',
    category: 'Legal Tech',
    batch: 'Y Combinator W25',
    database_stack: 'Firebase Firestore',
    vector_search: 'pgvector (Native)',
    migration_opportunity_score: '84%',
    framework: 'Next.js',
    bottleneck_detected: 'Running hybrid DB setup with Firebase Auth and external Postgres. Auth token syncing introduces latency overhead.',
    ae_outbound_pitch: 'Hey Beacon Legal — noticed you run a split architecture between Firebase and Postgres. Supabase unifies Auth, Postgres, and vector embeddings into a single client SDK.'
  }
];
