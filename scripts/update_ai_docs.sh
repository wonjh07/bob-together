#!/usr/bin/env sh
set -eu

printf "AI Docs Update Helper\n"
printf "======================\n\n"

if command -v git >/dev/null 2>&1; then
  printf "Recent changes (git status):\n"
  git status -sb || true
  printf "\nChanged files (git diff --name-only):\n"
  git diff --name-only || true
  printf "\n"
else
  printf "git not found; skipping git-based change listing.\n\n"
fi

printf "Next steps:\n"
printf "- Update ai_docs/CONTEXT_SESSION.md with the latest summary.\n"
printf "- Update relevant CONTEXT_*.md files for touched areas.\n"
printf "- Append to ai_docs/CHANGELOG_AI.md.\n"
printf "- If you add a new doc, register it in ai_docs/INDEX.md.\n"
