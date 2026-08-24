import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function determineStack(tools: string[]): { database_stack: string, vector_search: string, all_detected: string[] } {
  let primaryDb = "Unknown";
  let vector = "None";
  const detected: string[] = [];

  for (const item of tools) {
    const t = String(item).toLowerCase();
    if (t.includes("supabase")) detected.push("Supabase Postgres");
    else if (t.includes("firebase") || t.includes("firestore")) detected.push("Firebase Firestore");
    else if (t.includes("mongodb atlas") || t.includes("mongodb") || t.includes("mongo")) detected.push("MongoDB Atlas");
    else if (t.includes("planetscale")) detected.push("PlanetScale");
    else if (t.includes("dynamodb")) detected.push("AWS DynamoDB");
    else if (t.includes("aurora") || t.includes("rds")) detected.push("AWS Aurora / RDS");
    else if (t.includes("clickhouse")) detected.push("ClickHouse");
    else if (t.includes("cockroach")) detected.push("CockroachDB");
    else if (t.includes("postgres") || t.includes("postgresql")) detected.push("PostgreSQL");
    else if (t.includes("mysql")) detected.push("MySQL");
    else if (t.includes("redis") || t.includes("elasticache") || t.includes("upstash")) detected.push("Redis");
    else if (t.includes("opensearch") || t.includes("elasticsearch")) detected.push("OpenSearch / Elasticsearch");
    else if (t.includes("sqlite") || t.includes("duckdb")) detected.push("SQLite / DuckDB");
    else if (t.includes("qdrant") || t.includes("pinecone") || t.includes("weaviate") || t.includes("milvus")) {
      vector = item;
    }
  }

  const uniqueDbs = [...new Set(detected)];
  if (uniqueDbs.length > 0) {
    primaryDb = uniqueDbs.join(" + ");
  }
  return { database_stack: primaryDb, vector_search: vector, all_detected: uniqueDbs };
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

// Tier 1: Direct GitHub Monorepos (0 credits)
async function checkDirectGithub(candidateSlugs: string[]): Promise<string[]> {
  const subPaths = ['package.json', 'prisma/schema.prisma', 'packages/database/schema.prisma', 'docker-compose.yml'];
  const urls: string[] = [];
  
  for (const org of candidateSlugs.slice(0, 2)) {
    for (const sp of subPaths) {
      urls.push(`https://raw.githubusercontent.com/${org}/${org}/main/${sp}`);
    }
  }

  const signals: string[] = [];
  await Promise.all(urls.map(async (rawUrl) => {
    try {
      const res = await fetch(rawUrl, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const content = (await res.text()).toLowerCase();
        if (content.includes("@supabase/supabase-js") || content.includes("supabase")) signals.push("supabase");
        if (content.includes("firebase") || content.includes("@firebase/app")) signals.push("firebase");
        if (content.includes("mongodb") || content.includes("mongoose")) signals.push("mongodb");
        if (content.includes("planetscale") || content.includes("@planetscale/database")) signals.push("planetscale");
        if (content.includes("pg") || content.includes("postgres") || content.includes("postgresql")) signals.push("postgresql");
        if (content.includes("mysql") || content.includes("mysql2")) signals.push("mysql");
        if (content.includes("redis") || content.includes("ioredis") || content.includes("@upstash/redis")) signals.push("redis");
        if (content.includes("clickhouse")) signals.push("clickhouse");
      }
    } catch(e) {}
  }));

  return [...new Set(signals)];
}

// Tier 2: Public ATS Job Boards REST APIs (0 credits)
async function tryFallbackAts(candidateSlugs: string[]): Promise<string | null> {
  const slugs = candidateSlugs.slice(0, 2);
  const checks = [];

  for (const s of slugs) {
    checks.push(
      fetch(`https://api.ashbyhq.com/posting-api/job-board/${s}`, { signal: AbortSignal.timeout(2000) })
        .then(async r => {
          if (r.ok) {
            const data = await r.json();
            if (data.jobs && data.jobs.length > 0) {
              return data.jobs.map((j: any) => `${j.title}: ${j.descriptionPlain || ''}`).join('\n\n');
            }
          }
          return null;
        }).catch(() => null)
    );

    checks.push(
      fetch(`https://boards-api.greenhouse.io/v1/boards/${s}/jobs?content=true`, { signal: AbortSignal.timeout(2000) })
        .then(async r => {
          if (r.ok) {
            const data = await r.json();
            if (data.jobs && data.jobs.length > 0) {
              return data.jobs.map((j: any) => `${j.title}: ${j.content || ''}`).join('\n\n');
            }
          }
          return null;
        }).catch(() => null)
    );
  }

  const results = await Promise.all(checks);
  const valid = results.filter(r => r && r.length > 100);
  return valid.length > 0 ? valid.join('\n\n').substring(0, 8000) : null;
}

// LLM Inference with Groq
async function askLlmForStack(text: string, groqKey: string): Promise<string[]> {
  if (!groqKey || !text) return [];
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
      body: JSON.stringify({
        model: "openai/gpt-oss-20b",
        messages: [{
          role: "user",
          content: `Extract ONLY databases/caching/vector used by the company. Return raw JSON: {"databases":["PostgreSQL","Redis"]}. Text: ${text.slice(0, 6000)}`
        }]
      })
    });
    if (!res.ok) return [];
    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim() || '{}');
    return Array.isArray(parsed.databases) ? parsed.databases : [];
  } catch(e) {
    return [];
  }
}

// Multi-Tier Detection Engine
async function detectStack(name: string, website: string | null, groqKey: string, scraperKey: string) {
  const candidateSlugs = getCandidateSlugs(name, website);

  // 1. Direct GitHub Check (0 credits)
  const ghSignals = await checkDirectGithub(candidateSlugs);
  if (ghSignals.length > 0) {
    return { source: 'github', depth: 'confirmed', ...determineStack(ghSignals) };
  }

  // 2. ATS Job Board API (0 credits)
  const atsText = await tryFallbackAts(candidateSlugs);
  if (atsText) {
    const llmDbs = await askLlmForStack(atsText, groqKey);
    if (llmDbs.length > 0) {
      return { source: 'job_board', depth: 'confirmed', ...determineStack(llmDbs) };
    }
  }

  // 3. Client JS Sniffing (0 credits)
  if (website) {
    try {
      const res = await fetch(website, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const html = (await res.text()).toLowerCase();
        const signals: string[] = [];
        if (html.includes("supabase.co") || html.includes("@supabase/supabase-js")) signals.push("supabase");
        if (html.includes("firebaseapp.com") || html.includes("firestore.googleapis.com")) signals.push("firebase");
        if (html.includes("mongodb.net")) signals.push("mongodb");
        if (signals.length > 0) {
          return { source: 'html_signals', depth: 'confirmed', ...determineStack(signals) };
        }
      }
    } catch(e) {}
  }

  // 4. ScraperAPI + Google Search (Conditional Tier)
  if (scraperKey && website) {
    try {
      const domain = new URL(website).hostname.replace(/^www\./, '');
      const query = `("${domain}" OR "${name}") ("postgres" OR "mongodb" OR "dynamodb" OR "redis" OR "supabase") "architecture" OR "database"`;
      const proxyUrl = `https://api.scraperapi.com?api_key=${scraperKey}&url=${encodeURIComponent(`https://www.google.com/search?q=${encodeURIComponent(query)}`)}`;
      
      const sRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(7000) });
      if (sRes.ok) {
        const sHtml = await sRes.text();
        const snippets = [...sHtml.matchAll(/<div[^>]+style="[^"]*webkit-line-clamp[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
          .map(m => m[1].replace(/<[^>]+>/g, '').trim())
          .join('\n\n');

        if (snippets.length > 50) {
          const llmDbs = await askLlmForStack(snippets, groqKey);
          if (llmDbs.length > 0) {
            return { source: 'google_search', depth: 'confirmed', ...determineStack(llmDbs) };
          }
        }
        return { source: 'google_search', depth: 'deep_scraped', database_stack: 'Unknown', vector_search: 'None', all_detected: [] };
      }
    } catch(e) {}
  }

  return { 
    source: 'unknown', 
    depth: scraperKey ? 'deep_scraped' : 'surface_free', 
    database_stack: 'Unknown', 
    vector_search: 'None', 
    all_detected: [] 
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const groqKey = Deno.env.get('GROQ_API_KEY') ?? '';
    const scraperKey = Deno.env.get('SCRAPER_API_KEY') ?? '';

    // Fetch batch of unprocessed companies
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
        detected_stack: stackInfo.all_detected,
        stack_source: stackInfo.source,
        verification_depth: stackInfo.depth,
        verification_status: 'verified',
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
