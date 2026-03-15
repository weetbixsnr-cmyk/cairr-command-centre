# Mission Control Reference — Dashboard Rebuild

## What We're Doing
Rebuilding Adam's custom dashboard with features from Mission Control (open-source OpenClaw dashboard).
Keep Adam's layout. Steal their data sources and integrations.

## Key Resources
- **Mission Control repo:** https://github.com/builderz-labs/mission-control
- **YouTube demo/setup:** https://www.youtube.com/watch?v=RhLpV6QDBFE
- **OpenClaw Map listing:** https://openclawmap.com/tools/builderz-mission-control
- **Jonathan Tsai's blog (another MC user):** https://www.jontsai.com/2026/02/12/building-mission-control-for-my-ai-workforce-introducing-openclaw-command-center
- **Reddit thread:** https://www.reddit.com/r/ai_trading/comments/1rnhio0/mission_control_by_nyk_from_builderz/

## Features to Incorporate (from Mission Control)
1. **Token/cost tracking** — per-model breakdowns, trend charts (gateway API)
2. **Agent lifecycle** — status, heartbeats, register/wake/retire (gateway API)
3. **Kanban task board** — inbox → backlog → todo → in-progress → review → done
4. **Quality gates** — blocks task completion without sign-off
5. **GitHub issue sync** — pull issues into task board (`gh` CLI)
6. **Real-time updates** — WebSocket to OpenClaw gateway
7. **Cron monitoring** — show all cron jobs + last run status
8. **1Password integration** — secure credential access
9. **Inter-agent messaging** — agents can communicate via dashboard
10. **Pipeline orchestration** — workflow templates for multi-step tasks
11. **Alert system** — webhooks with retry + circuit breaker

## Tech Stack (Mission Control uses)
- Next.js + React + TypeScript
- SQLite (zero external deps)
- WebSocket + SSE for real-time
- Recharts for cost/token graphs
- pnpm for deps

## Our Existing Dashboard
- Path: was at `dashboard-secure/` (moved to command-centre workspace)
- Port: 3333
- Custom HTML — Adam's layout, action queue system

## EOS Principles to Apply
- Every task has ONE agent owner (accountability chart)
- Scorecard: 5-15 measurable numbers per agent reviewed weekly
- Kanban for task flow visibility
- Circuit breaker: agent fails 3x → stop, escalate

## Lens Gate Integration
Dashboard should show lens gate results:
- Pass/fail status per task
- Which lenses were applied
- Failure details for Brain to review

## Adam's UX Preferences (from Brain's knowledge of Adam)
1. Discord #brain = SINGLE notification channel (no WhatsApp alerts — saves tokens)
2. Morning brief: 5 lines max with 🟢🟡🔴 traffic lights
3. Visual over text — charts, colours, numbers. Not paragraphs.
4. Financial visibility on every view (dollars, not tokens)
5. Plain English alerts ("NBHW email is down" not "IMAP timeout port 993")
6. One approval path — dashboard only
7. Kill switch — one Discord message stops everything
8. Proactive overnight work (2am-6am) — show results in morning brief
9. Voice control (TTS/STT) — future enhancement
10. Calendar integration via `gog` skill — future enhancement

## GitHub Integration
- NO Claude GitHub App — duplicate spend, no customisation
- PR reviews handled by our own audit agent using lens system
- Flow: `gh pr list` → read diff → run through lenses → `gh pr review`
- Models: Opus for V3DN (live money), Sonnet for all other repos

## Architecture Research
Full research: `/Users/cairr/.openclaw/workspace/self-improvement/research-agent-architecture-2026-03-10.md`
