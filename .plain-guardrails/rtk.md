# RTK Usage Guardrail

> RTK is a CLI proxy, not a library. It has no place in application code.

## Checklist

- [ ] RTK (`C:\Projects\_clis\rtk.exe`) is a CLI token-compression proxy — it is NOT an npm package
- [ ] RTK is used by agents at the command line only: `rtk git status`, `rtk npm run build`
- [ ] No `import rtk` anywhere in the codebase
- [ ] No `require('rtk')` anywhere in the codebase
- [ ] RTK does not appear in `package.json` (dependencies, devDependencies, or scripts)
- [ ] RTK does not appear in any `tsconfig.json` paths or aliases
- [ ] RTK references in documentation are limited to: `CLAUDE.md`, `.squad/` docs, agent instructions
- [ ] RTK is never referenced in `src/` — it has zero presence in application code
- [ ] If RTK appears in a PR diff outside of agent/doc files, it is a bug — flag immediately

## ❌ Red flags — auto-reject

- `import rtk from 'rtk'` or any variant of RTK import in application source
- `require('rtk')` in any `.ts`, `.tsx`, `.js`, or `.mjs` file under `src/`
- RTK listed in `package.json` under any dependency key
- Any `src/` file referencing RTK as a module, type, or value
- RTK appearing in Vite config, tsconfig paths, or any build tool configuration
