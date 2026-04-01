# Reuben — History

## Project Context

**Project:** Chat Copilot — local-first PWA that transcribes WhatsApp audio and generates contextual reply suggestions. Runs entirely in-browser, no backend.

**Stack:** Vite + React + TypeScript, Transformers.js (Whisper), ffmpeg.wasm, IndexedDB (Dexie), PWA with share_target. Hosted on GitHub Pages.

**Architecture:** Feature-folder layout under `src/features/` — each feature owns its components, hooks, and service files. No cross-feature imports except via `src/shared/`. Squad integration as the AI pipeline orchestration layer.

**Repo:** CKGrafico/chat-copilot
**Requested by:** CKGrafico

**Team:** Danny (Lead), Rusty (Frontend), Linus (AI Pipeline), Basher (Systems), Livingston (Storage), Saul (Issue Writer), Reuben (PR Reviewer), Scribe (Logger), Ralph (Monitor)

## Key Decisions to Enforce in Reviews

- Feature-folder architecture: no cross-feature imports except via `src/shared/`
- No backend, no external APIs — everything runs in-browser
- Strict TypeScript — no `any`, no implicit types
- Commit policy: agents must `git add` + wait for approval, never commit autonomously
- Privacy by design — no data leaves the device

## Learnings

*(appended as reviews are completed)*
