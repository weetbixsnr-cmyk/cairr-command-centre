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

export function buildDashboardSnapshot() {
  const bts = readJson('bts-status.json', null)
  const nbhw = readJson('nbhw-status.json', null)
  const dashboard = readJson('dashboard-status.json', null)

  const statuses = [bts, nbhw, dashboard].filter(Boolean)
  const timestamp = statuses
    .map(s => s.lastUpdated)
    .filter(Boolean)
    .sort((a, b) => new Date(b) - new Date(a))[0] || new Date().toISOString()

  const actionItems = dashboard?.actionQueue?.items || []
  const pendingItems = actionItems.filter(i => i.status === 'pending')
  const overdueItems = pendingItems.filter(i => i.due_date && new Date(i.due_date) < new Date())
  const highPriority = pendingItems.filter(i => i.priority === 'high')

  return {
    timestamp,
    dataSource: {
      mode: 'manual-status-json',
      directory: 'public/data',
      files: ['bts-status.json', 'nbhw-status.json', 'dashboard-status.json'],
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
    btsSeo: bts?.seo || null,
    btsKeywords: bts?.keywords || null,
    btsSeoplan: bts?.seoPlan || null,
    btsBlogInventory: bts?.blogInventory || null,
    btsCompetitors: bts?.competitors || null,
    btsCourseDetails: bts?.courseDetails || null,
    btsSuggestions: bts?.suggestions || { suggestions: [] },
    btsNotifications: bts?.notifications || { notifications: [] },
    btsDrafts: bts?.drafts || { drafts: [] },
    btsSeoDash: bts?.seoDash || null,
    btsSeoAudit: bts?.seoAudit || null,
    btsTraffic: bts?.traffic || null,
    nbhwStatus: nbhw,
    nbhwSeo: nbhw?.seo || null,
    nbhwKeywords: nbhw?.keywords || null,
    nbhwPublishLedger: nbhw?.publishLedger || null,
    nbhwPublishLog: nbhw?.publishLog || null,
    nbhwLive: nbhw?.live || null,
    nbhwCompetitors: nbhw?.competitors || null,
    nbhwSuggestions: nbhw?.suggestions || { suggestions: [] },
    nbhwGmbPosts: nbhw?.gbpPosts || { posts: [] },
    nbhwDrafts: nbhw?.drafts || { drafts: [] },
    nbhwSeoDash: nbhw?.seoDash || null,
    nbhwSeoAudit: nbhw?.seoAudit || null,
    nbhwTraffic: nbhw?.traffic || null,
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
