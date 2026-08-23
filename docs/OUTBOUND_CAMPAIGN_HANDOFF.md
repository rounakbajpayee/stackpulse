# Outbound Campaign & Hook Generation Handoff Prompt

> **Role for Next Agent:** Senior GTM Outbound Copywriter & Career Campaign Strategist.  
> **Objective:** Re-analyze the target executive dossiers, extract high-resonance personalized hooks, and draft high-converting cold outreach copies (LinkedIn DMs, Loom video scripts, application notes) for **Supabase**, blending Alex Hormozi's high-value lead magnet playbook with respectful peer networking.

---

## 1. Master Context & Reference Inputs

Do not re-ask the user for these assets; inspect the local files and live endpoints directly:

* **Candidate Career Single Source of Truth (SSOT):**  
  [`rounak_career_ssot_28-06-26.md`](file:///C:/Users/rouna/Downloads/rounak_career_ssot_28-06-26.md)  
  *Key positioning:* Proprietor of medical equipment distribution business (B2G/Enterprise contracts, procurement, multi-stakeholder navigation) + Previous Partnerships & Growth lead at Nector (built 10k+ partner pipeline, scaled RevOps/outbound) + full-stack technical capability (Python, REST APIs, Vercel, Supabase, Docker).

* **Target Executive LinkedIn Dossiers (Scraped Activity & Posts):**  
  Directory: [`C:\projects\linkedin_dossiers\Supabase\`](file:///C:/projects/linkedin_dossiers/Supabase)
  * [`01_Nate_Asp.md`](file:///C:/projects/linkedin_dossiers/Supabase/01_Nate_Asp.md) — VP / Head of Sales & Commercial Lead
  * [`02_Joel_Borrello.md`](file:///C:/projects/linkedin_dossiers/Supabase/02_Joel_Borrello.md) — GTM / Sales Lead
  * [`03_Rory_Wilding.md`](file:///C:/projects/linkedin_dossiers/Supabase/03_Rory_Wilding.md) — COO / CCO & Co-Founder
  * [`04_Isabel_Yeow.md`](file:///C:/projects/linkedin_dossiers/Supabase/04_Isabel_Yeow.md) — Talent Partner
  * [`05_Taylor_Murray.md`](file:///C:/projects/linkedin_dossiers/Supabase/05_Taylor_Murray.md) — Technical Recruiting Lead
  * [`06_Michaela_Burpoe.md`](file:///C:/projects/linkedin_dossiers/Supabase/06_Michaela_Burpoe.md) — Senior Talent Partner

* **The Flagship Proof of Work (PoW Asset):**  
  * Live URL: `https://stackpulse.rounakbajpayee.com`  
  * Repository: [`C:\projects\stackpulse`](file:///C:/projects/stackpulse) (Vite + React frontend, Supabase Postgres backend with RLS, Vercel Edge Middleware telemetry).  
  * What it does: Tracks 4,430+ AI startups across top VCs (YC, a16z, Sequoia), models $89.1M in active migration pipeline moving off Firebase/Mongo to Supabase, generates automated dual-channel AE outbound pitches.

* **Tracking & Telemetry Infrastructure:**  
  * Link shortener / redirect server: `https://go.rounakbajpayee.com/<slug>` (Hosted on Oracle VPS).  
  * Local telemetry dashboard: [`C:\projects\stackpulse-tracker\index.html`](file:///C:/projects/stackpulse-tracker/index.html) (Logs all hits to `go..` and `stackpulse..` domains in real-time).  
  * Custom Google Apps Script REST API over CRM Sheet:  
    `https://script.google.com/macros/s/AKfycbyDa8fP9do-beOuXO6qAXGcVyxhWIL8qpTZnpVYlxtzTPQ2x37M159FTLRZsI8GVgST/exec` (Sheets: `project_status`, `outbound_tracker`, `connect_requests`).

---

## 2. Alex Hormozi Framework & Playbook

### What We Learned & Applied:
* **The Value Equation:**  
  $$\text{Value} = \frac{\text{Dream Outcome} \times \text{Perceived Likelihood of Achievement}}{\text{Time Delay} \times \text{Effort \& Sacrifice}}$$
* **The Lead Magnet / Proof of Work Concept:**  
  * Instead of asking for attention, deliver undeniable upfront value for free.
  * "Give away secrets, sell implementation" $\rightarrow$ In a career context: *"Give away commercial pipeline data for free; let them hire you to execute on it."*
* **The Hook-Retain-Reward Framework:**  
  1. **Hook:** A specific, unmistakable reference to their actual recent post, philosophy, or internal scaling challenge (proves you didn't blast a generic template).
  2. **Retain (The Asset):** Introduce StackPulse not as a generic side project, but as a dedicated solution built specifically to solve their GTM/sourcing problem.
  3. **Reward / Low Friction CTA:** Never ask for a 30-minute meeting upfront. Offer a 90-second Loom walkthrough or ask *"Mind if I send the 90s video over?"* / *"Worth a peek?"*

### How to Research Hormozi Further (Instructions for Next Agent):
If you need deeper mechanics or alternative hook structures:
1. **Use Firecrawl / Web Search Tools:**
   * Search queries:
     * `alex hormozi $100M leads cold outreach script frameworks`
     * `alex hormozi lead magnet hook retain reward cold dm`
     * `alex hormozi cold messaging low friction offer permission based CTA`
2. **Key Concepts to Study & Apply:**
   * *Permission-Based Outreach:* Asking for permission to share the asset before dropping a massive link/video.
   * *Anti-Pitch Tone:* Removing corporate fluff and sales breath; sounding like a peer practitioner who just built something cool.

---

## 3. The "Middle Ground" Strategy (Hormozi + Candidate Networking)

* **Why Pure Hormozi Fails in Hiring:** If the copy sounds like a B2B sales pitch or lead gen agency offering a free audit, executives will ignore it or assume you want a consulting retainer.
* **Why Pure Networking Fails:** Vague messages ("I'd love to learn from your journey", "Can I buy you a coffee?") provide zero value and demand emotional/time charity.
* **The Winning Middle Ground:** Position StackPulse as candidate **Proof of Work (PoW)**. It establishes:
  1. Deep domain empathy for Supabase's migration battlegrounds (Postgres vs Firebase).
  2. The ability to build custom outbound tech rather than waiting on sales enablement.
  3. High-conviction proactivity.

---

## 4. Persona Segmentation Guidelines

When drafting the new hooks and copies, segment by role archetype:

1. **Commercial / GTM Leaders (Nate Asp, Rory Wilding, Joel Borrello):**
   * *Angle:* Pipeline intelligence, Tier-1 ARR valuation ($36K+ deals), displacing Firebase/Mongo in AI agent startups.
   * *CTA:* Offer a 90-second Loom recording showing the custom dashboard built for Supabase GTM.
2. **Recruiters & Talent Partners (Michaela Burpoe, Isabel Yeow, Taylor Murray):**
   * *Angle:* Candidate differentiation, technical competence + grit, proof of work attached to the Ashby application.
   * *CTA:* Inform them you submitted the application and built StackPulse to show how you operate from Day 1.

---

## 5. Expected Deliverables from the Next Agent

1. **Dossier Hook Matrix:** For each of the 6 targets, extract 2 distinct, highly specific hooks from their dossier files.
2. **Cold Copy Suite:**
   * **Variant A:** High-Value / Hormozi "Proof of Work" DM (Low friction offer).
   * **Variant B:** Practitioner / Direct Peer DM (Curiosity & feedback).
   * **Variant C:** Post-Application Follow-up Note.
3. **90-Second Loom Scripts:**
   * Script 1: AE APAC Focus (Nate Asp) — 90-second screen recording script.
   * Script 2: Ecosystem / VC Partnerships Focus (Dan Messina) — 90-second screen recording script.
