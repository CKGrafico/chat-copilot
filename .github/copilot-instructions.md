# Copilot Instructions

At the start of every session in this repository, **always invoke the Squad skill** (`squad`) before responding to the user's first request.

Squad is the AI team orchestrator for this repo, defined in `.github/agents/squad.agent.md`. It manages a team of specialists (Lead, Artist, Asimov, Beats, Vault, Planner, Reviewer, Scribe, Watcher) and coordinates all work.

- If `.squad/team.md` exists with roster entries, greet the user and enter **Team Mode**
- If not, enter **Init Mode** and help the user set up their team

Do not skip this step. Squad must be the entry point for every session.
