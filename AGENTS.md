# AGENTS.md

## 📋 Table of Contents
1. [Coding Rules](#-coding-rules) - 코드 작성 규칙
2. [Debugging](#-debugging) - 문제 해결 방법

---

## ⚙️ Coding Rules

### Framework & Architecture
- Always use local MCP `context7` first
- Check official docs before assumptions
- Parse versions from `package.json`
- Prefer framework-native features
- Justify any custom implementation
- Read `ai_docs/INDEX.md` first and follow linked context docs before making changes
- 

### Component Development
- Try to Reuse `utils/`, `libs/`, `hooks/`, `provider/` 
- Always consider reusable components
- Never use inline styles
- Make server components page using client components

### Code Quality
- If unsure, ask before changing code
- Write tests for new features
- Follow existing patterns in codebase

### Collaboration Workflow
- When a request is complex, analyze first, then provide a short plan before coding
- Before any code changes, show the proposed before/after snippets, explain why the change is justified, and get approval
- Apply changes only after approval, then proceed to the next step
- After code changes, run `npm run type-check` and `npm run lint`, then report results

### Context Management
- Update `ai_docs/CHANGELOG_AI.md` when making material changes
- If new AI docs are added, register them in `ai_docs/INDEX.md`
- Keep `ai_docs` concise, factual, and free of secrets/keys
- Use short sections with clear headings and bullet points
- Also kepp other 'CONTEXT.md's updated

---

## 🐛 Debugging

### Approach
- Reproduce the issue before fixing
- Suspect dev server issues first
- Fix the cause, not the symptom
- Avoid speculative fixes
- Change one thing at a time
