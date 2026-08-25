import { Startup, TargetView, ApiKeysConfig } from './types';
import { getGtmClassification } from './workspace-store';
import { normalizeFunctionalOntology } from './ontology';

// 1. Built-in Heuristic Pitch Generator (0 latency, 0 cost)
export function generateHeuristicPitches(startup: Startup, targetView: TargetView = 'supabase') {
  const gtm = getGtmClassification(startup, targetView);
  const ontology = normalizeFunctionalOntology(startup);
  const companyName = startup.name;
  const currentDb = ontology.primary_database || 'current database';

  const targetProviderName = 
    targetView === 'supabase' ? 'Supabase' :
    targetView === 'neon' ? 'Neon' :
    targetView === 'planetscale' ? 'PlanetScale' :
    targetView === 'mongodb' ? 'MongoDB Atlas' :
    'ClickHouse';

  // Email Pitch
  let emailSubject = `Scaling ${companyName}'s data infrastructure with ${targetProviderName}`;
  let emailBody = '';

  if (gtm.isChampion) {
    emailSubject = `Partnering with ${companyName} on advanced ${targetProviderName} capabilities`;
    emailBody = `Hi ${companyName} team,

I noticed you're building on ${targetProviderName} for your core database layer.

As your workloads and customer volume scale, we'd love to partner directly to support:
• Enterprise read replicas & multi-region high availability
• Dedicated compute instances & connection pooling SLA
• Advanced pgvector indexing & embedding query acceleration

Would you be open to a brief 15-minute sync with our solutions architecture team this week?

Best regards,
GTM & Partnerships Team
${targetProviderName}`;
  } else {
    emailSubject = `Modernizing ${companyName}'s ${currentDb} stack for scale`;
    emailBody = `Hi ${companyName} team,

I came across ${companyName} and was impressed by your product momentum in the ${startup.industry || 'software'} space.

Looking at your architecture, many engineering teams scaling on ${currentDb} frequently encounter operational overhead and vector fragmentation.

By migrating to ${targetProviderName}, companies like yours gain:
1. Native PostgreSQL ACID reliability with sub-millisecond query latency
2. Built-in vector search (pgvector) without provisioning separate silos
3. Significant reduction in monthly cloud egress and managed database TCO

We have pre-built migration pathways and automated zero-downtime replication toolkits available.

Would you be open to an architectural benchmark review with our engineering leads next Tuesday?

Best regards,
GTM & Partnerships Team
${targetProviderName}`;
  }

  // LinkedIn DM Pitch
  const linkedInPitch = gtm.isChampion
    ? `Hey ${companyName} team — thrilled to see you building on ${targetProviderName}! Reaching out from the partnerships team to see if you'd like direct solutions architecture support on dedicated compute scaling & pgvector optimization. Let's connect!`
    : `Hey ${companyName} team — congrats on the growth! Saw you're managing ${currentDb}; we've helped dozens of fast-scaling engineering teams cut infra overhead & latency with ${targetProviderName}'s managed Postgres + vector layer. Would love to share our benchmark playbook if helpful!`;

  return {
    emailSubject,
    emailBody,
    linkedInPitch
  };
}

// 2. Custom LLM Generator (Uses User's API Key)
export async function generateCustomLlmPitch(
  startup: Startup,
  targetView: TargetView,
  apiConfig: ApiKeysConfig
): Promise<{ emailSubject: string; emailBody: string; linkedInPitch: string }> {
  const activeKeyItem = apiConfig.llmKeys?.find(k => k.isActive && k.key) || apiConfig.llmKeys?.[0];
  const activeKey = activeKeyItem?.key || apiConfig.apiKey || '';

  if (!activeKey) {
    return generateHeuristicPitches(startup, targetView);
  }

  const gtm = getGtmClassification(startup, targetView);
  const ontology = normalizeFunctionalOntology(startup);
  const targetProviderName = 
    targetView === 'supabase' ? 'Supabase' :
    targetView === 'neon' ? 'Neon' :
    targetView === 'planetscale' ? 'PlanetScale' :
    targetView === 'mongodb' ? 'MongoDB Atlas' :
    'ClickHouse';

  const systemPrompt = `You are a Principal Solutions Architect at ${targetProviderName}. Generate a customized executive pitch for ${startup.name} (running ${ontology.primary_database}, vector: ${ontology.vector_engine}).`;

  const userPrompt = `Generate:
1. A compelling 3-paragraph technical sales email (with subject line)
2. A 2-sentence punchy LinkedIn connection note

Format your response as valid JSON:
{
  "emailSubject": "...",
  "emailBody": "...",
  "linkedInPitch": "..."
}`;

  try {
    const engine = apiConfig.activeEngine || 'groq';

    if (engine === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeKey}`
        },
        body: JSON.stringify({
          model: activeKeyItem?.model || 'openai/gpt-oss-20b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ]
        })
      });
      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      return JSON.parse(content.replace(/```json/gi, '').replace(/```/g, '').trim());
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`
      },
      body: JSON.stringify({
        model: activeKeyItem?.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    return JSON.parse(content.replace(/```json/gi, '').replace(/```/g, '').trim());
  } catch (e) {
    console.error('Custom LLM pitch error, falling back to heuristic:', e);
    return generateHeuristicPitches(startup, targetView);
  }
}
