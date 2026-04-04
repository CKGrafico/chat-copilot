# Chat Copilot

A local-first PWA that transcribes WhatsApp audio and generates contextual reply suggestions. Runs fully in-browser using Whisper via Transformers.js. No backend required.

## Why This Repo Exists

This project demonstrates how to use **Squad** (an AI team framework) with **GitHub Copilot** to build real software using a structured workflow:

1. **Issues** define the work (features, bugs, refactors)
2. **Triage** routes issues to the right specialist agent
3. **Feature branches** isolate changes (`squad/{issue}-{slug}`)
4. **Pull requests** link back to issues (`Closes #N`)
5. **Inline PR reviews** catch problems before merge (posted as GitHub review comments)
6. **Merge and close** completes the cycle

Every step is tracked in GitHub. Every decision is documented. Every review is auditable.

## The 9-Person Squad (Detailed)

### Lead (Architect)
**Owns:** Architecture decisions, priority triage, escalation

When deciding "IndexedDB vs localStorage," Lead says "IndexedDB—we need async storage for large datasets." Decision goes into `decisions.md`. Team follows it forever. Lead makes yes/no on design trade-offs. Breaks ties. Approves high-risk changes.

### Artist (Frontend Developer)
**Owns:** React, CSS, PWA shell, UI routing, accessibility

When adding profiles screen, Artist creates feature folders (`src/features/profiles/`), adds responsive CSS with 44px touch targets (mobile-first), and opens PR. Reviewer checks for accessibility. If aria-live is missing, Reviewer blocks merge.

### Asimov (AI Pipeline Developer)
**Owns:** Transformers.js, Whisper model, Squad capability service

Implements reply generation in `src/features/reply/templateEngine.ts` but wraps it in `src/shared/squad/squadService.ts` so UI never imports AI modules directly. When you swap templates for LLM later, you change one file. UI unchanged.

### Beats (Systems/Audio Developer)
**Owns:** ffmpeg.wasm, audio processing, service worker, COOP/COEP headers

Handles 32kHz mono → 16kHz stereo conversion, audio chunking, progress reporting. Reviews performance, offline capability, CORS issues.

### Vault (Storage/Infrastructure Developer)
**Owns:** IndexedDB (Dexie), service worker caching, PWA manifest

Creates Dexie schema v2 with `profiles` and `analytics` tables. Implements CRUD operations. Versions model cache (`models-v1` → `models-v2` when Whisper updates).

### Planner (Issue Writer)
**Owns:** Backlog decomposition, acceptance criteria, user stories

User says "Add profiles." Planner breaks into 5 issues: IndexedDB schema, CRUD, ProfileList UI, ProfileForm, seed default profile. Each issue ≈ 1 PR of work.

### Reviewer (PR Gatekeeper)
**Owns:** Code correctness, architecture guardrails, accessibility, test coverage

Posts findings as inline GitHub PR comments (exact file+line, severity: 🔴 BLOCKER / 🟡 WARNING / 🔵 MINOR). Blocks merge if tests fail, guardrails violated, or error handling missing.

### Scribe (Session Logger)
**Owns:** `decisions.md`, session logs, cross-agent memory

Invisible. Runs in background. Merges all decision files into shared decisions file. Deduplicates overlapping decisions. Commits squad changes to git. No one sees this happen.

### Watcher (Issue Monitor)
**Owns:** Triage, auto-routing, stale detection, auto-merge

Runs on schedule. Sees new issue → reads title/body → labels `squad:beats` → assigns to Beats. Later auto-merges when CI passes + Reviewer approves.

**Links:** [Team Roster](.squad/team.md) | [Routing Rules](.squad/routing.md) | [Team Decisions](.squad/decisions.md)

## 5 Core Rules (Guardrails)

### Rule 1: No Autonomous Commits to Main
Agents stage changes, show summary, **wait for explicit approval**.

```powershell
# Agent stages:
git add .

# Shows summary:
"Staged 5 files for profiles milestone. Ready to commit?"

# User approves:
"commit"

# Then agent pushes
git push origin main
```

### Rule 2: No Cross-Feature Imports
Features are isolated. All communication routes through `src/shared/`.

```typescript
// ❌ BLOCKED
import { Transcription } from '../transcription/types'

// ✅ ALLOWED
import { Transcription } from '../../shared/types'
```

PR #39 violated this (reply importing from transcription). Reviewer blocked it. Asimov fixed using shared types layer. Precedent set forever.

### Rule 3: Inline PR Reviews Only
Reviewer posts findings as GitHub PR comments (exact line number), not chat text.

```powershell
gh api repos/CKGrafico/chat-copilot/pulls/55/reviews `
  --method POST `
  --field body="Ready pending fixes" `
  --field event="COMMENT" `
  --field "comments[][path]=src/features/profiles/ProfileList.tsx" `
  --field "comments[][line]=42" `
  --field "comments[][body]=🔴 BLOCKER: Missing error boundary"
```

GitHub shows inline comment. Artist sees exactly where to fix. No ambiguity.

### Rule 4: No Human Names
All automation uses agent role names only. Human names forbidden in commits, PRs, issues, comments.

```bash
# ❌ BLOCKED
git commit -m "fix: Quique requested this change"

# ✅ ALLOWED  
git commit -m "fix: per user feedback, address reply generation"
```

CI script enforces: `.squad/tools/check-agent-names.ps1`

### Rule 5: Rejection Lockout
If Reviewer rejects your PR, you can't re-work it. Someone else fixes the blockers.

```
PR #42 by Artist → Reviewer: 2 BLOCKERS
→ Artist LOCKED from re-working
→ Asimov assigned to fix blockers
→ Asimov commits to same PR
→ Reviewer approves → Merged
```

Forces objectivity. No author bias.

## Real Workflow Example: Adding Profiles

### Step 1: Planner Breaks Down Work
User: "I want to save user profiles."

Planner creates 5 issues:
- **#16:** IndexedDB schema (Vault, P0)
- **#17:** Profile CRUD (Vault, P0)
- **#18:** ProfileList UI (Artist, P1)
- **#19:** ProfileForm validation (Artist, P1)
- **#20:** Seed default profile (Vault, P0)

Each issue has acceptance criteria, routing label, priority.

### Step 2: Watcher Routes & Assigns
Watcher sees issues → labels `squad:vault` and `squad:artist` → auto-assigns to agents.

### Step 3: Vault Implements Storage (#16)
```bash
git checkout -b squad/16-profile-indexeddb-schema
# Writes src/shared/storage/db.ts (Dexie schema v2)
git commit -m "feat(storage): add profiles table (#16)"
git push
gh pr create --title "[M5] IndexedDB schema for profiles" \
  --body "Closes #16" --head squad/16-profile-indexeddb-schema --base main
```

### Step 4: Reviewer Reviews PR
Posts inline comments:
- 🔴 "Missing error handling in `initDB()` — wrap in try/catch"
- 🟡 "Add JSDoc for schema fields"
- 🔵 "Consider index on profile.id"

### Step 5: Vault Fixes Blockers
```bash
git commit -m "fix: add error handling to initDB (#16)"
git push
# Replies to Reviewer: "Blockers addressed in latest commit"
```

### Step 6: Reviewer Approves
Re-reviews → Approves. Watcher auto-merges. Issue #16 closes automatically.

### Step 7: Artist Builds UI (#18)
Can now import `profileStore` (Vault finished #16). Creates ProfileList with pagination, search. Tests on mobile (44px touch targets, aria-live regions).

### Step 8: Reviewer Checks Accessibility
- 🔴 "Touch targets only 32px, need 44px"
- 🔴 "Missing aria-live for loading"
- 🟡 "Consider skeleton UI"

Artist fixes → Reviewer approves → Merged.

### Step 9: Scribe Logs
Session complete. Scribe:
- Merges all decision files
- Logs: "M5 profiles: 5 issues, 5 PRs, all guardrails passed"
- Commits squad changes
- Disappears (invisible)

### Step 10: Done
User runs `pnpm dev`, navigates to `/profiles`, sees ProfileList with saved profiles. Data persists in IndexedDB.

---

## For Your Company (500 People)

This repo shows you:

1. **Clear Ownership** — No "who's responsible?" fights. Each agent owns a domain.
2. **Async-Friendly** — Agents work in parallel. Decisions documented. No back-and-forth.
3. **Auditable** — Every PR has inline comments tied to exact code lines. Every decision in git history.
4. **Prevents Chaos** — Naming policy, guardrails, rejection lockout = no firefights over code.
5. **Scalable** — Add more agents as you grow. Same rules. Same structure.

### How to Use This as a Template

1. Copy `.squad/` to your repo
2. Update `.squad/team.md` with your team's agents and domains
3. Update `.squad/routing.md` with your work-type routing
4. Create `.squad/agents/{agent-name}/charter.md` for each agent
5. Set `.squad/decisions.md` with your team's first decisions
6. Enable GitHub Actions workflows (in `.github/workflows/`) for triage & auto-merge
7. Train your AI agents on `.squad/copilot-instructions.md`

Then pick an issue, and watch your AI team work.

---

```
src/
  app/                    # Router, providers (composition root)
  features/
    share/                # WhatsApp share-target ingestion
    transcription/        # Whisper model loading + transcription
    reply/                # Template-based reply generation
    profiles/             # User profiles (IndexedDB CRUD)
    workflow/             # Main orchestration screen + state machine
  shared/
    analytics/            # Local-only opt-in analytics
    components/           # ErrorBoundary, GlobalErrorHandler
    squad/                # Squad capability service (AI abstraction)
    state/                # App state machine (pure reducer)
    storage/              # Dexie database
    types/                # Cross-feature types
    utils/                # Shared utilities
```

## Getting Started

```bash
pnpm install
pnpm dev
```

## Stack

- **Vite 8** + **React 19** + **TypeScript** (strict)
- **Dexie 4** (IndexedDB)
- **Transformers.js** (Whisper, in-browser)
- **PWA** with share-target and model caching
