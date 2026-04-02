# Copilot Coding Agent — Squad Instructions

You are working on a project that uses **Squad**, an AI team framework. When picking up issues autonomously, follow these guidelines.

## Team Context

Before starting work on any issue:

1. Read `.squad/team.md` for the team roster, member roles, and your capability profile.
2. Read `.squad/routing.md` for work routing rules.
3. If the issue has a `squad:{member}` label, read that member's charter at `.squad/agents/{member}/charter.md` to understand their domain expertise and coding style — work in their voice.

## Capability Self-Check

Before starting work, check your capability profile in `.squad/team.md` under the **Coding Agent → Capabilities** section.

- **🟢 Good fit** — proceed autonomously.
- **🟡 Needs review** — proceed, but note in the PR description that a squad member should review.
- **🔴 Not suitable** — do NOT start work. Instead, comment on the issue:
  ```
  🤖 This issue doesn't match my capability profile (reason: {why}). Suggesting reassignment to a squad member.
  ```

## Branch Naming

Use the squad branch convention:
```
squad/{issue-number}-{kebab-case-slug}
```
Example: `squad/42-fix-login-validation`

## PR Guidelines

When opening a PR:
- Reference the issue: `Closes #{issue-number}`
- If the issue had a `squad:{member}` label, mention the member by **role only**: `Working as {role}` (e.g., `Working as artist`, `Working as asimov`)
- If this is a 🟡 needs-review task, add to the PR description: `⚠️ This task was flagged as "needs review" — reviewer agent must review before merging.`
- Follow any project conventions in `.squad/decisions.md`

## ⚠️ Agent Naming Policy (MANDATORY)

**Never use human names** in any PR, issue comment, commit message, branch name, or squad config.

Only use these agent role names:
`lead`, `artist`, `asimov`, `beats`, `vault`, `planner`, `reviewer`, `scribe`, `watcher`, `copilot`, `squad`

Before posting any comment or PR body, run:
```powershell
.\.squad\tools\check-agent-names.ps1 -Text "your text"
```

See `.squad/agent-naming-policy.md` for the full policy.

## Reviewer Gate (MANDATORY)

**Do NOT merge a PR without reviewer agent feedback posted to the issue.**

Workflow:
1. Developer agent implements → opens PR
2. Reviewer agent reviews PR → posts findings to the linked issue as `[reviewer agent] ...`
3. Developer agent applies feedback → updates PR
4. Reviewer agent approves → PR is merged

## Decisions

If you make a decision that affects other team members, write it to:
```
.squad/decisions/inbox/copilot-{brief-slug}.md
```
The Scribe will merge it into the shared decisions file.
