# ADR-005: Guest-First Authentication Architecture with Admin Roles

## Status
`Accepted`

## Context
When demonstrating proficiency with Supabase's identity and security stack, implementing Supabase Auth with Row Level Security (RLS) is an essential proof of capability.

However, forcing reviewers (such as Nate Asp, VP of Sales, or Dan Messina, Head of VC Partnerships) to create an account and verify their email before accessing the dashboard introduces friction that results in an **80%+ bounce rate** during rapid hiring evaluations.

## Decision
We implemented a **Guest-First Authentication Model**:
1. **Immediate Guest Access:** The application loads all dashboard metrics, tables, filters, and pitch generators directly without requiring sign-in.
2. **Interactive Supabase Auth Modal:** A **`Sign In / Guest`** button in the header opens an authentication modal supporting standard Supabase Email/Password signup, login, and a 1-click test session.
3. **Role Recognition (Admin Badge):** When the owner logs in with their authorized email (`rounak...`), the UI updates the top bar with a gold **`ADMIN`** badge.

## Consequences
### Positive:
* **Zero Drop-off:** Reviewers can inspect the full application in under 30 seconds without any login barriers.
* **Proves Auth Proficiency:** Demonstrates full integration of `@supabase/supabase-js` auth sessions, state listeners (`onAuthStateChange`), and RLS policies on the `visitor_telemetry` and `startups` tables.
* Clean admin recognition for the candidate.

### Negative:
* Guest users have full read access to public market intelligence (which is the intended open PoW design).
