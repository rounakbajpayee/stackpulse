import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

const TECH_SIGNATURES = [
  { name: 'Supabase', regex: /@supabase\/supabase-js|supabase-js/i },
  { name: 'Firebase', regex: /firebase|firebase-admin/i },
  { name: 'MongoDB', regex: /mongodb|mongoose|@nestjs\/mongoose/i },
  { name: 'PostgreSQL', regex: /pg|postgres|typeorm|prisma/i },
  { name: 'Pinecone', regex: /pinecone-database/i },
  { name: 'pgvector', regex: /pgvector/i },
];

async function getGithubManifest(owner: string, repo: string): Promise<string> {
  const filesToTry = ['package.json', 'requirements.txt', 'docker-compose.yml', 'go.mod'];
  let combinedManifests = "";
  for (const file of filesToTry) {
    try {
      const res = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/main/${file}`);
      if (res.ok) combinedManifests += await res.text() + "\n";
      else {
        const resMaster = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/master/${file}`);
        if (resMaster.ok) combinedManifests += await resMaster.text() + "\n";
      }
    } catch (e) {}
  }
  return combinedManifests;
}

async function findGithubRepoFromWebsite(url: string): Promise<{owner: string, repo: string} | null> {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'StackPulse' }, signal: AbortSignal.timeout(5000) });
    const html = await res.text();
    const ghMatch = html.match(/github\\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/i);
    if (ghMatch) return { owner: ghMatch[1], repo: ghMatch[2] };
  } catch (e) {}
  return null;
}

serve(async (req) => {
  try {
    console.log("Starting YC verification pipeline...");
    const ycRes = await fetch("https://yc-oss.github.io/api/companies/all.json");
    const ycData = await ycRes.json();
    
    // Filter for AI / DevTools
    const aiStartups = ycData.filter((c: any) => 
      c.tags && (c.tags.includes('AI') || c.tags.includes('Generative AI') || c.tags.includes('Developer Tools'))
    );

    // Pick 20 random startups
    const shuffled = aiStartups.sort(() => 0.5 - Math.random()).slice(0, 20);
    let processed = 0;
    let verifiedCount = 0;

    for (const startup of shuffled) {
      const existing = await supabase.from('verified_startups').select('id').eq('name', startup.name).single();
      if (existing.data) continue;

      let owner = "", repo = "";
      if (startup.website) {
        const gh = await findGithubRepoFromWebsite(startup.website);
        if (gh) {
          owner = gh.owner;
          repo = gh.repo;
        }
      }

      let detectedStack: string[] = [];
      let dbStack = "Unknown";
      let vectorSearch = "None";
      let status = "verified"; // Inherently verified since it's from the official YC dataset
      let stars = 0;

      if (owner && repo) {
        try {
          const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: { 'User-Agent': 'StackPulse' }
          });
          if (repoRes.ok) {
            const repoData = await repoRes.json();
            stars = repoData.stargazers_count || 0;
          }
        } catch (e) {}

        const manifests = await getGithubManifest(owner, repo);
        if (manifests.length > 0) {
          for (const sig of TECH_SIGNATURES) {
            if (sig.regex.test(manifests)) detectedStack.push(sig.name);
          }
          
          if (detectedStack.includes('Supabase') || detectedStack.includes('PostgreSQL')) dbStack = "Postgres (Supabase)";
          else if (detectedStack.includes('Firebase')) dbStack = "Firebase";
          else if (detectedStack.includes('MongoDB')) dbStack = "MongoDB Atlas";

          if (detectedStack.includes('Pinecone') || detectedStack.includes('pgvector')) {
             vectorSearch = detectedStack.includes('Pinecone') ? 'Pinecone' : 'pgvector';
          }
        }
      }

      await supabase.from('verified_startups').upsert({
        id: startup.id.toString(),
        name: startup.name,
        github_url: owner && repo ? `https://github.com/${owner}/${repo}` : null,
        website_url: startup.website,
        yc_batch: startup.batch,
        database_stack: dbStack,
        vector_search: vectorSearch,
        detected_stack: detectedStack,
        verification_status: status,
        last_verified_at: new Date().toISOString()
      }, { onConflict: 'id' });
      processed++;
    }

    return new Response(JSON.stringify({ message: `Processed ${processed} YC startups. ${verifiedCount}` }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err: any) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
