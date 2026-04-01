# Error Handling Guardrail

> Every async operation is a failure waiting to happen. Catch it or explain why you didn't.

## Checklist

- [ ] All `async` functions have `try/catch` or callers handle `.catch()` — no unhandled promise rejections
- [ ] Catch bindings are typed: `catch (e: unknown)` with a type guard, never `catch (e: any)`
- [ ] User-facing errors are caught at the component boundary (error boundary or explicit handler)
- [ ] No silent failures — every `catch` block either logs or surfaces the error; empty catch blocks are banned
- [ ] Service layer errors are translated before reaching the UI — no stack traces, no internal identifiers in UI messages
- [ ] Audio processing errors (ffmpeg.wasm) have defined recovery: retry, fallback format, or user notification
- [ ] Transcription errors (Transformers.js) have defined recovery: model reload, OOM message, graceful degradation
- [ ] Model-not-loaded errors surface a human-readable message, not a raw JS exception
- [ ] Out-of-memory errors during inference are caught and handled separately from generic failures
- [ ] Retry logic (if present) has a max attempt cap and backs off — no infinite retry loops
- [ ] `finally` blocks used where cleanup is mandatory (releasing locks, resetting loading state)
- [ ] Promise.all failures are handled per-promise where partial success is valid

## ❌ Red flags — auto-reject

- `catch (e: any)` — untypable errors mask real bugs
- Empty catch block `catch (_) {}` with no log or rethrow
- Raw error objects passed to UI state (`setError(e)` without transformation)
- `console.error` as the only handling in a user-facing code path
- No error handling on ffmpeg.wasm or Transformers.js initialization
- Unhandled promise in an event handler (click, onSubmit, etc.)
