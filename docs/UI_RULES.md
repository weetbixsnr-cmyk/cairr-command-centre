# UI Rules - Command Centre Dashboard

## Design Philosophy
- Mobile-first. Adam checks this on his phone.
- Dark theme, high contrast.
- Keep the dashboard focused on decisions, blockers, and next actions.
- Do not rebuild the dashboard UI from scratch without explicit approval.

## Item States
| State | Meaning |
| --- | --- |
| Pending | Needs Adam's attention |
| Blocked | External dependency or access issue |
| Manual | Status is maintained in `public/data/*.json` |
| Completed | Removed from active dashboard view |

## Sections
1. Project status
2. Blockers
3. Action queue
4. BTS SEO status
5. NBHW SEO status
6. Parked diagnostics, if retained during cleanup

## Data Rules
- Active data comes from `public/data/bts-status.json`, `public/data/nbhw-status.json`, and `public/data/dashboard-status.json`.
- `public/snapshot.json` is legacy agent-era data and must not be reintroduced as an active source.
- Completed action items should not stay in active views.
- Hooks are deferred until project-owned status file contracts are agreed.

## Design Lock
The design lock is resolved: keep the existing dashboard layout and page sequence intact.

Do not change structure, navigation order, or visual layout during de-agenting. Update the data flowing into the existing UI shell from `public/data/*.json`.

`public/dashboard.html` remains a historical local reference. Future layout or styling changes require explicit approval.
