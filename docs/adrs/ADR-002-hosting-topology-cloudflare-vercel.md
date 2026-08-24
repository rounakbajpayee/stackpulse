# ADR-002: Hosting Topology — Dedicated Subdomain via Cloudflare DNS & Vercel Edge

## Status
`Accepted`

## Context
For **StackPulse**, we needed a globally distributed, high-availability, zero-maintenance hosting environment that would:
1. Guarantee sub-second load times worldwide for distributed engineering, sales, and executive teams.
2. Maintain custom domain branding on `stackpulse.rounakbajpayee.com` with automated SSL certificate provisioning.
3. Automatically deploy production builds from git commits pushed to the repository.
4. Support Client-Side Single Page Application (SPA) routing with clean path rewrites (`/supabase`, `/neon`, etc.) without 404 errors on direct browser refresh.

## Decision
We configured the dedicated subdomain **`stackpulse.rounakbajpayee.com`** hosted on **Vercel Edge Network** with Cloudflare DNS management:
* **Cloudflare DNS:** CNAME record for `stackpulse` pointing to `cname.vercel-dns.com` with Proxy status set to **DNS Only** (Gray Cloud) to avoid SSL handshake duplication and Let's Encrypt challenge conflicts.
* **Vercel Edge Network:** Continuous auto-deployment connected directly to the primary git branch.
* **SPA Rewrites (`vercel.json`):** Deployed a root rewrite rule mapping all sub-paths (`/(.*)`) to `/index.html` to enable client-side path routing.

## Consequences
### Positive:
* 100% uptime with global edge caching.
* Instant CI/CD deployments on `git push origin main`.
* Zero server maintenance, container management, or memory overhead.
* Seamless deep-linked URL sharing across teams.

### Negative:
* Relies on Vercel's edge hosting environment for static build distribution.
