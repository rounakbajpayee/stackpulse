# ADR-010: Path-Based Routing, Deep-Linking, & SPA Rewrites

## Status
**Accepted & Implemented**

## Context
Sales Representatives, Account Executives, and GTM leaders need to share direct URLs to specific competitive perspectives (e.g. `/supabase`, `/neon`), portfolio intelligence filters, or specific company battlecard drawers. In-memory state without URL synchronization prevented browser navigation history and link sharing.

## Decision
1. **Path-Based Perspective Routing**: Map top-level paths (`/supabase`, `/neon`, `/planetscale`, `/mongodb`, `/clickhouse`) directly to the target perspective view.
2. **Deep-Linking Search Params**: Synchronize sub-views with query parameters:
   * `?tab=cohorts` $\rightarrow$ Portfolio Analytics
   * `?status=migration` $\rightarrow$ Migration Targets
   * `?account=venu-ai` $\rightarrow$ Directly opens Account Drawer
3. **Bidirectional HTML5 History Synchronization**: Connect state setters to `window.history.pushState()` and attach a `popstate` event listener for native browser back/forward navigation.
4. **Vercel SPA Rewrites**: Deploy `vercel.json` rewrite rule (`/(.*) -> /index.html`) to prevent 404s on direct sub-path navigation.

## Consequences
* Direct links are 100% shareable across teams.
* Seamless user experience with native browser history integration.
