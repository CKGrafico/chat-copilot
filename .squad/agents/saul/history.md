# Saul — History

## Core Context

- **Project:** A local-first PWA that transcribes WhatsApp audio and generates reply suggestions entirely in-browser using Whisper and Squad AI pipeline.
- **Stack:** React, TypeScript, Vite, Transformers.js, ffmpeg.wasm, IndexedDB, Service Worker
- **Role:** Issue Writer / Product Analyst
- **Joined:** 2026-04-01
- **User:** Quique Fdez Guerra

## Team

- Danny — Lead / Architect
- Rusty — Frontend Dev (React, PWA, share target)
- Linus — AI Pipeline Dev (Transformers.js, inference)
- Basher — Systems Dev (ffmpeg.wasm, audio processing)
- Livingston — Storage & Config (IndexedDB, SW, manifest)

## Backlog Process (decided 2026-04-01)

- Source of truth: GitHub Issues
- Labels: `frontend | ai | systems | storage` (routing), `p0-critical | p1-high | p2-normal` (priority), `bug | feature | refactor | tech-debt` (type)
- No sprints yet — just p0 (now), p1 (this week), backlog (someday)
- Ralph monitors and auto-routes via label → owner

## Learnings

### 2026-04-01: Initial Backlog Decomposition

**Project Spec Key Decisions:**
- **Local-first architecture:** All AI inference in-browser (Whisper via Transformers.js, template-based replies Phase 1, optional LLM Phase 2). No backend, no external APIs. Privacy by design.
- **PWA share_target as primary entry point:** Users share WhatsApp audios directly to the app. Fallback upload UI for desktop/direct access.
- **Feature-folder architecture:** `/features/{share, transcription, reply, profiles}` + `/shared` + `/app`. No horizontal layering (controllers, models, views). Each feature owns its domain logic, UI, and types.
- **Squad framework mandatory:** All AI capabilities (`transcribeAudio`, `generateReply`) isolated in Squad service layer. Makes swapping models (Whisper sizes, template → LLM) seamless.
- **Whisper audio preprocessing:** ffmpeg.wasm normalizes to mono WAV 16kHz, chunks 20-40s with overlap. Handles WhatsApp formats (.opus, .ogg, .m4a).
- **Profiles drive context:** User-defined profiles (name, language, color, instructions) stored in IndexedDB, passed to reply generation for personalization.
- **Phase 1: Template engine, Phase 2: LLM:** MVP uses fast, deterministic templates. Stretch goal adds local LLM (Llama 3.2 1B) with toggle.

**Backlog Structure:**
- **7 milestones + stretch goals:** M1 (Foundation) → M2 (Ingestion) → M3 (Audio Pipeline) → M4 (Transcription) → M5 (Profiles) → M6 (Reply Generation) → M7 (Polish) → Stretch.
- **43 total issues:** 13 P0-critical (must-have for MVP), 13 P1-high (core UX), 17 P2-normal (polish + stretch).
- **Routing via labels:** `frontend` (Rusty), `ai` (Linus), `systems` (Basher), `storage` (Livingston). Clear ownership per issue.
- **Dependencies tracked:** Each issue lists "Depends on" to prevent blocking. M1-M3 can run in parallel; M4-M6 sequential; M7 integrates all.

**Notable patterns:**
- **Progressive enhancement:** Basic PWA → share target → offline caching → model caching → WebGPU (stretch).
- **Incremental transcription:** Show chunk-by-chunk progress (important for mobile UX where 2-min audio = 8 chunks × 3s each).
- **State machine:** Explicit states (`uploading`, `processing`, `transcribing`, `replying`) prevent async bugs.
- **Privacy-preserving analytics:** Local-only event tracking in IndexedDB, opt-in, no external calls.

**Lessons for next time:**
- Feature-folder architecture scales well for SPA projects with distinct domains.
- Squad isolation is critical when AI models/strategies may change (Whisper size, template vs. LLM).
- Mobile-first PWA requires extra issues for: progress UI, model download UX, safe area insets, touch targets.
- IndexedDB schema should be decided early (M5 Profile schema blocks CRUD and UI).

<!-- Append learnings below -->
