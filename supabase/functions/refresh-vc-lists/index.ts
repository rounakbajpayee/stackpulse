import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SOFTWARE_TAGS = new Set([
  'AI', 'Artificial Intelligence', 'Generative AI', 'Machine Learning',
  'Developer Tools', 'SaaS', 'B2B', 'API', 'Infrastructure',
  'Data Engineering', 'Analytics', 'Security', 'Enterprise Software',
  'Enterprise', 'Open Source', 'Fintech', 'Payments', 'Finance',
  'AIOps', 'Workflow Automation', 'Sales', 'Marketing', 'Productivity',
  'HR Tech', 'LegalTech', 'Education', 'AI Assistant', 'Design Tools',
  'Recruiting', 'Compliance', 'Insurance', 'E-commerce', 'Marketplace',
  'Health Tech', 'Digital Health', 'Automation'
]);

const EXCLUDE_ONLY = new Set([
  'Hardware', 'Biotech', 'Robotics', 'Medical Devices',
  'Climate', 'Hard Tech', 'Manufacturing', 'Construction',
  'Crypto / Web3', 'Delivery'
]);

function isTargetSoftware(tags: string[] = []): boolean {
  if (!tags.length) return false;
  let hasSoftware = false;
  let hasExclude = false;
  for (const t of tags) {
    if (SOFTWARE_TAGS.has(t)) hasSoftware = true;
    if (EXCLUDE_ONLY.has(t)) hasExclude = true;
  }
  if (hasExclude && !hasSoftware) return false;
  return hasSoftware;
}

async function fetchYCCompanies() {
  console.log("Fetching YC...");
  const res = await fetch("https://yc-oss.github.io/api/companies/all.json");
  const allCos = await res.json();
  const validCos = allCos.filter((c: any) => isTargetSoftware(c.tags || []));
  return validCos.map((c: any) => ({
    id: "yc_" + (c.id || c.name.toLowerCase().replace(/[^a-z0-9]/g, '')),
    name: c.name,
    investor: 'yc',
    website: c.website || null
  }));
}

async function fetchA16zCompanies(scraperKey: string) {
  console.log("Fetching a16z...");
  const apiReqUrl = "http://api.scraperapi.com?api_key=" + scraperKey + "&url=" + encodeURIComponent("https://a16z.com/portfolio/");
  const res = await fetch(apiReqUrl);
  if (!res.ok) throw new Error("a16z error");
  const html = await res.text();
  
  const regex = /data-company='(\{.*?\})'/g;
  const companies = [];
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      // Decode HTML entities if any, though usually raw JSON in attributes
      const rawJson = match[1].replace(/&quot;/g, '"');
      const data = JSON.parse(rawJson);
      if (data.name) {
        // Find URL in data
        let website = null;
        if (data.links) {
          const mainLink = data.links.find((l: any) => l.title?.toLowerCase() === 'website' || l.url);
          website = mainLink?.url || null;
        }
        
        companies.push({
          id: "a16z_" + data.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
          name: data.name,
          investor: 'a16z',
          website: website
        });
      }
    } catch(e) { }
  }
  
  // Deduplicate
  const unique = Array.from(new Map(companies.map(c => [c.id, c])).values());
  console.log("A16Z count: ", unique.length);
  return unique;
}

async function fetchSequoiaCompanies(fcKey: string) {
  console.log("Fetching Sequoia...");
  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + fcKey },
    body: JSON.stringify({
      url: "https://www.sequoiacap.com/our-companies/",
      formats: ["json"],
      actions: [
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 },
        { type: "scroll", direction: "down" },
        { type: "wait", milliseconds: 1000 }
      ],
      jsonOptions: {
        prompt: "Extract the list of all portfolio companies shown on the page.",
        schema: {
          type: "object",
          properties: {
            companies: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  website: { type: "string" }
                }
              }
            }
          }
        }
      }
    })
  });
  if (!res.ok) throw new Error("Sequoia error");
  const data = await res.json();
  const list = data.data?.json?.companies || [];
  return list.map((c: any) => ({
    id: "sequoia_" + c.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
    name: c.name,
    investor: 'sequoia',
    website: c.website || null
  }));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    const fcKey = Deno.env.get('FIRECRAWL_API_KEY') ?? '';
    const scraperKeysStr = Deno.env.get('SCRAPER_API_KEYS') ?? Deno.env.get('SCRAPER_API_KEY') ?? '';
    const scraperKey = scraperKeysStr.split(',')[0]?.trim() || '';

    const [yc, a16z, sequoia] = await Promise.all([
      fetchYCCompanies(),
      fetchA16zCompanies(scraperKey),
      fetchSequoiaCompanies(fcKey)
    ]);

    const all = [...yc, ...a16z, ...sequoia];
    console.log("Found: " + all.length);

    const CHUNK_SIZE = 500;
    for (let i = 0; i < all.length; i += CHUNK_SIZE) {
      const chunk = all.slice(i, i + CHUNK_SIZE);
      const { error } = await supabaseClient.from('vc_pipeline').upsert(chunk, { onConflict: 'id', ignoreDuplicates: true });
      if (error) console.error("Upsert error:", error);
    }

    return new Response(JSON.stringify({ success: true, count: all.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error("Refresh error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
