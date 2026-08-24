import { createClient } from "@supabase/supabase-js";
import dns from 'node:dns/promises';
import { execSync } from 'node:child_process';

const SUPABASE_URL = process.env.SUPABASE_URL || "https://huubxklntrxcwqkoumhd.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const SCRAPER_API_KEY = process.env.SCRAPER_API_KEY || "";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Retrieve authenticated GitHub token via gh CLI or environment
let githubToken = process.env.GITHUB_TOKEN || '';
if (!githubToken) {
  try {
    githubToken = execSync('gh auth token', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch(e) {}
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchWithRetry(url, options = {}, maxRetries = 2, timeoutMs = 4000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try { 
      const res = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) }); 
      if (res.status === 429 || res.status === 503) {
        const retryAfterHeader = res.headers.get('retry-after');
        let waitMs = retryAfterHeader ? parseInt(retryAfterHeader, 10) * 1000 : Math.min(6000, 1500 * Math.pow(2, attempt) + Math.random() * 500);
        if (isNaN(waitMs) || waitMs <= 0) waitMs = 1500;
        await sleep(waitMs);
        continue;
      }
      return res;
    } catch(e) { 
      await sleep(150 + Math.random() * 200); 
      continue; 
    }
  }
  return { ok: false, status: 500 };
}

function determineStack(tools) {
  let primaryDb = "Unknown"; 
  let vector = "None";
  const list = Array.isArray(tools) ? tools : [String(tools)];
  const detected = [];
  
  for (const item of list) {
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

function getCandidateSlugs(name, website) {
    const rawName = (name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    let hostBase = '';
    let hostFull = '';
    if (website) {
        try {
            const host = new URL(website).hostname.replace(/^www\./, '');
            hostBase = host.split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            hostFull = host.toLowerCase().replace(/^www\./, '');
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
        hostBase + 'ai',
        hostFull
    ]);
    return [...set].filter(Boolean);
}

async function askGroq(text) {
  if (!GROQ_API_KEY) return { databases: [], is_dead: false };
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const prompt = `Extract ONLY the databases/caching/vector tools used by the company. Return raw JSON: {"databases":["PostgreSQL","Redis"]}. Text: ${text.slice(0, 6000)}`;

  try {
    const res = await fetchWithRetry(url, {
      method: 'POST', 
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY },
      body: JSON.stringify({ 
         model: "openai/gpt-oss-20b", 
         messages: [{ role: "user", content: prompt }] 
      })
    }, 2, 4000);
    if (!res.ok) return { databases: [], is_dead: false };
    const data = await res.json();
    const textOut = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(textOut.replace(/```json/gi, '').replace(/```/g, '').trim());
    return { databases: Array.isArray(parsed.databases) ? parsed.databases : [], is_dead: !!parsed.is_dead };
  } catch(e) { return { databases: [], is_dead: false }; }
}

export async function runProductionEnrichment() {
    console.log("==========================================================");
    console.log("🚀 StackPulse Production Enrichment Pipeline");
    console.log(`GitHub Auth: ${githubToken ? '✅ Enabled' : '❌ Disabled'}`);
    console.log(`Groq LLM: ${GROQ_API_KEY ? '✅ Configured' : '⚠️ Missing (Free heuristic only)'}`);
    console.log("==========================================================\n");
}

if (process.argv[1]?.endsWith('enrichment_runner.mjs')) {
    runProductionEnrichment().catch(console.error);
}
