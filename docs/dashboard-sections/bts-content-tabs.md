# Render Contract: BTS Content Tabs

> How content.json feeds 3 BTS dashboard tabs.
> Source contract: see BTS `docs/dashboard-sections/content-lifecycle.md`
> Last verified: 2026-05-24

## Data File

`public/data/bts/content.json`

Imported from BTS repo via manual copy. See BTS source contract for schema and update procedure.

---

## Tab 1: Future Posts

### Dashboard Tab
`future-posts` (tab 10 of 13 on `/bts-seo`)

### Reader Function
`lib/dashboard-data.js` → `buildDraftsFromContent()`

### Expected JSON Shape

Input: `content.json` items array.

Output (`snapshot.btsDrafts`):
```json
{
  "source": "content.json",
  "drafts": [
    {
      "id": "blog-16-maidenhead",
      "title": "Gas and Plumbing Training Near Maidenhead",
      "type": "location",
      "content": "full markdown content or excerpt",
      "status": "draft",
      "batch": "4B",
      "service": "Multi-service",
      "sourceFile": "content/pending-drafts/blog-16-location-maidenhead.md"
    }
  ]
}
```

### Filter Logic
- `buildDraftsFromContent()` excludes items where status is `published`, `held`, or `reference`
- Page `bts-seo.js` further filters: excludes `type === 'gbp'` (GBP drafts show on GBP Posts tab instead)
- Also excludes `status === 'signed-off'`

### Fallback Behaviour
If no non-published items exist, shows empty state with "no drafts" message.

### UI Notes
- Displays full `content` field in expandable preview
- Shows type badge (blog, location, news)
- Draft approval buttons (approve/reject) if Adam is logged in

---

## Tab 2: GBP Posts

### Dashboard Tab
`gbp-posts` (tab 9 of 13 on `/bts-seo`)

### Reader Function
Uses `snapshot.btsDrafts.drafts` filtered by `type === 'gbp'` in `bts-seo.js` (lines 1274-1280).

### Expected JSON Shape

Same as Future Posts output, but filtered to GBP items only:
```json
{
  "id": "gbp-07-career-change",
  "title": "GBP: Career Change Into Gas Engineering",
  "type": "gbp",
  "content": "full post content",
  "status": "draft"
}
```

### Filter Logic
- Draft GBP: `type === 'gbp'` AND status not in `['signed-off', 'published']`
- Live GBP: `type === 'gbp'` AND status in `['signed-off', 'published']`

### Fallback Behaviour
Empty list if no GBP items in content.json.

### UI Notes
- Uses `GbpPosts` component (`pages/components/gbp-posts.js`)
- Displays `editedContent || content` for each post
- Separate sections for draft and live GBP posts

---

## Tab 3: Google Safety (Publish Ledger)

### Dashboard Tab
`safety` (tab 6 of 13 on `/bts-seo`)

The publish ledger also renders as a safety strip at the top of every tab.

### Reader Function
`lib/dashboard-data.js` → `buildPublishLedgerFromContent()`

### Expected JSON Shape

Output (`snapshot.btsPublishLedger`):
```json
{
  "source": "content.json",
  "status": "green",
  "totalBlogs": 14,
  "totalNews": 5,
  "totalPages": 29,
  "weeklyBlogLimit": 3,
  "weeklyNewsLimit": 1,
  "weeklyLocationLimit": 1,
  "weeklyGbpLimit": 3,
  "last7d": {
    "blog": 0,
    "news": 0,
    "location": 0,
    "gbp": 0,
    "total": 0
  },
  "last30d": {
    "blog": 2,
    "news": 1,
    "location": 1,
    "gbp": 0,
    "total": 4
  },
  "entries": []
}
```

### Filter Logic
- Counts all published items by type
- Calculates last 7-day and 30-day publish rates from `publishedAt` dates
- Compares against weekly limits to determine safety status

### Fallback Behaviour
If content.json is missing or empty, safety strip shows 0/0/0 counts with "safe" status.

### UI Notes
- Safety strip shows coloured gauges: green (under limit), amber (near limit), red (over limit)
- Per-type limits: blog/3 per week, news/1, location/1, GBP/3
- Designed to prevent Google penalties from publishing too fast

---

## Source Doc

See BTS `docs/dashboard-sections/content-lifecycle.md` for schema, update procedure, and ownership rules.
