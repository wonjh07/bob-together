# AGENTS.md

## 📋 Table of Contents
1. [Coding Rules](#️-coding-rules)
1. [Context Management](#context-management)
2. [Debugging](#-debugging)

---

## ⚙️ Coding Rules

### Framework & Architecture
- Always use local MCP `context7` first
- Check official docs before assumptions
- Check dependencies from `package.json`
- Read `ai_docs/INDEX.md` first and selectively read task-related docs

### Workflow (Must Do)
- Complex requests: analyze and plan first
- Before code changes: show before/after, justify, get approval, proceed to the next step
- Always base work on the current file state (users may edit before requesting)
- If user edits overlap with planned changes, confirm before proceeding
- If unsure, ask before changing code
- For Supabase schema changes, do not hardcode `src/types/database.types.ts` before migration is applied.
- Run type/lint only after migration apply + type generation for schema-changing work.
- If migration cannot be applied in current environment, report blocked status and defer type-file edits.
- After massive code changes, run `npm run type-check` and `npm run lint`, then report results (skip for `*.md`-only changes)
- If a change involves structural/architectural decisions, record it in `ai_docs/DECISIONS.md`.

---

## Context Management

### Ai docs
- Update `ai_docs/CHANGELOG_AI.md` and relevant `ai_docs/*.md` files when making material changes
- If new AI docs are added, register them in `ai_docs/INDEX.md`
- Keep `ai_docs` concise, factual, and free of secrets/keys
- Use short sections with clear headings and bullet points

### Recommended Docs by Task
- Data/State: `ai_docs/DATA_STATE_STRATEGY.md`
- Supabase: `ai_docs/SUPABASE.md`
- Styling: `ai_docs/STYLE_GUIDE.md`
- Image Parse: `ai_docs/DESIGN_SCAN.md`
- Project Conventions: `ai_docs/PROJECT.md`
- Server Actions: `ai_docs/ACTIONS.md`

---

## 🐛 Debugging

### Approach
- Reproduce the issue before fixing
- Suspect dev server issues first
- Fix the cause, not the symptom
- Avoid speculative fixes
- Change one thing at a time

### Documentation
- After debugging, summarize the issue and fix in `ai_docs/ERRORS_AND_LESSONS.md`.
