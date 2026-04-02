# Squad Decisions

## 2026-04-01: Backlog Management Strategy

**Date:** 2024  
**Requester:** Quique Fdez Guerra  
**Decision Owner:** Lead (Lead/Architect)  
**Status:** Proposed

### Question
How should we (squad) manage our backlog?

### Decision
**Use GitHub Issues as source of truth + Watcher for intelligent triage & routing.**

#### Why GitHub Issues
- **Single source of truth:** Code, PRs, and issues live in the same place—no context switching
- **Lightweight:** No overhead for a 6-person team building a personal PWA
- **Built-in automation:** Labels, workflows, auto-assignment via squad
- **Trade-off:** Loses specialized project management features (burndown charts, sprints), but we don't need them yet

#### Workflow: Create → Triage → Assign → Work → Close

1. **Create** (anyone)
   - Title: Problem or feature (be specific: "WhatsApp audio parsing fails on 32kHz")
   - Body: Context, acceptance criteria, why it matters
   - Label: `backlog` (Watcher routes it to inbox)

2. **Triage** (Lead or Watcher auto-trigger)
   - Assign domain label: `frontend`, `ai`, `systems`, `storage`, `infra`
   - Set priority: `p0-critical` (blocks ship), `p1-high` (sprint), `p2-normal` (backlog)
   - Link related issues with GitHub's references

3. **Assign** (Watcher + manual override)
   - Watcher routes to owner based on label (Artist → `frontend`, Asimov → `ai`, etc.)
   - Owner can self-assign or request explicit assignment
   - Team can see ownership in issue sidebar

4. **Work** (Owner)
   - Move to `in-progress` when starting
   - Link branch: `fixes #123` in commits/PRs
   - Keep comments updated if blockers arise

5. **Close** (PR or direct)
   - Link PR that resolves it: `fixes #123` auto-closes on merge
   - Or manually close with comment on why it's done/won't-fix

#### Watcher's Role
Watcher monitors and **amplifies signal:**
- **Inbox sweep:** Weekly scan for untracked work (PRs without issues, offline notes)
- **Auto-route:** Label + assign to domain expert (no manual config needed)
- **Blocker alerts:** Notify team if issue has `blocked` tag + dependency unmet
- **Stale review:** Flag issues untouched >2 weeks
- **Trade-off:** Automation is opinionated; we override it when needed

#### Labels (Minimal Set)
- **Status:** `backlog` (new), `in-progress`, `reviewing`, `done` (before close)
- **Domain:** `frontend`, `ai`, `systems`, `storage`, `infra` (route to Watcher)
- **Priority:** `p0-critical`, `p1-high`, `p2-normal`
- **Type:** `feature`, `bug`, `refactor`, `tech-debt`, `docs`
- **Blocker:** `blocked`, `blocked-by:123`

#### Process Rules
- **Small team = lightweight.** We don't track sprints yet (too early). Prioritization is `p0` vs. `p1` vs. backlog.
- **Watcher doesn't decide priority.** Only labels/routing. Lead trages priority.
- **Async-friendly:** Slack pings on new `p0` issues; weekly sync on `p1` decisions.
- **No process debt:** If 2+ people complain a label/rule is noise, we kill it.

#### Trade-offs Named

| Choice | Benefit | Cost |
|--------|---------|------|
| GitHub Issues (not Jira/Linear) | Single source of truth + code integration | No burndown charts or gantt (fine for now) |
| Auto-route via Watcher | No manual assignment overhead | Opinionated; must override sometimes |
| Simple labels | Fast to grok, low config | Doesn't scale past ~50 items (acceptable) |
| No sprints yet | Less ceremony, focus on work | Risk of scope creep (mitigate: Lead triages weekly) |

#### Next Steps
1. Set up label templates in GitHub repo settings
2. Configure Watcher routing rules (domain → owner mapping)
3. Post this in squad Slack + README
4. First issue: Quique creates test issue, Watcher routes it, Artist picks it up

---

## 2026-04-01: Initial Backlog Created for Chat Copilot MVP

**Date:** 2026-04-01  
**Decider:** Planner (Issue Writer / Product Analyst)  
**Status:** ✅ Completed

### Context

Quique provided a comprehensive project spec for Chat Copilot: a local-first PWA that transcribes WhatsApp audio in-browser (Whisper via Transformers.js) and generates contextual reply suggestions (template-based Phase 1, LLM Phase 2 stretch).

The spec defines:
- Tech stack: Vite + React + TypeScript, Transformers.js, ffmpeg.wasm, IndexedDB, PWA (share_target)
- Architecture: Feature-folder structure (`/features/{share, transcription, reply, profiles}`)
- Core features: Share target ingestion, audio processing, transcription, profiles, reply generation
- Constraints: Mobile-first, offline-capable, no backend, privacy by design
- Squad framework: Mandatory isolation for AI capabilities

### Decision

Created a complete, prioritized backlog of **43 GitHub issues** grouped into **7 milestones + stretch goals**:

1. **M1: Foundation** (5 issues) — Scaffold, Squad, PWA config, service worker, types
2. **M2: Ingestion** (3 issues) — Share target, file validation, upload UI
3. **M3: Audio Pipeline** (3 issues) — ffmpeg.wasm, chunking, progress UI
4. **M4: Transcription** (4 issues) — Whisper model, Squad capability, UI, errors
5. **M5: Profiles** (5 issues) — IndexedDB schema, CRUD, UI, form, seeding
6. **M6: Reply Generation** (4 issues) — Template engine, Squad capability, UI, profile selector
7. **M7: Polish** (11 issues) — State machine, workflow screen, model download UI, caching, errors, mobile UX, analytics
8. **Stretch Goals** (8 issues) — Multi-audio merge, reply ranking, language detection, WebGPU, settings, export, LLM Phase 2

**Priority distribution:**
- **P0-Critical:** 13 issues (blocking MVP)
- **P1-High:** 13 issues (core UX)
- **P2-Normal:** 17 issues (polish + stretch)

**Routing:**
- `frontend` → Artist (17 issues)
- `ai` → Asimov (10 issues)
- `systems` → Beats (4 issues)
- `storage` → Vault (12 issues)

### Rationale

- **Milestone sequencing:** M1-M3 can run in parallel (foundation + ingestion + audio). M4-M6 are sequential (transcription → profiles → replies). M7 integrates everything.
- **Dependency tracking:** Each issue lists "Depends on" to prevent blocking work. E.g., "Implement transcription capability" depends on "Load Whisper model".
- **Actionable scope:** Each issue = ~1 PR of work. No trivial tasks split out (e.g., "add button" as separate issue). No epics left un-decomposed.
- **MVP focus:** P0 issues deliver end-to-end flow (share audio → transcribe → generate reply → copy). P1 adds UX polish. P2 is nice-to-have.
- **Stretch goals explicit:** LLM Phase 2, WebGPU, multi-audio all marked stretch to keep MVP scope tight.

### Consequences

- **✅ Team can start immediately:** P0 issues in M1 (scaffold, Squad, PWA config) are unblocked and parallelizable.
- **✅ Clear ownership:** Labels route issues to the right agent (Artist, Asimov, Beats, Vault).
- **✅ Incremental delivery:** Each milestone delivers working functionality (M2 = file ingestion working, M4 = transcription working, etc.).
- **⚠️ Scope creep risk:** 43 issues is a lot. Stick to P0/P1 for MVP; defer P2 if timeline is tight.
- **⚠️ Mobile testing needed:** Issues like "Optimize mobile UX" assume testing on real devices (iOS Safari, Android Chrome). Plan for that.

### Artifacts

- **Backlog draft:** `.squad/agents/Planner/backlog-draft.md` (full 43-issue breakdown)
- **History updated:** `.squad/agents/Planner/history.md` (learnings appended)
- **Next steps:** Watcher (team lead) can review, create GitHub issues from draft, and route to agents via labels.

### Notes

- **Squad integration is P0:** Even though Phase 1 uses templates (not LLM), Squad capability abstraction is critical. Makes swapping to LLM (stretch) trivial.
- **IndexedDB schema decided early:** M5 Profile schema must be defined before CRUD or UI work starts. Avoids rework.
- **Service worker in two phases:** M1 = basic asset caching, M7 = model file caching. Models are large (~50MB); cache strategy differs from app assets.
- **Privacy-first analytics:** All telemetry local-only (IndexedDB). No external services. Opt-in by default.

**Status:** Backlog ready for team review. No blockers.

---

## 2026-04-01: GitHub repo connected

**By:** Quique (via Planner)  
**What:** Backlog pushed to CKGrafico/chat-copilot — 38 issues created across 8 milestones + stretch goals. Labels and milestones created.  
**Why:** User confirmed repo and requested push.

---

## 2026-04-01: Commit Approval Required

**Date:** 2026-04-01T15:50:00Z  
**By:** CKGrafico (via Copilot)  
**Directive:** User directive — commit approval required

### Decision
**Agents MUST ask for explicit user approval before committing anything to git. No autonomous commits without a human checkpoint.**

### Why
User request based on real-world experience — autonomous agents committing too fast to catch and stop. Privacy and safety guardrail.

### Policy
- NEVER run `git commit` autonomously
- Always stage changes with `git add` and then STOP
- Present a summary of staged changes to the user
- Wait for explicit approval before committing
- **This applies without exception to all agents, including Scribe**

---

## 2026-04-01: RTK (Rust Token Killer) Setup — MERGED from decisions/inbox/Beats-rtk-setup.md

**Date:** 2025-07-10  
**Author:** Beats (Systems Dev)  
**Status:** ✅ Operational

### Summary
RTK 0.34.1 already installed and configured. Running `rtk init -g` configured it for GitHub Copilot/Claude via `--claude-md` mode (Unix hooks not available on Windows).

### How Agents Use RTK
All agents prefix commands with `rtk` to compress output before it reaches the LLM:
```powershell
rtk git status
rtk npm run build
rtk grep -r "pattern" src/
```

### Key Stats
- **Binary location:** `C:\Projects\_clis\rtk.exe`
- **Config injected into:** `C:\Users\quique.fernandez\.claude\CLAUDE.md`
- **Token savings:** 94.5% overall on 4 recorded commands; `rtk vitest run` saved 99.8% (3.0K tokens)

### Commands
| Command | Purpose |
|---|---|
| `rtk <cmd>` | Run any CLI command with compression |
| `rtk gain` | Show token savings stats |
| `rtk --version` | Verify RTK is available |

---

## 2026-04-01: Triage Decision: Issue #1 — M1 Scaffold Vite + React + TypeScript — MERGED from decisions/inbox/Lead-triage-issue1.md

**Date:** 2025-01-09  
**Triaged By:** Lead (Lead/Architect)  
**Assigned To:** squad:Artist  
**Status:** ✅ Ready for work → ✅ COMPLETED

### Issue Summary
Scaffold Vite + React + TypeScript project with feature-folder architecture. P0 deliverable that establishes foundation all other features depend on.

### Routing Decision: squad:Artist ✓
- **Primary:** Frontend foundational work (scaffolding, tooling, architecture)
- **Scope:** Feature-folder structure, strict TS, ESLint from day 1
- **Criticality:** P0 — blocks all downstream feature work
- **Architectural Impact:** Foundation structure (read-once, maintain-forever); frontend lead owns vision

### Architecture Trade-offs Accepted
- **Feature-folder structure:** Requires discipline to avoid circular deps (mitigated: ESLint boundary rules in future)
- **Strict TypeScript + ESLint from Day 1:** Slower initial velocity, but correctness > speed for foundational code

### Acceptance Criteria
- ✅ npm create vite with React + TypeScript
- ✅ Feature folders: `src/features/{share,transcription,reply,profiles}`
- ✅ TypeScript strict mode enabled
- ✅ ESLint configured
- ✅ Dev server runs (`npm run dev`)
- ✅ Placeholder route renders

### Result
✅ COMPLETED — Artist scaffolded 26 files with feature-folder architecture, React Router v7, Dexie, and @xenova/transformers. Staged on `squad/1-scaffold-vite-react-ts`, PR #39 opened. All deps already present; no additions needed.

---

## 2026-04-01: Artist — Scaffold Decisions — MERGED from decisions/inbox/Artist-scaffold-decisions.md

**Date:** 2026-04-01  
**Agent:** Artist (Frontend Dev)  
**Issue:** #1 — M1 Scaffold Vite + React + TypeScript  
**Status:** ✅ Locked

### Architecture Created

```
src/
  features/
    share/
      components/.gitkeep
      hooks/.gitkeep
      shareHandler.ts      ✅ stub — share target ingestion entry point
      types.ts             ✅ stub — SharedAudioItem, ShareStatus
    transcription/
      components/.gitkeep
      hooks/.gitkeep
      whisperService.ts    ✅ stub — Whisper model loading + transcription
      audioProcessing.ts   ✅ stub — ffmpeg.wasm pipeline
      types.ts             ✅ stub — Transcription, TranscriptionStatus
    reply/
      components/.gitkeep
      hooks/.gitkeep
      replyEngine.ts       ✅ stub — template/LLM reply generation
      promptBuilder.ts     ✅ stub — builds prompt/template key from context
      types.ts             ✅ stub — ReplySession, ReplyStatus
    profiles/
      components/.gitkeep
      hooks/.gitkeep
      profileStore.ts      ✅ stub — Dexie CRUD for user profiles
      types.ts             ✅ stub — Profile, ProfileTone
  shared/
    ui/.gitkeep
    utils/.gitkeep
    storage/.gitkeep
  app/
    router.tsx             ✅ stub — React Router v7 browser router
    providers.tsx          ✅ stub — RouterProvider wrapper; ready for more providers

src/App.tsx               ✅ cleaned — boilerplate removed
src/main.tsx              ✅ updated — mounts <Providers /> instead of <App />
```

### Key Decisions Locked

1. **`src/app/` for router + providers** — Keeps root-level orchestration separate from feature code
2. **Providers.tsx as composition root** — All future React context providers stack here
3. **Stubs throw `Error('Not implemented')`** — Better than silent no-ops; makes forgotten work loud
4. **`.gitkeep` in components/ and hooks/** — Reserves folder convention without forcing index files

### Dependencies (Already Installed)
- ✅ `react-router-dom@^7`
- ✅ `dexie@^4`
- ✅ `@xenova/transformers@^2`

### Flagged for Follow-up

- **ffmpeg.wasm COOP/COEP headers:** Vite config needs `Cross-Origin-Opener-Policy` + `Cross-Origin-Embedder-Policy` headers for SharedArrayBuffer support (flagged to Beats/Asimov)
- **ESLint cross-feature import rules:** Suggest adding `eslint-plugin-import` boundary rules when team scales feature work

---

## 2026-04-01: PR #39 Review — Modular Violation Blocked — MERGED from decisions/inbox/Reviewer-pr39-review.md

**Date:** 2026-04-01  
**Reviewer:** Reviewer (PR Reviewer)  
**PR:** #39 — [M1] Scaffold Vite + React + TypeScript  
**Author:** Artist  
**Status:** ❌ Changes Requested

### Finding
`src/features/reply/replyEngine.ts` and `src/features/reply/promptBuilder.ts` import `Transcription` type from `../transcription/types.ts`, violating `.plain-guardrails/modular.md`:
> "No cross-feature imports. Cross-feature communication routes through `src/shared/` only."

### Required Fix
1. Create `src/shared/types.ts` (new shared types layer)
2. Extract `Transcription` and `TranscriptionStatus` to shared
3. Update reply to import from shared, not transcription

### Team Precedent
**Cross-feature type imports are blocked, even for type-only imports.** The shared layer exists for exactly this purpose.

### Resolution
Artist locked from fix (original author). Delegated to Asimov. Re-review pending after fix applied.

---

## 2026-04-01: Asimov — Shared Type Extraction Fix (PR #39) — MERGED from decisions/inbox/Asimov-shared-types.md

**Date:** 2026-04-01 18:44:13Z  
**Agent:** Asimov (AI Pipeline Dev)  
**Issue:** PR #39 modular violation  
**Status:** ✅ Fixed & Staged

### Action Taken
1. Created `src/shared/types.ts` with `Transcription` and `TranscriptionStatus`
2. Updated `src/features/transcription/types.ts` to re-export from shared (backward compatibility)
3. Updated `src/features/reply/replyEngine.ts` to import from shared
4. Updated `src/features/reply/promptBuilder.ts` to import from shared

### Files Staged
- `src/shared/types.ts` (new)
- `src/features/transcription/types.ts` (modified)
- `src/features/reply/replyEngine.ts` (modified)
- `src/features/reply/promptBuilder.ts` (modified)

### Pattern Established
**Shared Type Extraction:** When multiple features need the same type, extract to `src/shared/types.ts`. Feature-specific types live in feature folders; cross-feature types live in shared. Scalable for future multi-feature dependencies.
