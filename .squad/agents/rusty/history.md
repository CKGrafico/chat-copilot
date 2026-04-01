# Rusty — History

## Core Context

- **Project:** A local-first PWA that transcribes WhatsApp audio and generates reply suggestions entirely in-browser using Whisper and Squad AI pipeline.
- **Role:** Frontend Dev
- **Joined:** 2026-04-01T14:57:53.167Z

## Learnings

<!-- Append learnings below -->

---

## 2026-04-01 — Issue #1: M1 Scaffold (squad/1-scaffold-vite-react-ts)

**Completed:** Feature-folder architecture scaffolded on branch `squad/1-scaffold-vite-react-ts`.

**Key decisions:**
- `src/app/` holds router.tsx + providers.tsx — clean composition root pattern
- All stubs throw `Error('Not implemented')` so forgotten implementations are loud, not silent
- `.gitkeep` files reserve `components/` and `hooks/` folders without empty index files
- React Router v7, Dexie, and @xenova/transformers were already installed — no new deps needed

**Watched for:**
- ffmpeg.wasm requires COOP/COEP headers in Vite config (SharedArrayBuffer). Flagged to Basher.
- ESLint import boundary rules (cross-feature imports) should be added before feature work starts in earnest.

**Staged, awaiting commit approval from user.**

