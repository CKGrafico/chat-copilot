# Linus — History

## Core Context

- **Project:** A local-first PWA that transcribes WhatsApp audio and generates reply suggestions entirely in-browser using Whisper and Squad AI pipeline.
- **Role:** AI Pipeline Dev
- **Joined:** 2026-04-01T14:57:53.178Z

## Learnings

### 2026-04-01 — Shared Type Extraction Pattern

**Context:** PR #39 review flagged cross-feature import violation (reply importing transcription types).

**Pattern:** When multiple features need the same type, extract to `src/shared/types.ts`. Feature-specific types stay in feature folders; cross-feature types live in shared. Applied to `Transcription` and `TranscriptionStatus`.

**Outcome:** Modular violation fixed, scalable pattern established for future multi-feature dependencies. Set precedent: even type-only imports must route through shared layer.
