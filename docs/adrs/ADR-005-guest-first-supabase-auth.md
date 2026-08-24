# ADR-005: Guest-First Authentication Architecture & Multi-Tenant RBAC

## Status
`Accepted`

## Context
When evaluating B2B SaaS and enterprise infrastructure intelligence tools, forcing prospective users, sales engineers, or enterprise evaluators to create an account and verify their email before accessing the dashboard introduces friction that leads to severe evaluation drop-off.

However, enterprise platforms also require:
1. Secure account management for persistent personal workspaces across multiple devices.
2. Administrative privileges for managing canonical master intelligence records.
3. Strict database-level isolation via Row Level Security (RLS).

## Decision
We implemented a **Guest-First Multi-Tenant Authentication Model**:
1. **Immediate Guest Access (Zero-Dropoff):** The application loads the complete live dataset, metric recalculations, table filters, and account dossiers directly without requiring any login credentials. Guest territory modifications (account deletions, stack overrides) are staged locally in browser `localStorage`.
2. **Interactive Cloud Sync Auth Modal:** A **`Sign In`** button in the header opens an authentication modal supporting standard Supabase Email/Password signup and login.
3. **Cross-Device Persistence:** Authenticated standard users sync their territory deltas directly to `user_workspaces` in Supabase with RLS restricting access exclusively to `auth.uid()`.
4. **Role-Based Admin Access:** Authenticated administrators have write privileges to update the canonical `verified_startups` master table directly from the UI.

## Consequences
### Positive:
* **Zero Drop-off:** Evaluators can inspect the full application in under 10 seconds without any login barriers.
* **Seamless Upgrade Path:** A non-intrusive toast prompts guests to sign in when making territory edits to sync changes across devices.
* **Robust Multi-Tenancy:** Preserves canonical data integrity while allowing flexible individual account customizations.

### Negative:
* Requires maintaining client-side state reconciliation logic between local deltas, cloud user workspaces, and the canonical master table.
