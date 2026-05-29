import fs from 'fs'
import path from 'path'

const DATA_DIR = path.resolve(process.cwd(), 'public', 'data')

function readJson(filename, fallback) {
  try {
    const filePath = path.join(DATA_DIR, filename)
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function readContentJson() {
  return readJson('bts/content.json', { items: [] })
}

function readSeoJson() {
  return readJson('bts/seo.json', null)
}

function readNewsBankJson() {
  return readJson('bts/news-bank.json', null)
}

function readReadinessJson() {
  return readJson('bts/readiness.json', null)
}

function isPlaceholderContent(item, content) {
  const text = `${item?.status || ''} ${item?.title || ''} ${item?.previewText || ''} ${item?.excerpt || ''} ${content || ''}`.toLowerCase()
  return text.includes('placeholder') || text.includes('awaiting content') || text.includes('content to be drafted')
}

function buildDraftsFromContent(contentData, statusDrafts) {
  const items = contentData?.items || []
  const statusMap = new Map()
  ;(statusDrafts?.drafts || []).forEach(d => statusMap.set(d.id, d))
  const drafts = items
    .filter(i => !['published', 'held', 'reference'].includes(i.status))
    .map(i => {
      let sd = statusMap.get(i.id)
      if (!sd) {
        for (const d of statusMap.values()) {
          if (d.title === i.title && d.type === i.type) { sd = d; break }
        }
      }
      // content.json is the BTS source of truth; bts-status.json (sd) is a
      // legacy full-copy used only to enrich. Prefer content.json fields.
      const resolvedContent = i.content || sd?.content || i.previewText || i.excerpt || ''
      const hasFullText = !!((i.content && i.content.length > 100) || (sd?.content && sd.content.length > 100))
      return {
        id: i.id,
        title: i.title,
        type: i.type,
        status: i.status,
        content: resolvedContent,
        hasFullText,
        placeholder: isPlaceholderContent(i, resolvedContent),
        author: sd?.author || 'BTS content lifecycle',
        createdAt: i.publishedAt || sd?.createdAt || null,
        batch: i.batch || null,
        sourceFile: i.sourceFile || null,
        reviewUrl: i.reviewUrl || null,
        service: i.service || null,
        reviewGroup: i.reviewGroup || sd?.reviewGroup || null,
        priority: i.priority || sd?.priority || null,
        qaSummary: sd?.qaSummary || null,
        targetDate: sd?.targetDate || null,
        editedContent: sd?.editedContent || null,
        editedBy: sd?.editedBy || null,
        approvedAt: sd?.approvedAt || null,
        feedback: sd?.feedback || null
      }
    })
    .filter(i => !i.placeholder)
  return { source: 'content.json + bts-status.json legacy full-copy', drafts }
}

function buildBlogInventoryFromContent(contentData) {
  const items = contentData?.items || []
  const publishedBlogs = items.filter(i => i.status === 'published' && !['news', 'gbp'].includes(i.type))
  const publishedNews = items.filter(i => i.status === 'published' && i.type === 'news')
  const publishedGbp = items.filter(i => i.status === 'published' && i.type === 'gbp')
  const pending = items.filter(i => ['draft', 'approved'].includes(i.status))
  const held = items.filter(i => i.status === 'held')

  return {
    source: 'content.json',
    published: publishedBlogs.length,
    drafts: pending.length,
    pendingDraftAssets: pending.length + held.length,
    newsInsightsPublished: publishedNews.length,
    gbpPostsPublished: publishedGbp.length,
    livePages: publishedBlogs.length + publishedNews.length,
    planned: items.map(i => ({
      id: i.id,
      title: i.title,
      service: i.service,
      status: i.status,
      location: i.type === 'location' ? i.title.replace(/^.*Near /, '') : null,
      wave: i.batch
    })),
    news: publishedNews.map(i => ({ id: i.id, title: i.title, status: i.status }))
  }
}

function buildPublishLedgerFromContent(contentData) {
  const items = contentData?.items || []
  const published = items.filter(i => i.publishedAt)
  const last7d = new Date(Date.now() - 7 * 86400000)
  const last30d = new Date(Date.now() - 30 * 86400000)
  const recent7 = published.filter(i => new Date(i.publishedAt) >= last7d)
  const recent30 = published.filter(i => new Date(i.publishedAt) >= last30d)

  return {
    status: 'green',
    statusLabel: `${published.length} items published`,
    source: 'content.json',
    entries: published.map(i => ({
      slug: i.url ? i.url.replace(/^\/|\/$/g, '') : i.id,
      title: i.title,
      type: i.type,
      url: i.url,
      firstPublished: i.publishedAt,
      wpId: i.wpId
    })),
    totalPages: published.filter(i => !['gbp'].includes(i.type)).length,
    totalBlogs: published.filter(i => ['blog', 'location'].includes(i.type)).length,
    totalNews: published.filter(i => i.type === 'news').length,
    last7d: {
      blogs: recent7.filter(i => i.type === 'blog').length,
      locations: recent7.filter(i => i.type === 'location').length,
      topics: recent7.filter(i => i.type === 'topic').length,
      news: recent7.filter(i => i.type === 'news').length,
      gbp: recent7.filter(i => i.type === 'gbp').length,
      pages: 0,
      total: recent7.length
    },
    last30d: {
      blogs: recent30.filter(i => i.type === 'blog').length,
      locations: recent30.filter(i => i.type === 'location').length,
      topics: recent30.filter(i => i.type === 'topic').length,
      news: recent30.filter(i => i.type === 'news').length,
      gbp: recent30.filter(i => i.type === 'gbp').length,
      pages: 0,
      total: recent30.length
    },
    weeklyBlogLimit: 3,
    weeklyNewsLimit: 1,
    weeklyGbpLimit: 3,
    weeklyLocationLimit: 1
  }
}

function projectSummary(status) {
  return {
    id: status.id,
    name: status.name,
    label: status.label || status.name,
    href: status.href || '/',
    status: status.status || 'unknown',
    statusLabel: status.statusLabel || status.status || 'Unknown',
    lastUpdated: status.lastUpdated || null,
    source: status.source || 'public/data',
    summary: status.summary || '',
    metrics: status.metrics || [],
    blockers: status.blockers || [],
    nextActions: status.nextActions || []
  }
}

function metricValue(status, label) {
  const metric = (status?.metrics || []).find(item => item.label === label)
  return metric?.value ?? null
}

function statusLines(status) {
  return [
    `**Status:** ${status.statusLabel || status.status || 'Manual status'}`,
    status.summary || '',
    ...(status.metrics || []).map(metric => `- **${metric.label}:** ${metric.value}${metric.unit || ''}`),
    ...(status.blockers || []).map(item => `🔴 ${item}`),
    ...(status.nextActions || []).map(item => `- [ ] ${item}`)
  ].filter(Boolean)
}

function buildSeoAudit(status) {
  const seo = status?.seo || {}
  if (!status || seo.healthScore == null) return status?.seoAudit || null

  return {
    timestamp: seo.lastUpdated || status.lastUpdated || null,
    source: seo.source || status.source || 'manual-status-json',
    healthScore: seo.healthScore,
    healthBreakdown: seo.healthBreakdown || {},
    healthScan: seo.healthScan || null,
    geoScore: seo.geoReadiness,
    geoBreakdown: seo.geoBreakdown || {},
    crawlers: seo.crawlers || [],
    schema: seo.schema || { implemented: [], missing: [], deprecated: [] },
    actions: seo.actions || (status.blockers || []).map((title, index) => ({
      severity: index === 0 ? 'critical' : 'high',
      title
    })),
    history: seo.history || [{
      timestamp: seo.lastUpdated || status.lastUpdated || null,
      healthScore: seo.healthScore,
      geoScore: seo.geoReadiness
    }],
    updatedAt: seo.lastUpdated || status.lastUpdated || null
  }
}

function publishHistoryLines(status) {
  const batch = status?.publishedBatch
  if (!batch?.items?.length) return ['No publish history recorded in manual status JSON.']

  return [
    `**Batch ${batch.batch} published:** ${batch.publishedDate}`,
    ...(batch.items || []).map(item => `- ${item.type}: ${item.title}${item.url ? ` (${item.url})` : ''}`)
  ]
}

function newsBankFromStatus(status) {
  const publishedStories = (status?.publishedBatch?.items || [])
    .filter(item => item.type === 'news')
    .map(item => ({
      type: 'news',
      title: item.title,
      status: 'published',
      publishedAt: status.publishedBatch.publishedDate,
      url: item.url,
      category: 'News/insights'
    }))

  const inventoryNews = (status?.blogInventory?.news || []).map(item => ({
    type: 'news',
    title: item.title,
    status: item.status || 'available',
    category: 'News/insights'
  }))

  if (status?.newsBank?.stories) return status.newsBank

  const seoBank = status?.seo?.newsBank
  if (seoBank && seoBank.total) {
    const knownStories = [...publishedStories, ...inventoryNews]
    return {
      stories: knownStories,
      total: seoBank.total,
      available: seoBank.available,
      drafted: seoBank.drafted,
      published: seoBank.published
    }
  }

  return { stories: publishedStories }
}

function competitorLines(status) {
  const competitors = status?.competitors?.competitors || status?.seo?.competitors || []
  if (!competitors.length) return ['No competitor source data recorded in manual status JSON.']

  return competitors.map(item => `- ${item.name}: ${item.threat || item.position || 'tracked'}`)
}

function weeklyAuditLines(status) {
  return [
    `**Source:** ${status?.source || 'manual-status-json'}`,
    `**Last updated:** ${status?.lastUpdated || 'not recorded'}`,
    ...(status?.blockers || []).map(item => `- [ ] ${item}`),
    ...(status?.nextActions || []).map(item => `- [ ] ${item}`)
  ]
}

function buildSeoDash(status) {
  if (!status) return null

  const sections = {
    'plan-overview': {
      title: 'Manual Status Overview',
      lines: statusLines(status)
    },
    'critical-fixes': {
      title: 'Current Blockers',
      lines: (status.blockers || []).length > 0
        ? (status.blockers || []).map(item => `🔴 ${item}`)
        : ['No blockers recorded.']
    },
    'content-pipeline': {
      title: 'Next Actions',
      lines: (status.nextActions || []).length > 0
        ? (status.nextActions || []).map(item => `- [ ] ${item}`)
        : ['No next actions recorded.']
    },
    'publish-history': {
      title: 'Publish History',
      lines: publishHistoryLines(status)
    },
    'news-bank': {
      title: 'News Bank',
      lines: newsBankFromStatus(status).stories.length > 0
        ? newsBankFromStatus(status).stories.map(item => `- ${item.status}: ${item.title}`)
        : ['No news-bank source data recorded in manual status JSON.']
    },
    'competitor-watch': {
      title: 'Competitor Watch',
      lines: competitorLines(status)
    },
    'weekly-audit-log': {
      title: 'Weekly Audit Log',
      lines: weeklyAuditLines(status)
    }
  }

  if (status.seo?.locationCoverage || status.seo?.suburbCoverage) {
    const coverage = status.seo.locationCoverage || status.seo.suburbCoverage
    const summary = coverage.summary || {}
    sections['coverage-matrix'] = {
      title: 'Manual Coverage Summary',
      lines: [
        ...Object.entries(summary).map(([key, value]) => `- **${key}:** ${value}`),
        ...(coverage.waves || []).map(wave => `- Wave ${wave.id}: ${wave.status} · ${wave.servicePages || 0}/${wave.servicePagesTotal || 0} pages · ${wave.blogs || 0} blogs`)
      ]
    }
  }

  return {
    lastUpdated: status.seo?.lastUpdated || status.lastUpdated || null,
    source: status.source || 'manual-status-json',
    sections,
    newsBank: newsBankFromStatus(status)
  }
}

function buildPublishLedger(status) {
  const batch = status?.publishedBatch
  if (!status || !batch) return status?.publishLedger || buildEmptyPublishLedger(status)

  const blogs = batch.items?.filter(item => item.type === 'blog').length || 0
  const news = batch.items?.filter(item => item.type === 'news').length || 0
  const entries = (batch.items || []).map(item => ({
    title: item.title,
    type: item.type,
    url: item.url,
    firstPublished: batch.publishedDate,
    sourceCommit: batch.sourceCommit
  }))

  return {
    status: 'green',
    statusLabel: `Batch ${batch.batch} published ${batch.publishedDate}`,
    last7d: {
      blogs,
      gbp: 0,
      news,
      pages: 0
    },
    last30d: {
      blogs,
      gbp: 0,
      news,
      pages: 0,
      total: entries.length
    },
    weeklyBlogLimit: 3,
    weeklyGbpLimit: 3,
    weeklyNewsLimit: 1,
    weeklyPageLimit: 3,
    entries,
    publishedBatch: {
      batch: batch.batch,
      publishedDate: batch.publishedDate,
      blogs,
      news
    }
  }
}

function buildEmptyPublishLedger(status) {
  if (!status) return null

  const pages = Number(status.live?.totalSuburbPages || status.seo?.suburbCoverage?.summary?.servicePages || status.seo?.locationCoverage?.summary?.servicePages || 0)
  const blogs = Number(status.live?.totalBlogPages || status.blogInventory?.published || status.seo?.blogsPublished || 0)

  return {
    status: 'green',
    statusLabel: 'Manual status: no publish ledger entries recorded',
    last7d: { total: 0, pages: 0, blogs: 0, gbp: 0, news: 0 },
    last30d: { total: 0, pages: 0, blogs: 0, gbp: 0, news: 0 },
    weeklyPageLimit: 3,
    weeklyBlogLimit: 3,
    weeklyGbpLimit: 3,
    weeklyNewsLimit: 1,
    pagesRemaining: 3,
    totalPages: pages,
    totalBlogs: blogs,
    entries: [],
    source: status.source || 'manual-status-json'
  }
}

function buildPublishLog(status) {
  if (status?.publishLog) return status.publishLog

  return {
    source: status?.source || 'manual-status-json',
    sourceNote: 'Manual status JSON does not contain publish-log entries.',
    entries: []
  }
}

function normalizeBlogInventory(status) {
  const inventory = status?.blogInventory || null
  if (!inventory) return null
  return {
    ...inventory,
    drafts: inventory.drafts ?? inventory.pendingDraftAssets ?? status?.seo?.pendingDraftAssets ?? 0,
    planned: inventory.planned || []
  }
}

function normalizeKeywords(status, keywordKey = 'locationKeywords') {
  const existing = status?.keywords || {}
  const seoKeywords = [
    ...(status?.seo?.coreKeywords || []),
    ...(status?.seo?.[keywordKey] || [])
  ]

  const keywords = existing.keywords || seoKeywords.map(item => ({
    keyword: item.keyword,
    baseline: item.baseline ?? null,
    latest: item.latest ?? item.position ?? null,
    section: item.section || item.status || null,
    url: item.url || null
  }))

  return {
    lastUpdated: existing.lastUpdated || status?.seo?.lastUpdated || status?.lastUpdated || null,
    source: existing.source || status?.source || 'manual-status-json',
    keywords,
    top10: existing.top10 || keywords.filter(item => item.latest != null && item.latest <= 10),
    campaigns: existing.campaigns || [],
    rankingScan: existing.rankingScan || null
  }
}

function buildSeoPlan(status, coverageKey = 'locationCoverage') {
  if (status?.seoPlan) return status.seoPlan

  const coverage = status?.seo?.[coverageKey]
  if (!coverage) return null

  const waves = coverage.waves || []
  const items = waves.flatMap(wave => wave.locations || wave.suburbs || [])

  return {
    source: status.source || 'manual-status-json',
    services: status.seo?.assets?.trainingServices
      ? Array.from({ length: status.seo.assets.trainingServices }, (_, index) => `Training service ${index + 1}`)
      : [],
    locations: {
      total: coverage.summary?.totalLocations || coverage.summary?.totalSuburbs || items.length,
      tier1: items.slice(0, 6),
      tier2: items.slice(6, 12),
      tier3: items.slice(12, 18),
      tier4: items.slice(18)
    },
    contentGaps: (status.blockers || []).map((item, index) => ({
      priority: index + 1,
      gap: item,
      note: 'From manual status blocker'
    }))
  }
}

function buildCompetitors(status) {
  if (status?.competitors) return status.competitors

  const competitors = status?.seo?.competitors || []
  return {
    competitors,
    keyGaps: [],
    scanStatus: competitors.length ? 'manual' : 'manual-source-missing',
    updatedAt: status?.lastUpdated || null,
    source: status?.source || 'manual-status-json',
    sourceNote: competitors.length
      ? 'Derived from seo.competitors in manual status JSON.'
      : 'Manual status JSON does not contain competitor detail data.'
  }
}

function buildCompetitorPages(status) {
  if (status?.competitorPages) return status.competitorPages

  const livePages = Number(status?.seo?.pagesLive || status?.blogInventory?.livePages || metricValue(status, 'Live pages') || 0)
  const blogs = Number(status?.seo?.blogsPublished || status?.blogInventory?.published || metricValue(status, 'Blogs live') || 0)
  if (!livePages && !blogs) return null

  return {
    source: status?.source || 'manual-status-json',
    competitors: [{
      name: status?.label || status?.name || 'Current site',
      ours: true,
      site: Math.max(livePages - blogs, 0),
      courses: status?.seo?.assets?.trainingServices || 0,
      blogs,
      total: livePages
    }]
  }
}

function buildCourseDetails(status) {
  if (status?.courseDetails) return status.courseDetails

  const total = status?.seo?.assets?.trainingServices || 0
  if (!total) return null

  return {
    source: status.source || 'manual-status-json',
    sourceNote: 'Manual status JSON only records the count of training services, not individual course details.',
    summary: {
      live: total,
      confirmed: 0,
      missingInfo: total,
      broken: 0,
      noPage: 0
    },
    courses: Array.from({ length: total }, (_, index) => ({
      name: `Training service ${index + 1}`,
      duration: 'Not recorded in manual status JSON',
      price: 'Not recorded in manual status JSON',
      status: 'missing-info',
      confirmed: false
    }))
  }
}

function buildCourses(status) {
  if (status?.courses) return status.courses
  return {
    issues: status?.blockers || []
  }
}

function buildTraffic(status, gaPropertyId) {
  if (status?.traffic) return status.traffic

  return {
    period: 'Last 30 Days',
    source: status?.source || 'manual-status-json',
    sourceNote: 'Manual status JSON does not contain traffic or conversion metrics.',
    gaPropertyId,
    totals: {},
    pages: [],
    monthly: {}
  }
}

function buildDrafts(status) {
  if (status?.drafts?.drafts?.length) {
    return {
      ...status.drafts,
      drafts: status.drafts.drafts.filter(draft => draft?.activePipeline !== false)
    }
  }

  const pending = Number(status?.seo?.pendingDraftAssets || status?.blogInventory?.pendingDraftAssets || metricValue(status, 'Pending draft assets') || 0)
  if (!pending) return status?.drafts || { drafts: [] }

  return {
    source: status.source || 'manual-status-json',
    sourceNote: 'Manual status JSON records the pending draft count, but not individual draft titles/content.',
    drafts: Array.from({ length: pending }, (_, index) => ({
      id: `manual-pending-draft-${index + 1}`,
      title: `Pending draft asset ${index + 1}`,
      type: 'blog',
      status: 'draft',
      content: 'Draft title and content not recorded in manual status JSON.',
      author: 'Manual status JSON',
      createdAt: status.lastUpdated || null
    }))
  }
}

function buildLive(status) {
  const live = status?.live || {}
  const coverage = status?.seo?.suburbCoverage || status?.seo?.locationCoverage

  return {
    ...live,
    totalSuburbPages: live.totalSuburbPages ?? coverage?.summary?.servicePages ?? status?.seo?.pagesLive ?? 0,
    totalBlogPages: live.totalBlogPages ?? status?.blogInventory?.published ?? status?.seo?.blogsPublished ?? 0,
    source: live.source || status?.source || 'manual-status-json'
  }
}

export function buildDashboardSnapshot() {
  const bts = readJson('bts-status.json', null)
  const btsSeoFile = readSeoJson()
  const btsWithSeo = btsSeoFile ? { ...bts, ...btsSeoFile } : bts
  const nbhw = readJson('nbhw-status.json', null)
  const dashboard = readJson('dashboard-status.json', null)
  const btsContent = readContentJson()
  const btsNewsBankFile = readNewsBankJson()
  const btsReadiness = readReadinessJson()

  const statuses = [bts, nbhw, dashboard].filter(Boolean)
  const timestamp = statuses
    .map(s => s.lastUpdated)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || new Date().toISOString()

  const actionItems = dashboard?.actionQueue?.items || []
  const pendingItems = actionItems.filter(i => i.status === 'pending')
  const overdueItems = pendingItems.filter(i => i.due_date && new Date(i.due_date) < new Date())
  const highPriority = pendingItems.filter(i => i.priority === 'high')

  const useContentJson = btsContent?.items?.length > 0

  return {
    timestamp,
    dataSource: {
      mode: 'bts-split-json-snapshots',
      directory: 'public/data',
      files: ['bts-status.json', 'nbhw-status.json', 'dashboard-status.json', 'bts/content.json', 'bts/seo.json', 'bts/news-bank.json', 'bts/readiness.json'],
      contentJsonActive: useContentJson,
      agentSnapshot: false,
      openclawCli: false
    },
    projects: statuses.map(projectSummary),
    actionQueue: {
      items: actionItems.map(item => ({
        ...item,
        overdue: item.due_date ? new Date(item.due_date) < new Date() && item.status === 'pending' : false
      })),
      pending: pendingItems.length,
      overdueCount: overdueItems.length,
      highPriority: highPriority.length
    },
    btsStatus: bts,
    btsContent: useContentJson ? btsContent : null,
    btsSeo: btsWithSeo?.seo || null,
    btsKeywords: btsWithSeo ? normalizeKeywords(btsWithSeo, 'locationKeywords') : null,
    btsSeoplan: buildSeoPlan(btsWithSeo, 'locationCoverage'),
    btsBlogInventory: useContentJson ? buildBlogInventoryFromContent(btsContent) : normalizeBlogInventory(btsWithSeo),
    btsCompetitors: buildCompetitors(btsWithSeo),
    btsCompetitorPages: buildCompetitorPages(btsWithSeo),
    btsCourseDetails: buildCourseDetails(btsWithSeo),
    btsCourses: buildCourses(btsWithSeo),
    btsSuggestions: btsWithSeo?.suggestions || { suggestions: [] },
    btsNotifications: btsWithSeo?.notifications || { notifications: [] },
    btsDrafts: useContentJson ? buildDraftsFromContent(btsContent, bts?.drafts) : buildDrafts(btsWithSeo),
    btsPublishLedger: useContentJson ? buildPublishLedgerFromContent(btsContent) : (btsWithSeo?.publishLedger || buildPublishLedger(btsWithSeo)),
    btsSeoDash: btsWithSeo?.seoDash || buildSeoDash(btsWithSeo),
    btsSeoAudit: btsWithSeo?.seoAudit || buildSeoAudit(btsWithSeo),
    btsNewsBank: btsNewsBankFile || null,
    btsReadiness: btsReadiness || null,
    btsTraffic: buildTraffic(btsWithSeo, 'BTS-GA4-NOT-CONNECTED'),
    nbhwStatus: nbhw,
    nbhwSeo: nbhw?.seo || null,
    nbhwKeywords: nbhw ? normalizeKeywords(nbhw, 'suburbKeywords') : null,
    nbhwPublishLedger: nbhw?.publishLedger || buildEmptyPublishLedger(nbhw),
    nbhwPublishLog: buildPublishLog(nbhw),
    nbhwLive: buildLive(nbhw),
    nbhwCompetitors: buildCompetitors(nbhw),
    nbhwSuggestions: nbhw?.suggestions || { suggestions: [] },
    nbhwGmbPosts: nbhw?.gbpPosts || { posts: [] },
    nbhwDrafts: nbhw?.drafts || { drafts: [] },
    nbhwSeoDash: nbhw?.seoDash || buildSeoDash(nbhw),
    nbhwSeoAudit: nbhw?.seoAudit || buildSeoAudit(nbhw),
    nbhwTraffic: buildTraffic(nbhw, 'G-LQBTD620CQ'),
    dashboardStatus: dashboard,
    gateway: {
      status: 'parked',
      note: 'OpenClaw gateway status is not read by the de-agented dashboard.'
    },
    sessions: {
      sessions: [],
      byAgent: {},
      heartbeats: {},
      totalAgents: 0,
      totalSessions: 0,
      parked: true
    },
    fleetHealth: {
      title: 'Agent fleet parked',
      agents: [],
      healthy: 0,
      total: 0,
      pct: null,
      parked: true
    },
    governance: {
      title: 'Agent governance parked',
      agents: [],
      ok: 0,
      total: 0,
      parked: true
    }
  }
}

export function buildPageProps(keys) {
  const snap = buildDashboardSnapshot()
  const props = {}
  for (const k of keys) {
    if (snap[k] !== undefined) props[k] = snap[k]
  }
  return props
}
