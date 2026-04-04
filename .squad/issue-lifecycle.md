# Issue Lifecycle

Reference for the issue-to-merge workflow used by Squad.

## Branch Naming

```
squad/{issue-number}-{kebab-case-slug}
```

Example: `squad/42-fix-login-validation`

## Issue Labels

- `squad` - Issue is in Squad backlog
- `squad:{member}` - Assigned to specific agent
- `squad:untriaged` - Needs triage
- `priority:p{N}` - Priority level (0=critical, 1=high, 2=medium, 3=low)

## Lifecycle: Issue -> Branch -> PR -> Merge

### 1. Triage

Watcher detects untriaged issues. Lead or Watcher reads `.squad/routing.md`, applies `squad:{member}` label, transitions issue to `assigned`.

### 2. Branch Creation

Agent accepts assignment, creates feature branch from latest main:

```bash
git checkout main && git pull && git checkout -b squad/{issue-number}-{slug}
```

### 3. Implementation & Commit

Agent makes changes, commits referencing the issue:

```
{type}({scope}): {description} (#{issue-number})

Closes #{issue-number}

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
```

Commit types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `perf`

### 4. PR Creation

```bash
gh pr create --title "{title}" \
  --body "Closes #{issue-number}\n\n{description}" \
  --head squad/{issue-number}-{slug} \
  --base main
```

PR description template:

```markdown
Closes #{issue-number}

## Summary
{what changed}

## Changes
- {change 1}
- {change 2}

## Testing
{how this was tested}

Working as {member} ({role})
```

### 5. PR Review

**Reviewer MUST post findings as inline GitHub PR comments** (not chat text):

```powershell
gh api repos/{owner}/{repo}/pulls/{PR_NUMBER}/reviews `
  --method POST `
  --field body="Overall verdict" `
  --field event="COMMENT" `
  --field "comments[][path]=src/path/to/file.ts" `
  --field "comments[][line]=42" `
  --field "comments[][body]=🔴 BLOCKER: Description and fix"
```

Severity: 🔴 BLOCKER (must fix) / 🟡 WARNING (should fix) / 🔵 MINOR (nice to have)

When changes are requested:
1. Agent addresses feedback in a new commit
2. Pushes updates
3. Posts reply comment confirming what was addressed

### 6. Merge

```bash
gh pr merge {pr-number} --squash --delete-branch
```

Post-merge: issue auto-closes (via `Closes #N`), branch is deleted, `git checkout main && git pull`.

### 7. Review Rules

- **Rejection lockout:** If Reviewer rejects a PR, the original author cannot re-work it. A different agent fixes the issues.
- **Conflict of interest:** PR author cannot review their own PR.

## Anti-Patterns

- Creating branches without linking to an issue
- Committing without issue reference
- Opening PRs without `Closes #N`
- Merging before CI passes
- Leaving feature branches after merge
