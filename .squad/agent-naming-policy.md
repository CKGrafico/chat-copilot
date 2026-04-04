# Agent Naming Policy

All squad communications (PRs, issues, commits, branch names, code comments) **must use agent role names only**. No human names.

## Valid Names

| Role | Name |
|------|------|
| Coordinator | `squad` |
| Tech Lead | `lead` |
| Frontend Dev | `artist` |
| AI/Inference | `asimov` |
| Audio/DSP | `beats` |
| Storage/SW | `vault` |
| Backlog/Planning | `planner` |
| Code Review | `reviewer` |
| Session Logger | `scribe` |
| Issue Monitor | `watcher` |
| Coding Agent | `copilot` |

## Rules

- No human first names, surnames, or `@username` mentions in automated content
- Prefix agent comments with the role: `[reviewer agent] ...`
- Reviewer rejects any PR or comment that contains a human name
- CI lint script: `.squad/tools/check-agent-names.ps1`
