# Domain-Driven Design Guardrail

> Each domain owns its language, its types, and its logic. No borrowing, no shortcuts.

## Checklist

- [ ] The four domains are: `share`, `transcription`, `reply`, `profiles` — no new domains without team decision
- [ ] Each domain owns its `types.ts` — types are not borrowed across feature folders
- [ ] Domain events and data flow via `src/shared/` — not through direct cross-feature calls
- [ ] Ubiquitous language is enforced in code and comments:
  - "audio" not "file" when referring to WhatsApp audio input
  - "transcription" not "result", "text", or "output"
  - "reply suggestion" not "answer", "response", or "completion"
  - "profile" not "user", "persona", or "contact"
- [ ] Service files contain domain logic — they are not thin wrappers or CRUD repositories
- [ ] No anemic domain models — logic lives in service files, not scattered across component event handlers
- [ ] Squad capabilities map 1:1 to domain operations:
  - `transcribeAudio` → `transcription` domain only
  - `generateReply` → `reply` domain only
- [ ] Domain types are not re-exported from `src/shared/` as if they were shared — each domain's types stay in its folder
- [ ] Naming in code matches naming in issues and documentation — no synonym drift

## ❌ Red flags — auto-reject

- `import { TranscriptionResult } from '../../share/types'` — types must not cross domain boundaries
- Using "user" instead of "profile", "response" instead of "reply suggestion" in new code or interfaces
- Squad capability (`transcribeAudio`, `generateReply`) called outside its owning domain's service layer
- Business logic for transcription implemented inside the `reply` domain (or any similar domain leak)
- An empty service file that only delegates — logic must live there, not in the component
