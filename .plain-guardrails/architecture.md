# Architecture Guardrail

> The folder structure is the architecture. Deviate from it and you've shipped technical debt.

## Checklist

- [ ] Feature folders are the law: `src/features/{share,transcription,reply,profiles}/` — no feature code outside these folders
- [ ] Shared layer (`src/shared/{ui,utils,storage}/`) contains only truly cross-cutting concerns
- [ ] App shell (`src/app/`) holds routing (`router.tsx`) and providers (`providers.tsx`) only — no business logic
- [ ] PWA service worker caches static assets and model files — no dynamic data cached via SW
- [ ] `share_target` route is the sole entry point for incoming audio from the OS share sheet
- [ ] Transformers.js and ffmpeg.wasm are lazy-loaded — no static top-level imports of these libraries
- [ ] No dynamic imports outside of designated lazy-load boundaries
- [ ] IndexedDB (Dexie) access lives in `src/shared/storage/` or `features/profiles/` — nowhere else
- [ ] Squad capabilities are defined in the service layer — components never reference them directly
- [ ] No `fetch`, `XMLHttpRequest`, or WebSocket calls in component files — all network activity goes through the service layer
- [ ] Audio pipeline order is enforced: `share → audioProcessing (ffmpeg.wasm) → whisperService (Transformers.js) → reply`
- [ ] The pipeline does not run in reverse and cannot be shortcut (e.g., reply cannot call ffmpeg directly)
- [ ] Model downloads are managed by the service layer — components observe progress state only

## ❌ Red flags — auto-reject

- Feature code (components, hooks, services) defined outside `src/features/`
- Static top-level import of `@xenova/transformers` or `@ffmpeg/ffmpeg` — must be dynamic/lazy
- `fetch()` or any HTTP call inside a component file
- Dexie/IndexedDB access outside `src/shared/storage/` or `features/profiles/`
- `reply` domain triggering audio processing or invoking ffmpeg directly
- App shell (`src/app/`) containing business logic or domain state
