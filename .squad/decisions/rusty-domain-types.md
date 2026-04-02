# Artist — Domain Types Placement Decisions (Issue #5)

**Date:** 2026-04-01
**Agent:** Artist (Frontend Dev)
**Issue:** #5 — [M1] Add TypeScript types for core domain models (Audio, Profile, Session)
**Branch:** squad/5-core-domain-types
**Status:** Staged, awaiting commit approval

---

## Decision: Profile must re-export from shared, not define locally

The shared types module (src/shared/types/) already defines the canonical Profile type.
src/features/profiles/types.ts had a duplicate Profile with different fields (tone, contextHints, isDefault)
that would conflict and confuse consumers.

**Action:** Replaced the local Profile definition with a re-export from shared.
ProfileTone is kept feature-local — it's a UI-layer concept for tone controls.

**Pattern:** Same as src/features/transcription/types.ts — feature re-exports the shared type for backward
compatibility within the feature, but the canonical definition lives in shared.
