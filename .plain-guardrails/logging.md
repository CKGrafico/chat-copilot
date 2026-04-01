# Logging Guardrail

> Logs are for debugging the system, not recording what users said or sent.

## Checklist

- [ ] No `console.log` in production paths — debug statements removed or gated behind a dev flag
- [ ] Log levels are used correctly:
  - `debug` — dev-only, never shipped to production builds
  - `info` — lifecycle events (model loaded, feature initialized)
  - `warn` — recoverable issues (retry triggered, fallback activated)
  - `error` — requires action (initialization failed, pipeline broken)
- [ ] Structured log format: `{ event, context, timestamp }` — no free-form template strings
- [ ] Model loading progress and lifecycle events are acceptable `info` logs
- [ ] Transcription content is NEVER logged — not partial, not final, not redacted
- [ ] Audio file names, durations, or binary data are NEVER logged
- [ ] Message text, reply suggestions, and profile data are NEVER logged
- [ ] No logging calls that reference user-owned data in any form
- [ ] No logger that writes to an external service — logging is in-process only
- [ ] Logger import is consistent — one logger module, not ad-hoc console calls scattered across files
- [ ] Log context includes the feature/module name, not just a freeform string

## ❌ Red flags — auto-reject

- `console.log(transcription)` or any log of transcription output
- `console.log(audioBlob)`, `console.log(file)`, or any audio data in logs
- `console.log(profile)`, `console.log(message)`, or any user-owned data
- Any log call that sends data to a remote endpoint (fetch, beacon, etc.)
- `console.log` left in a non-test, non-dev-gated production code path
- Unstructured log strings with user data interpolated: `\`Processing: ${fileName}\``
