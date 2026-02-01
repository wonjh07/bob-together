# AGENTS.md

> AI 개발 워크플로우 및 코딩 규칙

## 📋 Table of Contents
1. [Context Management](#-context-management) - 작업 시작 전 필수
2. [Coding Rules](#-coding-rules) - 코드 작성 규칙
3. [Debugging](#-debugging) - 문제 해결 방법

---

## 🧠 Context Management (Critical!)

### Before Starting ANY Task
1. **Always read `.ai_docs/INDEX.md` first** - Get project overview and find relevant docs
2. **Load only necessary documents** - Don't read entire codebase
3. **Follow document links** - INDEX.md will guide you to specific modules

### Document Loading Rules
```
New Session → Read .ai_docs/INDEX.md (mandatory)
Authentication work → Read modules/onboarding/*.md
New form → Read features/form-validation.md + guides/testing.md
Server Action → Read guides/server-actions.md
```

### After Making Changes
- Update relevant `.ai_docs/` documents
- Keep documentation in sync with code
- Add new docs for new features

**Token Savings: 90%** by using docs instead of reading all files.

---

## ⚙️ Coding Rules

### Framework & Architecture
- Always use local MCP `context7` first
- Check official docs before assumptions
- Parse versions from `package.json`
- Prefer framework-native features
- Justify any custom implementation

### Component Development
- Reuse `lib/supabase` utilities
- Always consider reusable components
- Minimize "use client" components
- Never use inline styles

### Code Quality
- If unsure, ask before changing code
- Write tests for new features
- Follow existing patterns in codebase

---

## 🐛 Debugging

### Approach
- Reproduce the issue before fixing
- Suspect dev server issues first
- Fix the cause, not the symptom
- Avoid speculative fixes
- Change one thing at a time

### Process
1. Read relevant `.ai_docs/` for context
2. Check recent changes (git log)
3. Verify environment (node version, dependencies)
4. Test in isolation
5. Document the fix