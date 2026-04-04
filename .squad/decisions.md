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
