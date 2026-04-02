# Squad Agent Naming Policy

## Rule: Agent Roles Only — No Human Names

All squad communications (PR titles, PR bodies, PR comments, issue comments, branch names, commit messages, code comments, and squad config files) **must use agent role names only**.

### Valid Agent Names (exhaustive list)

| Role | Use This |
|------|----------|
| Coordinator | `squad` (the orchestrator) |
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

### Forbidden

- Any first-name or surname references (e.g., "Danny", "Ralph", "Reuben", "Saul", "Rusty", "Linus", "Livingston", "Basher")
- Any GitHub @mention of a human (use agent role labels instead)
- Any `@username` in PR/issue comments that refers to a human

### Enforcement

1. **Copilot** (coding agent): before posting any comment or PR body, check it contains no human names.
2. **Reviewer** (agent): reject any PR or issue comment that contains a human name — post a correction comment citing this policy.
3. **Watcher** (agent): flag any issue or PR that violates naming policy during triage.
4. **CI (optional)**: a lint script at `.squad/tools/check-agent-names.ps1` can scan PR bodies for forbidden names.

### PR/Issue Comment Template

When acting as an agent, always prefix comments with the agent role:

```
[reviewer agent] <message>
[artist agent] <message>
[asimov agent] <message>
```

Never use human names in these prefixes.
