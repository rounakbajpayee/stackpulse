import { createClient } from '@supabase/supabase-js';
import { Startup, UserWorkspaceDelta, ApiKeysConfig, VerificationDepth } from './types';
import { classifyIndustry } from './industry';
import { getProvenanceDepth } from './workspace-store';

const SUPABASE_URL = 'https://huubxklntrxcwqkoumhd.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TDCRrXlv30o9LjLM_uofjg_WhJDQ_si';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 1. Paginated Fetch for Master Dataset
export async function fetchAllStartupsFromSupabase(): Promise<{ data: Startup[] | null; error: any }> {
  try {
    const allRows: any[] = [];
    const PAGE_SIZE = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const to = from + PAGE_SIZE - 1;
      const { data, error } = await supabase
        .from('verified_startups')
        .select('*')
        .range(from, to);

      if (error) {
        console.error('Error fetching batch from Supabase:', error);
        return { data: null, error };
      }

      if (data && data.length > 0) {
        allRows.push(...data);
        if (data.length < PAGE_SIZE) {
          hasMore = false;
        } else {
          from += PAGE_SIZE;
        }
      } else {
        hasMore = false;
      }
    }

    // Map database rows to frontend schema with deterministic provenance depth
    const mapped: Startup[] = allRows.map(row => {
      const dbStack = row.database_stack || 'Unknown';
      const isKnown = dbStack !== 'Unknown';
      
      let depth: VerificationDepth = 'surface_free';
      if (row.verification_depth) {
        depth = row.verification_depth;
      } else if (isKnown) {
        depth = 'confirmed';
      } else if (row.stack_source === 'google_search' || row.stack_source === 'web_search') {
        depth = 'deep_scraped';
      } else if (row.stack_source && row.stack_source !== 'unknown') {
        depth = 'surface_free';
      } else if (row.stack_verified_at || row.last_verified_at) {
        depth = 'surface_free';
      } else {
        depth = 'unscanned';
      }

      return {
        id: row.id,
        name: row.name || 'Unnamed Company',
        url: row.website_url || row.url || '',
        website_url: row.website_url || null,
        github_url: row.github_url || null,
        investor: row.investor || 'yc',
        yc_batch: row.yc_batch || null,
        batch: row.yc_batch || row.batch || 'YC',
        category: row.category || 'Technology',
        industry: classifyIndustry(row.name, row.category, row.database_stack),
        database_stack: dbStack,
        vector_search: row.vector_search || 'None',
        detected_stack: row.detected_stack || [],
        stack_source: row.stack_source || 'unknown',
        verification_status: (row.verification_status as any) || (isKnown ? 'verified' : 'unverified'),
        verification_depth: depth,
        migration_opportunity_score: row.migration_opportunity_score || (isKnown ? '80' : '40'),
        framework: row.framework || 'React / Next.js',
        bottleneck_detected: row.bottleneck_detected || 'Scale & Data Growth',
        ae_outbound_pitch: row.ae_outbound_pitch || '',
        created_at: row.created_at,
        stack_verified_at: row.stack_verified_at || row.last_verified_at,
        last_verified_at: row.last_verified_at
      };
    });

    return { data: mapped, error: null };
  } catch (err: any) {
    console.error('Fatal fetch error:', err);
    return { data: null, error: err };
  }
}

// 2. Multi-Tenant User Workspace Sync (Cloud Persistence)
export async function fetchUserWorkspace(userId: string): Promise<UserWorkspaceDelta | null> {
  try {
    const { data, error } = await supabase
      .from('user_workspaces')
      .select('delta')
      .eq('user_id', userId)
      .single();

    if (error || !data) return null;
    return data.delta as UserWorkspaceDelta;
  } catch (e) {
    return null;
  }
}

export async function saveUserWorkspace(userId: string, delta: UserWorkspaceDelta): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_workspaces')
      .upsert({
        user_id: userId,
        delta: delta,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    return !error;
  } catch (e) {
    return false;
  }
}

// 3. Master Mutations (Admin only)
export async function updateStartupInSupabase(
  id: string, 
  updates: Partial<Startup>
): Promise<{ success: boolean; error?: any }> {
  try {
    const payload: any = { ...updates };
    if (updates.database_stack) {
      payload.stack_verified_at = new Date().toISOString();
      payload.verification_depth = updates.database_stack !== 'Unknown' ? 'confirmed' : 'deep_scraped';
    }
    const { error } = await supabase
      .from('verified_startups')
      .update(payload)
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Failed to update startup ${id} in Supabase:`, err);
    return { success: false, error: err };
  }
}

export async function bulkDeleteStartupsFromSupabase(
  ids: string[]
): Promise<{ success: boolean; error?: any }> {
  try {
    const { error } = await supabase
      .from('verified_startups')
      .delete()
      .in('id', ids);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Failed to bulk delete startups from Supabase:', err);
    return { success: false, error: err };
  }
}

// 4. Targeted On-Demand Auto-Verification
export async function autoVerifyStartup(
  startup: Startup, 
  apiKeys: ApiKeysConfig
): Promise<{ database_stack: string; vector_search: string; depth: VerificationDepth; source: string }> {
  // If already confirmed or deep_scraped (Truly Unknown), return cached result immediately
  if (startup.verification_depth === 'confirmed' || startup.verification_depth === 'deep_scraped') {
    return {
      database_stack: startup.database_stack,
      vector_search: startup.vector_search,
      depth: startup.verification_depth,
      source: startup.stack_source
    };
  }

  // Active ScraperAPI key if provided
  const scraperKey = apiKeys.scraperKeys?.find(k => k.isActive && k.key)?.key || apiKeys.apiKey;
  const llmKey = apiKeys.llmKeys?.find(k => k.isActive && k.key)?.key || (import.meta as any).env?.VITE_GROQ_API_KEY || '';

  if (!startup.url) {
    return {
      database_stack: 'Unknown',
      vector_search: 'None',
      depth: 'deep_scraped',
      source: 'unknown'
    };
  }

  try {
    // 1. Direct JS bundle check if not already done
    let html = '';
    try {
      const res = await fetch(startup.url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) html = await res.text();
    } catch(e) {}

    if (html) {
      if (html.includes('supabase.co') || html.includes('@supabase/supabase-js')) {
        return { database_stack: 'Supabase Postgres', vector_search: 'None', depth: 'confirmed', source: 'html_signals' };
      }
      if (html.includes('firebaseapp.com') || html.includes('firestore.googleapis.com')) {
        return { database_stack: 'Firebase Firestore', vector_search: 'None', depth: 'confirmed', source: 'html_signals' };
      }
      if (html.includes('mongodb.net')) {
        return { database_stack: 'MongoDB Atlas', vector_search: 'None', depth: 'confirmed', source: 'html_signals' };
      }
    }

    // 2. ScraperAPI search if key is provided
    if (scraperKey) {
      const domain = new URL(startup.url).hostname.replace(/^www\./, '');
      const query = `("${domain}" OR "${startup.name}") ("postgres" OR "mongodb" OR "dynamodb" OR "redis" OR "supabase") "architecture" OR "database"`;
      const proxyUrl = `https://api.scraperapi.com?api_key=${scraperKey}&url=${encodeURIComponent(`https://www.google.com/search?q=${encodeURIComponent(query)}`)}`;
      
      const sRes = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
      if (sRes.ok) {
        const sHtml = await sRes.text();
        const snippets = [...sHtml.matchAll(/<div[^>]+style="[^"]*webkit-line-clamp[^"]*"[^>]*>([\s\S]*?)<\/div>/gi)]
          .map(m => m[1].replace(/<[^>]+>/g, '').trim())
          .join('\n\n');

        if (snippets && snippets.length > 50) {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${llmKey}` },
            body: JSON.stringify({
              model: 'openai/gpt-oss-20b',
              messages: [{
                role: 'user',
                content: `Extract primary databases used by the company. Return raw JSON: {"databases":["PostgreSQL"]}. Text: ${snippets.slice(0, 4000)}`
              }]
            })
          });
          const groqData = await groqRes.json();
          const parsed = JSON.parse(groqData.choices?.[0]?.message?.content?.replace(/```json/gi, '')?.replace(/```/g, '')?.trim() || '{}');
          if (parsed.databases && parsed.databases.length > 0) {
            return {
              database_stack: parsed.databases.join(' + '),
              vector_search: 'None',
              depth: 'confirmed',
              source: 'google_search'
            };
          }
        }
      }
    }

    return {
      database_stack: 'Unknown',
      vector_search: 'None',
      depth: scraperKey ? 'deep_scraped' : 'surface_free',
      source: scraperKey ? 'google_search' : 'html_signals'
    };
  } catch(e) {
    return {
      database_stack: startup.database_stack,
      vector_search: startup.vector_search,
      depth: 'surface_free',
      source: startup.stack_source
    };
  }
}
