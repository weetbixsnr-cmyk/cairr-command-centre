# UI Rules — Command Centre Dashboard

## Design Philosophy
- Apple Store clean. No clutter. No noise.
- Mobile-first — Adam checks on his phone
- Dark theme, high contrast
- Touch targets minimum 44px

## Item States
| State | Visual | Meaning |
|-------|--------|---------|
| New/Unread | Bold text, no icon | Needs Adam's attention |
| Opened | Tick icon | Adam has seen it |
| Actioned | REMOVED | Adam dealt with it |

## Sections (top to bottom, priority order)
1. NEEDS ADAM — red accent, always visible
2. OVERDUE/ALERTS — amber accent
3. IN PROGRESS — blue accent
4. FLEET STATUS — green accent, compact table
5. UPCOMING — grey, next 7 days only

## Data Rules
- Past dates auto-remove from UPCOMING
- Completed items never appear
- Reports show as cards with expand/collapse
- Token spend shows as progress bars against budget

## Typography
- Headers: bold, large
- Body: regular, readable on mobile
- Status: emoji + short text
- No walls of text — tables and bullets only
