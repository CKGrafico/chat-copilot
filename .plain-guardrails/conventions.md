# Conventions Guardrail

> Consistency is not optional. Every deviation is a future maintainer's tax.

## Checklist

- [ ] No `any` — TypeScript strict mode means what it says
- [ ] `as unknown as X` casts include an inline comment explaining why the cast is necessary
- [ ] No `@ts-ignore` without a justification comment on the same line
- [ ] File names: camelCase for non-component files (`whisperService.ts`, `useTranscription.ts`)
- [ ] File names: PascalCase for component files (`TranscriptionPanel.tsx`, `ReplyCard.tsx`)
- [ ] Exports: named exports everywhere except route-level components (default export only for routes)
- [ ] No magic strings — use enums or `const` maps for repeated string values
- [ ] `async/await` used throughout — no `.then()` chains in new code
- [ ] Props interfaces are explicitly typed with a named interface, not an inline anonymous type
- [ ] One component per file — no multi-component files
- [ ] No commented-out code in the PR diff — remove it or open an issue
- [ ] Branch name follows `squad/{issue-number}-{slug}` format
- [ ] No unused imports left in the file

## ❌ Red flags — auto-reject

- `catch (e: any)` or any `any` in new code without explicit override justification
- `@ts-ignore` with no comment
- `.then(x => ...).catch(...)` chain where `async/await` is viable
- Inline anonymous prop types: `function Foo({ bar }: { bar: string })` (use a named interface)
- Multiple components exported from a single `.tsx` file
- Commented-out code blocks in the diff
- Branch name not matching `squad/{issue-number}-{slug}`
