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

## The Squad Team

| Agent | Role | Owns |
|-------|------|------|
| **Lead** | Architect | Architecture decisions, triage, review escalation |
| **Artist** | Frontend Dev | React components, CSS, routing, UX |
| **Asimov** | AI Pipeline Dev | Transformers.js, Squad capabilities, inference |
| **Beats** | Systems Dev | Audio processing, ffmpeg.wasm, service worker |
| **Vault** | Storage & Config | IndexedDB, Dexie, PWA manifest, caching |
| **Planner** | Issue Writer | Backlog decomposition, acceptance criteria |
| **Reviewer** | PR Reviewer | Code review via inline GitHub PR comments |
| **Scribe** | Session Logger | Decision merging, cross-agent memory |
| **Watcher** | Work Monitor | Issue triage, stale detection, label sync |

Team roster: [`.squad/team.md`](.squad/team.md)
Routing rules: [`.squad/routing.md`](.squad/routing.md)
Team decisions: [`.squad/decisions.md`](.squad/decisions.md)

## Key Guardrails

- **No autonomous commits to main.** Agents work on feature branches. Merges require explicit approval.
- **Inline PR reviews are mandatory.** Reviewer posts findings as GitHub review comments on the exact file and line, not as chat text. Severity: BLOCKER / WARNING / MINOR.
- **No cross-feature imports.** Features communicate through `src/shared/` only.
- **No human names in automation.** Agents use role names only (`lead`, `artist`, `reviewer`).
- **AI capabilities route through Squad service.** UI never imports AI modules directly.

See [`.squad/decisions.md`](.squad/decisions.md) for the full list.

## Project Structure

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
