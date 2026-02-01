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

### Component Development
- Reuse `lib/supabase` utilities
- Always consider reusable components
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
