import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

const TECH_SIGNATURES = [
  { name: "Supabase", regex: /@supabase\/supabase-js|supabase-js/i },
  { name: "Firebase", regex: /firebase|firebase-admin/i },
  { name: "MongoDB", regex: /mongodb|mongoose|@nestjs\/mongoose/i },
  { name: "PostgreSQL", regex: /\bpg\b|postgres|typeorm|prisma/i },
  { name: "Pinecone", regex: /pinecone-database/i },
  { name: "pgvector", regex: /pgvector/i },
];

interface Company {
  name: string;
  website?: string;
  description?: string;
}

// a16z: scrape as markdown and parse the bullet-list of company names
async function scrapeA16z(): Promise<Company[]> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://a16z.com/investment-list/",
      formats: ["markdown"],
      onlyMainContent: true,
      waitFor: 2000,
      maxAge: 0,
    }),
    signal: AbortSignal.timeout(60_000),
  });
  const data = await res.json();
  const markdown: string = data?.data?.markdown ?? data?.markdown ?? "";

  // The page renders as an alphabetised bullet list: "- CompanyName"
  const lines = markdown.split("\n");
  const companies: Company[] = [];
  for (const line of lines) {
    const match = line.match(/^[-*]\s+(.+)$/);
    if (match) {
      const name = match[1].trim();
      // Filter out nav/footer noise: must be 2–50 chars, no markdown links
      if (name.length >= 2 && name.length <= 50 && !name.includes("[") && !name.includes("http")) {
        companies.push({ name });
      }
    }
  }
  return companies;
}

// Sequoia: full JSON extraction with schema — page is lighter and renders cleanly
async function scrapeSequoia(): Promise<Company[]> {
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${firecrawlKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: "https://sequoiacap.com/our-companies/",
      formats: ["json"],
      jsonOptions: {
        prompt:
          "Extract every portfolio company listed on this page. Return a JSON object with a 'companies' array, each element having 'name' (string) and optionally 'website' (string, the company URL if present) and 'description' (string).",
        schema: {
          type: "object",
          required: ["companies"],
          properties: {
            companies: {
              type: "array",
              items: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string" },
                  website: { type: "string" },
                  description: { type: "string" },
                },
              },
            },
          },
        },
      },
      waitFor: 3000,
      maxAge: 0,
    }),
    signal: AbortSignal.timeout(90_000),
  });
  const data = await res.json();
  return data?.data?.json?.companies ?? [];
}


async function findGithubFromWebsite(
  url: string
): Promise<{ owner: string; repo: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "StackPulse" },
      signal: AbortSignal.timeout(6000),
    });
    const html = await res.text();
    const m = html.match(/github\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_.-]+)/i);
    if (m) return { owner: m[1], repo: m[2] };
  } catch (_) { /* ignore */ }
  return null;
}

async function getManifests(owner: string, repo: string): Promise<string> {
  const files = ["package.json", "requirements.txt", "docker-compose.yml", "go.mod"];
  let combined = "";
  for (const file of files) {
    for (const branch of ["main", "master"]) {
      try {
        const r = await fetch(
          `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file}`
        );
        if (r.ok) { combined += await r.text() + "\n"; break; }
      } catch (_) { /* ignore */ }
    }
  }
  return combined;
}

async function detectStack(manifests: string) {
  const detected: string[] = [];
  for (const sig of TECH_SIGNATURES) {
    if (sig.regex.test(manifests)) detected.push(sig.name);
  }
  let dbStack = "Unknown";
  let vectorSearch = "None";
  if (detected.includes("Supabase") || detected.includes("PostgreSQL"))
    dbStack = "Postgres (Supabase)";
  else if (detected.includes("Firebase")) dbStack = "Firebase";
  else if (detected.includes("MongoDB")) dbStack = "MongoDB Atlas";
  if (detected.includes("Pinecone")) vectorSearch = "Pinecone";
  else if (detected.includes("pgvector")) vectorSearch = "pgvector";
  return { detected, dbStack, vectorSearch };
}

async function processCompanies(
  companies: Company[],
  investor: "a16z" | "sequoia"
) {
  let processed = 0;
  // Shuffle and cap at 30 per run to avoid Edge Function timeout
  const batch = companies.sort(() => 0.5 - Math.random()).slice(0, 30);

  for (const company of batch) {
    if (!company.name || company.name.length < 2) continue;

    // Skip if already in DB from this investor
    const { data: existing } = await supabase
      .from("verified_startups")
      .select("id")
      .eq("name", company.name)
      .eq("investor", investor)
      .maybeSingle();
    if (existing) continue;

    let githubOwner = "";
    let githubRepo = "";
    let dbStack = "Unknown";
    let vectorSearch = "None";
    let detected: string[] = [];

    if (company.website) {
      const gh = await findGithubFromWebsite(company.website);
      if (gh) {
        githubOwner = gh.owner;
        githubRepo = gh.repo;
        const manifests = await getManifests(githubOwner, githubRepo);
        if (manifests.length > 0) {
          const stack = await detectStack(manifests);
          detected = stack.detected;
          dbStack = stack.dbStack;
          vectorSearch = stack.vectorSearch;
        }
      }
    }

    const id = `${investor}-${company.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    await supabase.from("verified_startups").upsert(
      {
        id,
        name: company.name,
        investor,
        website_url: company.website ?? null,
        github_url:
          githubOwner && githubRepo
            ? `https://github.com/${githubOwner}/${githubRepo}`
            : null,
        database_stack: dbStack,
        vector_search: vectorSearch,
        detected_stack: detected,
        verification_status: "verified",
        last_verified_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
    processed++;
  }
  return processed;
}

serve(async (_req) => {
  try {
    console.log("Starting VC portfolio scrape...");

    const [a16zCompanies, sequoiaCompanies] = await Promise.all([
      scrapeA16z(),
      scrapeSequoia(),
    ]);

    console.log(`a16z: ${a16zCompanies.length} companies, Sequoia: ${sequoiaCompanies.length} companies`);

    const [a16zCount, sequoiaCount] = await Promise.all([
      processCompanies(a16zCompanies, "a16z"),
      processCompanies(sequoiaCompanies, "sequoia"),
    ]);

    return new Response(
      JSON.stringify({
        message: `Processed ${a16zCount} a16z + ${sequoiaCount} Sequoia companies.`,
        a16z_scraped: a16zCompanies.length,
        sequoia_scraped: sequoiaCompanies.length,
      }),
      { headers: { "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
