import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function determineStack(tools: string[]): { 
  database_stack: string;
  vector_search: string;
  primary_database: string;
  vector_engine: string;
  cache_layer: string;
  olap_engine: string;
  auth_provider: string;
  runtime_platform: string;
  all_detected: string[];
} {
  let primaryDb = "Unknown";
  let vector = "None";
  let cache = "None";
  let olap = "None";
  let auth = "None";
  let runtime = "Vercel + Cloud";
  const detected: string[] = [];

  for (const item of tools) {
    const t = String(item).toLowerCase();
    if (t.includes("supabase")) {
      detected.push("Supabase Postgres");
      primaryDb = "Supabase Postgres";
      if (auth === "None") auth = "Supabase Auth";
    } else if (t.includes("firebase") || t.includes("firestore")) {
      detected.push("Firebase Firestore");
      primaryDb = "Firebase Firestore";
      if (auth === "None") auth = "Firebase Auth";
    } else if (t.includes("mongodb atlas") || t.includes("mongodb") || t.includes("mongo")) {
      detected.push("MongoDB Atlas");
      primaryDb = "MongoDB Atlas";
    } else if (t.includes("planetscale")) {
      detected.push("PlanetScale");
      primaryDb = "PlanetScale";
    } else if (t.includes("dynamodb")) {
      detected.push("AWS DynamoDB");
      primaryDb = "AWS DynamoDB";
    } else if (t.includes("aurora") || t.includes("rds")) {
      detected.push("AWS Aurora / RDS");
      primaryDb = "AWS Aurora / RDS";
    } else if (t.includes("clickhouse")) {
      detected.push("ClickHouse");
      primaryDb = "ClickHouse";
      olap = "ClickHouse";
    } else if (t.includes("cockroach")) {
      detected.push("CockroachDB");
      primaryDb = "CockroachDB";
    } else if (t.includes("postgres") || t.includes("postgresql")) {
      detected.push("PostgreSQL");
      if (primaryDb === "Unknown") primaryDb = "PostgreSQL";
    } else if (t.includes("mysql")) {
      detected.push("MySQL");
      if (primaryDb === "Unknown") primaryDb = "MySQL";
    } else if (t.includes("redis") || t.includes("elasticache") || t.includes("upstash")) {
      detected.push("Redis");
      cache = "Redis";
    } else if (t.includes("opensearch") || t.includes("elasticsearch")) {
      detected.push("OpenSearch / Elasticsearch");
      olap = "OpenSearch / Elasticsearch";
    } else if (t.includes("snowflake")) {
      olap = "Snowflake";
    } else if (t.includes("bigquery")) {
      olap = "BigQuery";
    } else if (t.includes("clerk")) {
      auth = "Clerk";
    } else if (t.includes("auth0")) {
      auth = "Auth0";
    } else if (t.includes("qdrant") || t.includes("pinecone") || t.includes("weaviate") || t.includes("milvus") || t.includes("pgvector")) {
      vector = item;
    }
  }

  const uniqueDbs = [...new Set(detected)];
  if (uniqueDbs.length > 0) {
    primaryDb = uniqueDbs.join(" + ");
  }

  return { 
    database_stack: primaryDb, 
    vector_search: vector,
    primary_database: primaryDb !== "Unknown" ? primaryDb : "Unknown",
    vector_engine: vector,
    cache_layer: cache,
    olap_engine: olap,
    auth_provider: auth,
    runtime_platform: runtime,
    all_detected: uniqueDbs 
  };
}

function getCandidateSlugs(name: string, website: string | null): string[] {
  const rawName = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  let hostBase = '';
  if (website) {
    try {
      const host = new URL(website).hostname.replace(/^www\./, '');
      hostBase = host.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    } catch(e) {}
  }
  const set = new Set([
    rawName,
    hostBase,
    rawName + 'inc',
    rawName + 'hq',
    hostBase + 'inc',
    hostBase + 'hq',
    rawName + 'ai',
    hostBase + 'ai'
  ]);
  return [...set].filter(Boolean);
}

async function detectStack(name: string, website: string | null, groqKey?: string, scraperKey?: string) {
  const allDetectedTools: string[] = [];
  let source = "unknown";
  let depth = "unscanned";

  // Tier 1: Public GitHub API (Free)
  const slugs = getCandidateSlugs(name, website);
  for (const slug of slugs.slice(0, 3)) {
    try {
      const ghRes = await fetch(`https://api.github.com/orgs/${slug}/repos?per_page=5&sort=pushed`, {
        headers: { 'User-Agent': 'StackPulse-Enrichment' }
      });
      if (ghRes.ok) {
        const repos = await ghRes.json();
        for (const repo of repos.slice(0, 3)) {
          const filesRes = await fetch(`https://api.github.com/repos/${slug}/${repo.name}/contents`, {
            headers: { 'User-Agent': 'StackPulse-Enrichment' }
          });
          if (filesRes.ok) {
            const files = await filesRes.json();
            const filenames = Array.isArray(files) ? files.map((f: any) => f.name.toLowerCase()) : [];
            if (filenames.includes('schema.prisma')) {
              const fileData = await (await fetch(`https://raw.githubusercontent.com/${slug}/${repo.name}/${repo.default_branch || 'main'}/schema.prisma`)).text();
              if (fileData.includes('postgresql')) allDetectedTools.push('PostgreSQL');
              if (fileData.includes('mysql')) allDetectedTools.push('MySQL');
              if (fileData.includes('mongodb')) allDetectedTools.push('MongoDB Atlas');
            }
            if (filenames.includes('supabase') || filenames.includes('.supabase')) allDetectedTools.push('Supabase');
          }
        }
        if (allDetectedTools.length > 0) {
          source = "github";
          depth = "confirmed";
          break;
        }
      }
    } catch(e) {}
  }

  // Tier 2: Free Ashby Public Job Boards
  if (allDetectedTools.length === 0) {
    for (const slug of slugs.slice(0, 3)) {
      try {
        const ashbyRes = await fetch(`https://api.ashbyhq.com/posting-api/job-board/${slug}`);
        if (ashbyRes.ok) {
          const data = await ashbyRes.json();
          const jobText = (data.jobs || []).map((j: any) => `${j.title} ${j.descriptionPlain || ''}`).join(' ').toLowerCase();
          if (jobText.includes('supabase')) allDetectedTools.push('Supabase');
          if (jobText.includes('postgres')) allDetectedTools.push('PostgreSQL');
          if (jobText.includes('pinecone')) allDetectedTools.push('Pinecone');
          if (jobText.includes('pgvector')) allDetectedTools.push('pgvector');
          if (jobText.includes('redis')) allDetectedTools.push('Redis');
          if (jobText.includes('clerk')) allDetectedTools.push('Clerk');
          if (jobText.includes('mongodb')) allDetectedTools.push('MongoDB Atlas');
          if (allDetectedTools.length > 0) {
            source = "job_board";
            depth = "confirmed";
            break;
          }
        }
      } catch(e) {}
    }
  }

  // Tier 3: HTML DOM Scanning
  if (allDetectedTools.length === 0 && website) {
    try {
      const webRes = await fetch(website, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(3000) });
      if (webRes.ok) {
        const html = (await webRes.text()).toLowerCase();
        if (html.includes('supabase.co')) allDetectedTools.push('Supabase');
        if (html.includes('clerk.com') || html.includes('clerk.dev')) allDetectedTools.push('Clerk');
        if (html.includes('firebaseapp.com')) allDetectedTools.push('Firebase Firestore');
        if (allDetectedTools.length > 0) {
          source = "html_signals";
          depth = "confirmed";
        } else {
          depth = "surface_free";
        }
      }
    } catch(e) {
      depth = "surface_free";
    }
  }

  const stack = determineStack(allDetectedTools);
  return { ...stack, source, depth };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const groqKey = Deno.env.get('GROQ_API_KEY');
    const scraperKey = Deno.env.get('SCRAPERAPI_KEY');

    const { data: pipelineCos, error: fetchErr } = await supabaseClient
      .from('vc_pipeline')
      .select('*')
      .is('processed_at', null)
      .limit(10);
      
    if (fetchErr) throw fetchErr;
    if (!pipelineCos || pipelineCos.length === 0) {
      return new Response(JSON.stringify({ success: true, message: "No unprocessed companies" }), { headers: corsHeaders });
    }

    const results = [];
    for (const c of pipelineCos) {
      const stackInfo = await detectStack(c.name, c.website, groqKey, scraperKey);
      
      await supabaseClient.from('verified_startups').upsert({
        id: c.id,
        name: c.name,
        investor: c.investor,
        website_url: c.website,
        database_stack: stackInfo.database_stack,
        vector_search: stackInfo.vector_search,
        primary_database: stackInfo.primary_database,
        vector_engine: stackInfo.vector_engine,
        cache_layer: stackInfo.cache_layer,
        olap_engine: stackInfo.olap_engine,
        auth_provider: stackInfo.auth_provider,
        runtime_platform: stackInfo.runtime_platform,
        detected_stack: stackInfo.all_detected,
        stack_source: stackInfo.source,
        verification_depth: stackInfo.depth,
        verification_status: stackInfo.primary_database !== 'Unknown' ? 'verified' : 'unverified',
        stack_verified_at: new Date().toISOString()
      });

      await supabaseClient.from('vc_pipeline').update({
        processed_at: new Date().toISOString()
      }).eq('id', c.id);

      results.push({ name: c.name, stack: stackInfo.database_stack, depth: stackInfo.depth });
    }

    return new Response(JSON.stringify({ success: true, processed: results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Process error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
