---
name: triage-sentry
description: Triage newly-seen unresolved Sentry errors for typesense-dashboard against the real source. Use when the user asks to look at, investigate, or triage current Sentry issues/errors on demand from the terminal.
---

# Triage Sentry errors (on-demand)

The terminal counterpart to the scheduled `.github/workflows/sentry-triage.yaml` job. Runs the same
triage contract locally so you can investigate Sentry errors without waiting for the cron.

## Prerequisites

- The **Sentry MCP** must be connected. If it isn't, tell the user to add the hosted server:
  `claude mcp add --transport http sentry https://mcp.sentry.dev/mcp` (OAuth on first use), or with a token
  header `--header "Sentry-Bearer: <SENTRY_AUTH_TOKEN>"`. Org `spencer-carlson`, project `typesense-dashboard`.
- `gh` authenticated (already true in this repo) for the `issues`/`full` output modes.

## How to run

1. Determine the mode from the user's request (default `report-only`):
   - `report-only` — analysis + a Sentry note only.
   - `issues` — also open a labeled GitHub issue and (if configured) notify Slack.
   - `full` — also open a **draft** fix PR for high-confidence issues.
2. Follow the triage contract in [.github/prompts/sentry-triage.md](../../../.github/prompts/sentry-triage.md)
   verbatim — scope selection (`is:unresolved firstSeen:-6h`, or a specific issue id the user names),
   de-duplication, root-cause analysis against the checked-out source at the issue's `dist` SHA, confidence
   classification, and the per-mode outputs.
3. Treat that prompt file as the single source of truth; if it changes, this skill follows it.

## Notes

- Never resolve/ignore issues or push to `main` — only comment, assign, and (in `full`) open draft PRs.
- Sentry events are scrubbed at capture, but still never echo secrets/PII into GitHub, PRs, or chat.
