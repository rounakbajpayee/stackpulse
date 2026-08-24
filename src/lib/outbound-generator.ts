import { Startup, TargetView, ApiKeysConfig } from './types';
import { getGtmClassification } from './workspace-store';

// 1. Built-in Heuristic Pitch Generator (0 latency, 0 cost)
export function generateHeuristicPitches(startup: Startup, targetView: TargetView = 'supabase') {
  const gtm = getGtmClassification(startup, targetView);
  const companyName = startup.name;
  const currentDb = startup.database_stack || 'current database';
  const vectorEngine = startup.vector_search !== 'None' ? startup.vector_search : null;

  const targetProviderName = 
    targetView === 'supabase' ? 'Supabase' :
    targetView === 'neon' ? 'Neon' :
    targetView === 'planetscale' ? 'PlanetScale' :
    targetView === 'mongodb' ? 'MongoDB Atlas' :
    'ClickHouse';

  // Email Pitch
  let emailSubject = `Scaling ${companyName}'s data infrastructure with ${targetProviderName}`;
  let emailBody = '';

  if (gtm.status === 'champion') {
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

I came across ${companyName} and was impressed by your product momentum in the ${startup.industry} space.

Looking at your architecture, many engineering teams scaling on ${currentDb} frequently encounter ${gtm.bottleneck.toLowerCase()}.

By migrating to ${targetProviderName}, companies like yours gain:
1. ${gtm.pitchAngle}
2. Native vector search support without provisioning separate silos
3. Significant reduction in monthly cloud egress and managed database operational overhead

We have pre-built migration pathways and automated zero-downtime replication toolkits available.

Would you be open to an architectural benchmark review with our engineering leads next Tuesday?

Best regards,
GTM & Partnerships Team
${targetProviderName}`;
  }

  // LinkedIn DM Pitch
  const linkedInPitch = gtm.status === 'champion'
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
  if (!apiConfig.apiKey) {
    return generateHeuristicPitches(startup, targetView);
  }

  const gtm = getGtmClassification(startup, targetView);
  const targetProviderName = 
    targetView === 'supabase' ? 'Supabase' :
    targetView === 'neon' ? 'Neon' :
    targetView === 'planetscale' ? 'PlanetScale' :
    targetView === 'mongodb' ? 'MongoDB Atlas' :
    'ClickHouse';

  const systemPrompt = (apiConfig.customPrompt || '')
    .replace(/{{COMPANY_NAME}}/g, startup.name)
    .replace(/{{CURRENT_DB}}/g, startup.database_stack || 'Unknown')
    .replace(/{{VECTOR_ENGINE}}/g, startup.vector_search || 'None')
    .replace(/{{BOTTLENECK}}/g, gtm.bottleneck)
    .replace(/{{TARGET_PROVIDER}}/g, targetProviderName);

  const userPrompt = `Generate:
1. A compelling 4-paragraph technical sales email (with subject line)
2. A 2-sentence punchy LinkedIn connection note

Format your response as valid JSON:
{
  "emailSubject": "...",
  "emailBody": "...",
  "linkedInPitch": "..."
}`;

  try {
    if (apiConfig.provider === 'groq') {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-20b',
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

    if (apiConfig.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiConfig.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
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

    return generateHeuristicPitches(startup, targetView);
  } catch (e) {
    console.error('Custom LLM pitch error, falling back to heuristic:', e);
    return generateHeuristicPitches(startup, targetView);
  }
}
