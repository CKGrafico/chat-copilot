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

---

## 2026-04-01 — PR #42 Fix: Squad Framework Skeleton

**Completed:** Fixed three blocking issues in PR #42 (authored by Linus, reviewed by Reuben).

**Context:**
Linus was locked out per review policy. I inherited the branch and rebased onto main to pick up PR #40 and #41 shared types changes.

**Issues fixed:**
1. **Profile type import:** After rebase, `src/shared/types/index.ts` now exports Profile correctly. Resolved merge conflict by accepting main's comment style. Import path `'../../shared/types'` works.
2. **package.json self-reference:** Removed accidental `"chat-copilot": "file:"` entry (pnpm artifact).
3. **pnpm-lock.yaml:** Deleted via `git rm pnpm-lock.yaml`. Project uses npm (package-lock.json).

**Verification:**
- TypeScript compiles cleanly: `node .\node_modules\typescript\bin\tsc --noEmit` (0 errors)
- Tests pass: vitest run (3/3 passing)
- Workaround: npm install broken in environment; used direct node invocation

**Key learning:**
When rebasing branches that reference shared types, merge conflicts in re-export comments are expected and trivial — just accept main's version. The import machinery matters, not the comment style.

**Staged, awaiting commit approval and force-push.**

