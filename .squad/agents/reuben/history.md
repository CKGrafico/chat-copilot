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

### 2026-04-01 — First PR Review Cycle Complete

**Context:** Initial review of PR #39 (M1 Scaffold). Enforced modular guardrail on cross-feature imports.

**Finding:** Reply feature imported `Transcription` and `TranscriptionStatus` types directly from transcription feature, violating `.plain-guardrails/modular.md`.

**Action:** Posted CHANGES REQUESTED on GitHub. Locked original author (Rusty) from fix. Delegated to Linus for correction.

**Outcome:** Modular boundary enforced. Set precedent: cross-feature communication (including types) routes exclusively through `src/shared/`. First rejection cycle established pattern for future reviews.

**Status:** Re-review pending after Linus's shared type extraction fix applied.

## Session Log

### 2026-01-04 — Guardrails Established

Created `.plain-guardrails/` with 7 review criteria files:
- `error-handling.md` — async error coverage, typed catches, recovery paths for ffmpeg.wasm and Transformers.js
- `logging.md` — no PII in logs, structured format, no console.log in production paths
- `modular.md` — feature-folder boundaries, no cross-feature imports, service files must not import React
- `conventions.md` — strict TypeScript, file naming, named exports, no magic strings, branch naming
- `rtk.md` — RTK is a CLI proxy only, never imported in application code
- `ddd.md` — bounded contexts, ubiquitous language, domain type ownership, Squad capability mapping
- `architecture.md` — feature-folder law, lazy-load boundaries, audio pipeline order, no network calls in components

Charter updated with `## Guardrails` section linking to `.plain-guardrails/` as mandatory pre-review reading.
