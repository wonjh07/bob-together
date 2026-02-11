# Supabase Practical Guide

## Purpose
- Standardize Supabase(Auth/DB/RLS/Storage/RPC) engineering decisions.
- Reduce regressions caused by permission drift, schema mismatch, and incomplete rollouts.

## Core Principles
- Default to `createSupabaseServerClient` + RLS.
- Use `createSupabaseAdminClient` only for explicit exceptions.
- Treat every DB change as migration-first.
- Keep action changes synchronized with docs (`ACTIONS`, `DB_RLS`, `CHANGELOG_AI`).

## Client Choice Rules
- Auth-context CRUD: server client.
- Privileged backoffice/batch operations: admin client (must document reason).
- Return only the minimum columns required by UI.

## RLS / Permission Design
- Design `grant` and `policy(using/with check)` as one set.
- Separate read (`select`) from write (`insert/update/delete`) access.
- Encode owner/member constraints directly in SQL policies.
- Do not hardcode bypass logic in actions when policy can solve it.

## RPC Usage Rules
- Prefer RPC for complex joins, aggregates, and search/count patterns.
- Keep return shape minimal and stable.
- Use `security definer` only when unavoidable and with strict scope.
- Always specify execute grants (`anon`, `authenticated`, etc.).

## Storage Rules
- Define bucket-specific object access policies.
- Enforce deterministic object key conventions (example: `{user_id}/...`).
- Update DB reference only after upload succeeds.
- Define replacement cleanup strategy for previous files.

## Action Implementation Checklist
- Validate input (zod) -> authorize -> DB update -> side effects.
- Normalize error contracts (`forbidden`, `update-failed`, etc.).
- Handle partial failures deliberately (example: metadata sync best-effort).

## Type / Schema Sync Rules
- After migration, regenerate or update `database.types.ts` immediately.
- Verify RPC signatures and nullable semantics (`null` vs `undefined`).
- Fix query/type mismatch before adding broad casts.

## Testing Rules
- Per action: at least one success, one authorization failure, one validation failure.
- For policy changes: rerun related action tests.
- Cover error-return path and recovery/fallback behavior.

## Anti-Patterns
- Permanent admin bypass where RLS can solve the access.
- Editing runtime code without migration for schema/policy changes.
- Broad/select-all queries for user-facing actions.
- Assuming service role behavior in normal app flow.

## Prompt Templates (Command Style)
- "For this Supabase change, define the access subject first (`anon`/`authenticated`/`admin`)."
- "When changing RLS, include both allow and deny scenarios with SQL conditions."
- "For RPC, keep response minimal and specify execute grants."
- "Ship migration, action update, tests, and docs in one change set."
- "After type generation, check for null/undefined parameter mismatches."
