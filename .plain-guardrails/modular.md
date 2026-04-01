# Modularity Guardrail

> Feature folders are bounded contexts. Violate the boundary and you own the coupling debt forever.

## Checklist

- [ ] Each feature (`share`, `transcription`, `reply`, `profiles`) owns its components, hooks, services, and types
- [ ] No cross-feature imports: `features/share` must not import from `features/transcription`, etc.
- [ ] Cross-feature communication routes through `src/shared/` only — no exceptions
- [ ] Hooks are co-located with the feature that owns them — no hooks defined in `shared/` unless used by 2+ features
- [ ] Service files (`whisperService.ts`, `replyEngine.ts`, etc.) do not import React or any React APIs
- [ ] Squad capabilities (`transcribeAudio`, `generateReply`) are wrapped by the service layer — components never call them directly
- [ ] Each feature's `index.ts` (if present) is the sole public API — internals are not imported from outside
- [ ] `src/shared/` contains only genuinely cross-cutting concerns — not "stuff I didn't know where to put"
- [ ] No circular imports between features or between a feature and shared
- [ ] Component files do not contain business logic — delegate to hooks or services
- [ ] No utility functions defined inline in component files that belong in a service or util module

## ❌ Red flags — auto-reject

- `import { X } from '../transcription/...'` inside `features/share/`
- React import inside a service file (`whisperService.ts`, `replyEngine.ts`, etc.)
- Squad capability called directly from a component (`transcribeAudio()` inside JSX handlers)
- Business logic (audio processing, reply generation) defined inside a component file
- Hook defined in `src/shared/` that is only used by one feature
- Feature internals imported by bypassing `index.ts`
