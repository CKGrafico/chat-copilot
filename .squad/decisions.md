# Squad Decisions

## 2026-04-01: Backlog Management Strategy

**Date:** 2024  
**Requester:** Quique Fdez Guerra  
**Decision Owner:** Danny (Lead/Architect)  
**Status:** Proposed

### Question
How should we (squad) manage our backlog?

### Decision
**Use GitHub Issues as source of truth + Ralph for intelligent triage & routing.**

#### Why GitHub Issues
- **Single source of truth:** Code, PRs, and issues live in the same place—no context switching
- **Lightweight:** No overhead for a 6-person team building a personal PWA
- **Built-in automation:** Labels, workflows, auto-assignment via squad
- **Trade-off:** Loses specialized project management features (burndown charts, sprints), but we don't need them yet

#### Workflow: Create → Triage → Assign → Work → Close

1. **Create** (anyone)
   - Title: Problem or feature (be specific: "WhatsApp audio parsing fails on 32kHz")
   - Body: Context, acceptance criteria, why it matters
   - Label: `backlog` (Ralph routes it to inbox)

2. **Triage** (Danny or Ralph auto-trigger)
   - Assign domain label: `frontend`, `ai`, `systems`, `storage`, `infra`
   - Set priority: `p0-critical` (blocks ship), `p1-high` (sprint), `p2-normal` (backlog)
   - Link related issues with GitHub's references

3. **Assign** (Ralph + manual override)
   - Ralph routes to owner based on label (Rusty → `frontend`, Linus → `ai`, etc.)
   - Owner can self-assign or request explicit assignment
   - Team can see ownership in issue sidebar

4. **Work** (Owner)
   - Move to `in-progress` when starting
   - Link branch: `fixes #123` in commits/PRs
   - Keep comments updated if blockers arise

5. **Close** (PR or direct)
   - Link PR that resolves it: `fixes #123` auto-closes on merge
   - Or manually close with comment on why it's done/won't-fix

#### Ralph's Role
Ralph monitors and **amplifies signal:**
- **Inbox sweep:** Weekly scan for untracked work (PRs without issues, offline notes)
- **Auto-route:** Label + assign to domain expert (no manual config needed)
- **Blocker alerts:** Notify team if issue has `blocked` tag + dependency unmet
- **Stale review:** Flag issues untouched >2 weeks
- **Trade-off:** Automation is opinionated; we override it when needed

#### Labels (Minimal Set)
- **Status:** `backlog` (new), `in-progress`, `reviewing`, `done` (before close)
- **Domain:** `frontend`, `ai`, `systems`, `storage`, `infra` (route to Ralph)
- **Priority:** `p0-critical`, `p1-high`, `p2-normal`
- **Type:** `feature`, `bug`, `refactor`, `tech-debt`, `docs`
- **Blocker:** `blocked`, `blocked-by:123`

#### Process Rules
- **Small team = lightweight.** We don't track sprints yet (too early). Prioritization is `p0` vs. `p1` vs. backlog.
- **Ralph doesn't decide priority.** Only labels/routing. Danny trages priority.
- **Async-friendly:** Slack pings on new `p0` issues; weekly sync on `p1` decisions.
- **No process debt:** If 2+ people complain a label/rule is noise, we kill it.

#### Trade-offs Named

| Choice | Benefit | Cost |
|--------|---------|------|
| GitHub Issues (not Jira/Linear) | Single source of truth + code integration | No burndown charts or gantt (fine for now) |
| Auto-route via Ralph | No manual assignment overhead | Opinionated; must override sometimes |
| Simple labels | Fast to grok, low config | Doesn't scale past ~50 items (acceptable) |
| No sprints yet | Less ceremony, focus on work | Risk of scope creep (mitigate: Danny triages weekly) |

#### Next Steps
1. Set up label templates in GitHub repo settings
2. Configure Ralph routing rules (domain → owner mapping)
3. Post this in squad Slack + README
4. First issue: Quique creates test issue, Ralph routes it, Rusty picks it up

---

## 2026-04-01: Initial Backlog Created for Chat Copilot MVP

**Date:** 2026-04-01  
**Decider:** Saul (Issue Writer / Product Analyst)  
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
- `frontend` → Rusty (17 issues)
- `ai` → Linus (10 issues)
- `systems` → Basher (4 issues)
- `storage` → Livingston (12 issues)

### Rationale

- **Milestone sequencing:** M1-M3 can run in parallel (foundation + ingestion + audio). M4-M6 are sequential (transcription → profiles → replies). M7 integrates everything.
- **Dependency tracking:** Each issue lists "Depends on" to prevent blocking work. E.g., "Implement transcription capability" depends on "Load Whisper model".
- **Actionable scope:** Each issue = ~1 PR of work. No trivial tasks split out (e.g., "add button" as separate issue). No epics left un-decomposed.
- **MVP focus:** P0 issues deliver end-to-end flow (share audio → transcribe → generate reply → copy). P1 adds UX polish. P2 is nice-to-have.
- **Stretch goals explicit:** LLM Phase 2, WebGPU, multi-audio all marked stretch to keep MVP scope tight.

### Consequences

- **✅ Team can start immediately:** P0 issues in M1 (scaffold, Squad, PWA config) are unblocked and parallelizable.
- **✅ Clear ownership:** Labels route issues to the right agent (Rusty, Linus, Basher, Livingston).
- **✅ Incremental delivery:** Each milestone delivers working functionality (M2 = file ingestion working, M4 = transcription working, etc.).
- **⚠️ Scope creep risk:** 43 issues is a lot. Stick to P0/P1 for MVP; defer P2 if timeline is tight.
- **⚠️ Mobile testing needed:** Issues like "Optimize mobile UX" assume testing on real devices (iOS Safari, Android Chrome). Plan for that.

### Artifacts

- **Backlog draft:** `.squad/agents/saul/backlog-draft.md` (full 43-issue breakdown)
- **History updated:** `.squad/agents/saul/history.md` (learnings appended)
- **Next steps:** Ralph (team lead) can review, create GitHub issues from draft, and route to agents via labels.

### Notes

- **Squad integration is P0:** Even though Phase 1 uses templates (not LLM), Squad capability abstraction is critical. Makes swapping to LLM (stretch) trivial.
- **IndexedDB schema decided early:** M5 Profile schema must be defined before CRUD or UI work starts. Avoids rework.
- **Service worker in two phases:** M1 = basic asset caching, M7 = model file caching. Models are large (~50MB); cache strategy differs from app assets.
- **Privacy-first analytics:** All telemetry local-only (IndexedDB). No external services. Opt-in by default.

**Status:** Backlog ready for team review. No blockers.

---

## 2026-04-01: GitHub repo connected

**By:** Quique (via Saul)  
**What:** Backlog pushed to CKGrafico/chat-copilot — 38 issues created across 8 milestones + stretch goals. Labels and milestones created.  
**Why:** User confirmed repo and requested push.
