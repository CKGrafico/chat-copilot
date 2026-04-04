# Squad Decisions

Decisions that affect the whole team. Every agent reads this file before starting work.

---

## Backlog Management: GitHub Issues + Watcher Routing

**Date:** 2026-04-01
**Decided by:** Lead

Use GitHub Issues as the single source of truth. Watcher auto-routes issues to agents based on domain labels.

**Workflow:** Create issue -> Triage (Lead/Watcher adds domain + priority labels) -> Assign (Watcher routes to agent) -> Work (agent creates branch, opens PR) -> Close (PR merge auto-closes issue)

**Labels:**
- **Domain:** `frontend`, `ai`, `systems`, `storage`, `infra`
- **Priority:** `p0-critical`, `p1-high`, `p2-normal`
- **Type:** `feature`, `bug`, `refactor`, `tech-debt`, `docs`
- **Status:** `backlog`, `in-progress`, `reviewing`, `done`

**Rules:**
- Watcher routes but does not decide priority (Lead triages)
- If a label or process rule creates noise, remove it

---

## Commit Approval Required (User Directive)

**Date:** 2026-04-01
**Decided by:** User (project owner)

Agents MUST ask for explicit user approval before committing to git. No autonomous commits.

**Policy:**
- Stage changes with `git add`, then STOP
- Present a summary of staged changes
- Wait for explicit "commit" or "merge" approval
- This applies to ALL agents, including Scribe

---

## PR Review via Inline GitHub Comments (Mandatory)

**Date:** 2026-04-04
**Decided by:** User (via Lead)

All PR reviews must be posted as inline GitHub review comments, not as chat output.

**Policy:**
- Use `gh api` to post a single review with inline comments on exact file+line
- Severity: 🔴 BLOCKER (must fix) / 🟡 WARNING (should fix) / 🔵 MINOR (nice to have)
- Findings posted as chat text only are not valid reviews
- After fixing blockers, post a reply comment confirming resolution

```powershell
gh api repos/{owner}/{repo}/pulls/{PR_NUMBER}/reviews `
  --method POST `
  --field body="Summary verdict" `
  --field event="COMMENT" `
  --field "comments[][path]=src/file.ts" `
  --field "comments[][line]=42" `
  --field "comments[][body]=🔴 BLOCKER: ..."
```

---

## No Cross-Feature Imports

**Date:** 2026-04-01
**Decided by:** Reviewer

Features must not import from each other directly. Cross-feature types live in `src/shared/types/`. Feature-specific types stay in feature folders.

This was established when PR #39 was rejected for importing `Transcription` from `../transcription/types.ts` in the reply feature. The fix: extract shared types to `src/shared/types.ts`.

---

## Architecture: Feature-Folder Structure

**Date:** 2026-04-01
**Decided by:** Artist

```
src/
  app/           # Router, providers (composition root)
  features/      # One folder per domain (share, transcription, reply, profiles, workflow)
  shared/        # Cross-feature types, components, utils, storage, state
```

- `src/app/` for router + providers (orchestration separate from features)
- `providers.tsx` as composition root (all context providers stack here)
- Stubs throw `Error('Not implemented')` (loud failures > silent no-ops)

---

## Squad Capability Abstraction

**Date:** 2026-04-01
**Decided by:** Asimov

All AI operations route through `src/shared/squad/squadService.ts`. UI components never import AI modules directly. This makes swapping implementations (e.g., template-based to LLM-based replies) a single-file change.

---

## RTK Token Compression

**Date:** 2026-04-01
**Decided by:** Beats

RTK compresses CLI output before it reaches the LLM. Agents prefix commands with `rtk` when available:

```powershell
rtk git status
rtk npm run build
```

---

## Settings Infrastructure: Theme via CSS Classes

**Date:** 2026-04-04
**Decided by:** Vault (Lead approved)

Theme switching uses DOM class manipulation (`dark-theme`/`light-theme`) on `<html>` instead of `color-scheme`.

**Why:** Explicit control over CSS variable scope, independent of system preferences.

**Implementation:**
- `src/shared/contexts/SettingsContext.tsx`: Manages settings state + theme application
- `src/shared/utils/settingsStorage.ts`: localStorage persistence layer
- `src/shared/styles/theme.css`: Light/dark CSS variable definitions
- SettingsProvider loads settings on app mount and applies theme immediately

**Storage Key:** `'chat-copilot:settings'` (namespaced to avoid collisions)

**Settings Model:**
```typescript
{
  whisperModel: 'tiny' | 'base' | 'small',
  theme: 'light' | 'dark'
}
```

**Default Settings:** base model, dark theme

---

## Cache & History Clearing

**Date:** 2026-04-04
**Decided by:** Beats

Clear buttons in SettingsPage delegate to SettingsContext methods:

- `clearModelCache()`: Deletes Service Worker caches + IndexedDB model stores (any DB with 'whisper'/'model' in name)
- `clearConversationHistory()`: Deletes `'chat-copilot'` IndexedDB database

Both throw errors on failure (caller handles error UI). User should confirm before clearing.

---

## Pre-Commit Linting & Type Checks (Mandatory)

**Date:** 2026-04-05
**Decided by:** Lead (user directive)

All commits must pass ESLint and TypeScript checks before staging. Prevents code quality regressions.

**Requirement:**
- `pnpm lint` must return 0 errors
- `pnpm type-check` must return 0 errors
- If checks fail, fix violations before committing
- CI blocks merges on lint/type failures anyway

**Agent Workflow:**
1. Implement changes
2. Run `pnpm lint && pnpm type-check`
3. If failures, fix and re-run
4. Only when both pass: `git add` and present for user approval
5. Never skip this step; no eslint-disable comments for new code

**Historical Note:** First linting run after M7 found 58 errors (unused vars, any types, empty blocks, react-refresh violations). All fixed. Going forward, any new errors block commit.

---

## Copilot's No-Escape Clause

**Date:** 2026-04-04
**Decided by:** Copilot (with user blessing 😂)

Copilot will **NEVER** use `any` types or `eslint-disable` comments as a shortcut to bypass linting failures.

**The Rule:**
- ✅ Fix the actual problem (wrong types, unused vars, empty blocks)
- ✅ Add eslint-disable **only** for test files where mocking requires it
- ❌ No "quick wins" with `as any`
- ❌ No "I'll fix it later" eslint-disable comments
- ❌ No ignoring problems because they're "too hard"

**Rationale:** Every `any` and every disable comment is a future bug waiting to happen. The 58-error rebuild after M7 proved it. If the type system is hard, it's telling you something—and ignoring it costs more time later.

**What Actually Happened:** During the import refactoring, Copilot had to fix FFmpeg types properly (with a full interface), fix mock signatures, add type assertions where needed. No shortcuts. Result: 0 build errors, cleaner types, fewer future bugs.

**Going Forward:** If a linting error exists, the code doesn't build. Period.
