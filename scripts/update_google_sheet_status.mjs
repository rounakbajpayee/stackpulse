const base = 'https://script.google.com/macros/s/AKfycbyDa8fP9do-beOuXO6qAXGcVyxhWIL8qpTZnpVYlxtzTPQ2x37M159FTLRZsI8GVgST/exec';

async function updateStatusSheetWithFullContext() {
  console.log('[*] Updating project_status with full 15-company pipeline context & Supabase priority focus...');

  const updates = [
    {
      row: 2,
      data: {
        Section: 'Mega Prompt (Updated)',
        Content: `# Role & Objective
Act as my career intelligence and outbound campaign manager for a high-intensity, 14-day zero-budget job hunt sprint.
Objective: Secure an early-career, technology-oriented sales or strategic partnerships role (SDR / BDR / Account Executive / Ecosystem Partnerships) across 15 target DevTools, AI, and Data Infrastructure leaders.

# The 15-Company Pipeline Scope
Our active CRM (tracked in the outbound_tracker and connect_requests sheets) covers 15 target companies and 52 decision-makers:
- Tier 1: Postman (API Platform)
- Tier 2 (High Priority Focus): Supabase (BaaS/Postgres), Vercel (Frontend Cloud), Atlan (Data Governance), Weights & Biases (MLOps), Yellow.ai (Enterprise AI), Cohere (Enterprise LLMs)
- Tier 3: Hasura (GraphQL), Weaviate (Vector DB), Neon (Serverless Postgres), Clerk (Auth), Tailscale (Networking), Render (Cloud)
- Tier 4: Deel (Global Infrastructure)
- Outreach Network: 52 mapped executives with 30+ connection requests dispatched and multiple C-level/VP acceptances already logged (e.g. Rory Wilding - COO/CCO @ Supabase, Frederick Garrett Reis, Ryan Hemelt).

# Current Strategic Focus: Supabase (Flagship Campaign)
We are executing high-conviction, company-specific Proof of Work (PoW) campaigns sequentially.
We are currently 100% focused on Supabase (Target Roles: Account Executive APAC & Partnerships Manager Ecosystem).
- For Supabase, we built and deployed StackPulse (https://stackpulse.rounakbajpayee.com), a production commercial & ecosystem intelligence platform.
- Live URL: https://stackpulse.rounakbajpayee.com | GitHub: https://github.com/rounakbajpayee/stackpulse
- Architecture: 4,430+ AI startups tracked, $89.1M migration pipeline modeled, 6-stack VC portfolio breakdown, dynamic heuristic AI synthesis, dual-channel AE outreach generator (Email vs LinkedIn), and Guest-First Supabase Auth.
- Formally documented in docs/adrs/ (ADR 001 to ADR 005) and docs/PROJECT_WORKBOOK_STATUS.md.

# Immediate Next Step
1. Record two 90-second Loom videos for Supabase (Loom 1 for Nate Asp / AE APAC; Loom 2 for Dan Messina / VC Partnerships).
2. Submit the tailored Ashby application forms for Supabase with live PoW links.
3. Dispatch Day 1 LinkedIn DMs and Day 2 Cold Emails via go.rounakbajpayee.com link tracking.
4. Advance the pipeline to Company #2 (Hasura - GraphQL Automation) and Company #3 (Vercel - Edge Next.js PoW).`
      }
    },
    {
      row: 4,
      data: {
        Section: 'Walkthrough / Done So Far',
        Content: `1. **Market Intelligence & Career Scoping:** Evaluated 120+ tech companies; shortlisted 15 high-conviction targets across DevTools, AI, and Data Infra; narrowed target role focus to Technical Sales (SDR/AE) and Ecosystem Partnerships.
2. **Infrastructure & CRM Architecture:**
   - Deployed custom Python/Flask link-tracking server on Oracle VPS (go.rounakbajpayee.com) behind Nginx & SSL.
   - Built Google Apps Script REST API over this Google Sheet to track the 15-company pipeline and 52 executive contacts.
3. **Prospecting & Outreach Execution:**
   - Mapped 52 key decision-makers (Founders, VP Sales, Heads of Partnerships) across Supabase, Hasura, Vercel, Atlan, Postman, etc.
   - Sent 30+ connection requests; confirmed acceptances from leaders including Rory Wilding (COO/CCO @ Supabase), Laura Colagrande, Harsha Madhavan, Frederick Garrett Reis, Ryan Hemelt, and Emerson Downing.
4. **Flagship Proof of Work Deployment (Supabase — StackPulse):**
   - Selected Supabase as the primary anchor target. Built and deployed StackPulse (https://stackpulse.rounakbajpayee.com) on Vercel + Cloudflare DNS.
   - Connected live Supabase Postgres database with RLS policies, indexing 4,430+ AI startups and valuing a $89.1M pipeline.
   - Built 6-competitor VC portfolio breakdown, dynamic heuristic AI synthesis, dual-channel pitch generator, and table pagination.
   - Achieved 100% green passing CI on GitHub Actions and authored 5 formal ADRs.`
      }
    },
    {
      row: 5,
      data: {
        Section: 'Open Questions and Next Items',
        Content: `**Active Supabase Execution (Current Sprint):**
1. Record Loom #1 (AE APAC - Nate Asp): 90-sec walkthrough focusing on Firebase/Mongo migration detection, $36K Tier-1 ARR valuation, and outbound strategy.
2. Record Loom #2 (VC Partnerships - Dan Messina): 90-sec walkthrough showing YC W25/a16z Speedrun cohort distribution, heuristic synthesis, and PDF brief export.
3. Submit Ashby Application Forms for Supabase (custom answers prepared).
4. Send outbound messages to connected Supabase targets (Rory Wilding, Ant Wilson, Dan Messina, Nate Asp, Sana Cordeaux) using go.rounakbajpayee.com tracking.

**Subsequent Pipeline Execution (Companies #2 - #5):**
5. Hasura (Company #2): Build GraphQL query automation PoW script and target Tanmai Gopal / Rajoshi Ghosh / Frederick Garrett Reis.
6. Vercel (Company #3): Build Next.js edge deployment PoW and target Lauryn Spence / Stu Jeffrey / JJ Lecocq / Ryan Hemelt.
7. Atlan (Company #4): Build Metadata Governance PoW and target Prukalpa Sankar / Varun Banka.
8. Postman (Company #5): Build API Collection workspace automation PoW.`
      }
    },
    {
      row: 7,
      data: {
        Section: 'Project Documentation',
        Content: `**Master Documentation Hub:**
1. **Live Flagship PoW (Supabase):** https://stackpulse.rounakbajpayee.com
2. **GitHub Repository:** https://github.com/rounakbajpayee/stackpulse
3. **Master Project Status Sheet Workbook:** docs/PROJECT_WORKBOOK_STATUS.md
4. **Architecture Decision Records:** docs/adrs/ (ADR 001 - ADR 005)
5. **Campaign Strategy Reports (Conv ID: f77c3088-1fb7-4a9c-8de1-9ec127bb06cb):**
   - Career Intelligence Report (120+ company evaluation): brain/f77c3088.../career_intelligence_report.md
   - Outbound Pipeline Plan (14-day sprint strategy): brain/f77c3088.../outbound_pipeline_plan.md
   - Original Strategy Handoff: brain/f77c3088.../career_strategy_handoff.md
6. **Live Outbound CRM Sheets:**
   - outbound_tracker (15 target companies & tier rankings)
   - connect_requests (52 decision-maker contacts & outreach status)`
      }
    }
  ];

  for (const item of updates) {
    try {
      console.log(`[*] Updating Row ${item.row} (${item.data.Section})...`);
      const res = await fetch(base, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_row',
          sheet: 'project_status',
          row: item.row,
          data: item.data
        }),
        redirect: 'follow'
      });
      const result = await res.json();
      console.log(`[✓] Row ${item.row} updated:`, result.success ? 'SUCCESS' : result);
    } catch (e) {
      console.error(`[-] Error on Row ${item.row}:`, e.message);
    }
  }

  console.log('[✓] Complete pipeline context and Supabase focus updated in Google Sheets!');
}

updateStatusSheetWithFullContext();
