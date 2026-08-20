# ADR-002: Hosting Topology — Dedicated Domain via Cloudflare & Vercel

## Status
`Accepted`

## Context
The initial sprint infrastructure deployed a custom Python (Flask) redirect logger on an Oracle Cloud VPS (`go.rounakbajpayee.com/<slug>`) behind Nginx with Let's Encrypt SSL.

For **StackPulse**, we needed a globally distributed, high-availability, zero-maintenance hosting environment that would:
1. Guarantee sub-second load times worldwide for reviewers in Singapore (Nate Asp) and San Francisco (Dan Messina).
2. Maintain custom domain branding on `stackpulse.rounakbajpayee.com` with automated SSL certificates.
3. Automatically deploy new git commits pushed to `github.com/rounakbajpayee/stackpulse`.
4. Leave the Oracle VPS unburdened for the Hermes AI Agent gateway.

## Decision
We configured a dedicated subdomain **`stackpulse.rounakbajpayee.com`** hosted on **Vercel** with Cloudflare DNS management:
* **Cloudflare DNS:** CNAME record for `stackpulse` pointing to `cname.vercel-dns.com` with Proxy status set to **DNS Only** (Gray Cloud) to avoid SSL handshake duplication and Let's Encrypt challenge conflicts.
* **Vercel Edge Network:** Continuous auto-deployment connected directly to the GitHub `master` branch.

## Consequences
### Positive:
* 100% uptime with global edge caching.
* Instant CI/CD deployments on `git push origin master`.
* Zero server maintenance or VPS memory overhead.
* Preserves `rounakbajpayee.com` and homelab services intact.

### Negative:
* Relies on Vercel's public build pipeline (which is free and completely sufficient for static SPAs).
