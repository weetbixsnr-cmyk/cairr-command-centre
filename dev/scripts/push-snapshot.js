#!/usr/bin/env node
/**
 * push-snapshot.js — Bundle all dashboard data into JSON and deploy to Vercel
 * Run via OpenClaw cron:
 *   node /Users/cairr/.openclaw/agents/command-centre/workspace/dev/scripts/push-snapshot.js
 * 
 * Generates snapshot → bundles into public/snapshot.json → deploys via vercel --prod
 */

const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

const WORKSPACE = '/Users/cairr/.openclaw/agents/command-centre/workspace'
const PIPELINE = path.join(WORKSPACE, 'dev', 'pipeline-results')
const DASHBOARD_DATA = path.join(WORKSPACE, 'dev', 'dashboard')
const SNAPSHOTS_DIR = path.join(WORKSPACE, 'dev', 'snapshots')
const SNAPSHOT_FILE = path.join(SNAPSHOTS_DIR, 'latest.json')



// ── Helpers ──────────────────────────────────────────────────

function readFile(filepath) {
  try { return fs.readFileSync(filepath, 'utf8') } catch { return null }
}

function readJSON(filepath) {
  try { return JSON.parse(fs.readFileSync(filepath, 'utf8')) } catch { return null }
}

function fileMtime(filepath) {
  try { return fs.statSync(filepath).mtime.toISOString() } catch { return null }
}

function parseFleetHealth(raw) {
  if (!raw) return null
  const lines = raw.split('\n').filter(l => l.trim())
  const title = lines[0]?.replace(/^#\s*/, '') || 'Fleet Health'
  const agents = []
  let i = 1
  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^(✅|❌)\s+(\S+):?\s*(.*)/)
    if (match) {
      const agent = { name: match[2].replace(/:$/, ''), healthy: match[1] === '✅', notes: [] }
      if (match[3]) agent.notes.push(match[3])
      while (i + 1 < lines.length && /^\s+/.test(lines[i + 1])) {
        i++
        agent.notes.push(lines[i].trim())
      }
      agents.push(agent)
    }
    i++
  }
  const healthy = agents.filter(a => a.healthy).length
  return { title, agents, healthy, total: agents.length, pct: agents.length > 0 ? Math.round((healthy / agents.length) * 100) : 0 }
}

function parseGovernance(raw) {
  if (!raw) return null
  const lines = raw.split('\n').filter(l => l.trim())
  const title = lines[0]?.replace(/^#\s*/, '') || 'Governance'
  const agents = []
  for (const line of lines.slice(1)) {
    const match = line.match(/^(✅|❌|⚠️)\s+(\S+):?\s*(.*)/)
    if (match) {
      agents.push({
        name: match[2].replace(/:$/, ''),
        status: match[1] === '✅' ? 'ok' : match[1] === '⚠️' ? 'warn' : 'fail',
        detail: match[3] || ''
      })
    }
  }
  return { title, agents, ok: agents.filter(a => a.status === 'ok').length, total: agents.length }
}

function parseActionQueue(items) {
  if (!items) return { items: [], pending: 0, overdueCount: 0, highPriority: 0 }
  const now = new Date()
  const enriched = items.map(item => ({
    ...item,
    overdue: item.due_date && new Date(item.due_date) < now && item.status === 'pending'
  }))
  const pending = enriched.filter(i => i.status === 'pending')
  return {
    items: enriched,
    pending: pending.length,
    overdueCount: pending.filter(i => i.overdue).length,
    highPriority: pending.filter(i => i.priority === 'high').length
  }
}

function parseInfra(raw) {
  if (!raw) return null
  const lines = raw.split('\n').filter(l => l.trim())
  return {
    title: lines[0]?.replace(/^#\s*/, ''),
    items: lines.slice(1).map(l => {
      const match = l.match(/^(✅|❌|⚠️)\s+(.*)/)
      return match ? { status: match[1] === '✅' ? 'ok' : match[1] === '⚠️' ? 'warn' : 'fail', text: match[2] } : null
    }).filter(Boolean)
  }
}

function parseTokenSpend(raw) {
  if (!raw) return null
  const result = { agents: {}, budgets: {} }
  const entryMatches = raw.matchAll(/\*\*(\w[\w-]*):\*\*\s*([\d,]+)\s*log entries/g)
  for (const m of entryMatches) {
    result.agents[m[1]] = { logEntries: parseInt(m[2].replace(/,/g, '')) }
  }
  const budgetMatches = raw.matchAll(/\|\s*(\w[\w-]*)\s*\|\s*([<>$\d\w]+)\s*\|\s*(🟢|🟡|🔴)\s*\|/g)
  for (const m of budgetMatches) {
    result.budgets[m[1].toLowerCase()] = { limit: m[2], status: m[3] === '🟢' ? 'ok' : m[3] === '🟡' ? 'warn' : 'over' }
  }
  return result
}

function parseAgentReports() {
  const reports = {}
  try {
    const files = fs.readdirSync(PIPELINE).filter(f => f.endsWith('-latest.md'))
    for (const file of files) {
      const key = file.replace('-latest.md', '')
      if (['fleet-health', 'governance-drift', 'infra-status', 'token-spend', 'email-cleanup'].includes(key)) continue
      const raw = readFile(path.join(PIPELINE, file))
      if (!raw) continue
      const lines = raw.split('\n').filter(l => l.trim())
      reports[key] = {
        title: lines[0]?.replace(/^#\s*/, '') || key,
        pass: lines.filter(l => /✅/.test(l)).length,
        fail: lines.filter(l => /❌/.test(l)).length,
        warn: lines.filter(l => /⚠️/.test(l)).length,
        lastUpdated: fileMtime(path.join(PIPELINE, file)),
        lines: lines.slice(1)
      }
    }
  } catch {}
  return reports
}

function parseFullReports() {
  const reports = {}
  try {
    const files = fs.readdirSync(PIPELINE).filter(f => f.endsWith('-full-report.md'))
    for (const file of files) {
      const key = file.replace('-full-report.md', '')
      reports[key] = readFile(path.join(PIPELINE, file))
    }
  } catch {}
  return reports
}

function parseSessions(statusOutput) {
  if (!statusOutput) return { sessions: [], byAgent: {}, heartbeats: {}, totalAgents: null, totalSessions: 0 }

  const sessions = []
  const sessionLines = statusOutput.split('\n').filter(l => /agent:/.test(l))

  for (const line of sessionLines) {
    const cols = line.split('│').map(c => c.trim()).filter(Boolean)
    if (cols.length >= 5) {
      const tokenMatch = cols[4].match(/(\d+k?)\/(\d+k?)\s*\((\d+)%\)/)
      const cacheMatch = cols[4].match(/(\d+)%\s*cached/)
      const agentMatch = cols[0].match(/^agent:([^:]+):/)

      sessions.push({
        key: cols[0], agent: agentMatch?.[1] || cols[0], kind: cols[1], age: cols[2],
        model: cols[3], tokensUsed: tokenMatch?.[1] || '?', tokensMax: tokenMatch?.[2] || '?',
        contextPct: tokenMatch ? parseInt(tokenMatch[3]) : null,
        cachePct: cacheMatch ? parseInt(cacheMatch[1]) : null
      })
    }
  }

  const byAgent = {}
  for (const s of sessions) {
    if (!byAgent[s.agent]) byAgent[s.agent] = { sessions: [], totalContextPct: 0, count: 0, model: null }
    byAgent[s.agent].sessions.push(s)
    if (s.contextPct !== null) { byAgent[s.agent].totalContextPct += s.contextPct; byAgent[s.agent].count++ }
    // Primary model = non-cron session model (cron keys contain 'cron:')
    if (!s.key.includes('cron:') && !byAgent[s.agent].model) {
      byAgent[s.agent].model = s.model
    }
  }
  for (const [name, a] of Object.entries(byAgent)) {
    a.avgContextPct = a.count > 0 ? Math.round(a.totalContextPct / a.count) : null
    // Fallback: if no non-cron session found, use first session model
    if (!a.model && a.sessions.length > 0) a.model = a.sessions[0].model
  }
  
  // Get session updatedAt + accurate model from JSON status
  try {
    const jsonStatus = execSync('openclaw status --json 2>&1', { timeout: 10000, encoding: 'utf8' })
    const statusData = JSON.parse(jsonStatus)
    const recentSessions = statusData?.sessions?.recent || []
    
    // Track primary model per agent (non-cron session)
    const primaryModels = {}
    
    for (const s of recentSessions) {
      const agent = s.agentId
      if (!agent) continue
      if (!byAgent[agent]) byAgent[agent] = { sessions: [], totalContextPct: 0, count: 0, model: null, avgContextPct: null }
      
      const ts = s.updatedAt
      if (ts && (!byAgent[agent].lastSessionActivity || ts > byAgent[agent].lastSessionActivity)) {
        byAgent[agent].lastSessionActivity = ts
      }
      
      // Primary model = non-cron session
      const key = s.key || ''
      if (!key.includes('cron:') && s.model && !primaryModels[agent]) {
        primaryModels[agent] = s.model
      }
    }
    
    // Override model with primary (non-cron) model
    for (const [agent, model] of Object.entries(primaryModels)) {
      if (byAgent[agent]) byAgent[agent].model = model
    }
    
    // Hardcoded config models — source of truth from agent configs
    // These are the DEFAULT models set in each agent's config, not session models
    const CONFIG_MODELS = {
      'main': 'claude-opus-4-6',
      'command-centre': 'claude-opus-4-6',
      'nbhw': 'claude-opus-4-6',
      'bts': 'claude-opus-4-6',
      'v3dn': 'claude-opus-4-6',
      'gridpilot': 'claude-opus-4-6',
      'audit': 'claude-sonnet-4-20250514',
      'alpha': 'claude-sonnet-4-20250514',
      'property': 'claude-sonnet-4-20250514',
      'overdue-office': 'claude-sonnet-4-20250514',
    }
    for (const [agent, model] of Object.entries(CONFIG_MODELS)) {
      if (!byAgent[agent]) byAgent[agent] = { sessions: [], totalContextPct: 0, count: 0, model: null, avgContextPct: null }
      byAgent[agent].configModel = model
    }
    
    // Read compaction counts from session files
    for (const s of recentSessions) {
      const agent = s.agentId
      if (!agent || !byAgent[agent]) continue
      const sessFile = path.join(AGENTS_ROOT, agent, 'sessions', 'sessions.json')
      try {
        const sessData = JSON.parse(fs.readFileSync(sessFile, 'utf8'))
        // Find the matching session by key
        const key = s.key
        if (sessData[key]) {
          const cc = sessData[key].compactionCount || 0
          // Only track non-cron sessions (primary Discord sessions)
          if (!key.includes('cron:')) {
            if (!byAgent[agent].compactionCount || cc > byAgent[agent].compactionCount) {
              byAgent[agent].compactionCount = cc
            }
          }
        }
      } catch {}
    }

    // Also grab agents list for lastUpdatedAt
    const agentsList = statusData?.agents?.agents || []
    for (const a of agentsList) {
      if (a.id) {
        if (!byAgent[a.id]) byAgent[a.id] = { sessions: [], totalContextPct: 0, count: 0, model: null, avgContextPct: null }
        if (a.lastUpdatedAt) byAgent[a.id].lastAgentActivity = a.lastUpdatedAt
      }
    }
  } catch {}

  const heartbeats = {}
  const hbLine = statusOutput.match(/Heartbeat\s*│\s*(.+?)│/s)
  if (hbLine) {
    for (const m of hbLine[1].matchAll(/(disabled|enabled|ok|error)\s*\((\w[\w-]*)\)/gi)) {
      heartbeats[m[2]] = m[1].toLowerCase()
    }
  }

  const agentCount = statusOutput.match(/Agents\s*│\s*(\d+)/)
  const sessionCount = statusOutput.match(/sessions\s+(\d+)/)

  return {
    sessions, byAgent, heartbeats,
    totalAgents: agentCount ? parseInt(agentCount[1]) : null,
    totalSessions: sessionCount ? parseInt(sessionCount[1]) : sessions.length
  }
}

function parseGateway(statusOutput) {
  if (!statusOutput) return { status: 'unknown' }
  const channels = []
  const whatsapp = statusOutput.match(/WhatsApp\s*│\s*ON\s*│\s*(\w+)/)
  const discord = statusOutput.match(/Discord\s*│\s*ON\s*│\s*(\w+)/)
  if (whatsapp) channels.push({ name: 'WhatsApp', state: whatsapp[1] })
  if (discord) channels.push({ name: 'Discord', state: discord[1] })

  const getField = (label) => {
    const m = statusOutput.match(new RegExp(`│\\s*${label}\\s*│\\s*(.+?)\\s*│`, 'i'))
    return m ? m[1].trim() : null
  }

  return {
    status: 'running', channels,
    agents: getField('Agents'),
    sessions: getField('Sessions')
  }
}

// ── Vercel Projects ──────────────────────────────────────────

function getVercelProjects() {
  try {
    const raw = execSync('cd /Users/cairr/.openclaw/agents/command-centre/workspace/dashboard-secure && vercel projects ls 2>&1', { timeout: 15000, encoding: 'utf8' })
    const projects = []
    const lines = raw.split('\n').filter(l => l.trim() && !l.includes('Fetching') && !l.includes('Projects found') && !l.includes('Project Name'))
    for (const line of lines) {
      const parts = line.trim().split(/\s{2,}/)
      if (parts.length >= 2) {
        projects.push({
          name: parts[0],
          url: parts[1] !== '--' ? parts[1] : null,
          updated: parts[2] || null,
          nodeVersion: parts[3] || null
        })
      }
    }
    return projects
  } catch (e) {
    console.warn('Could not get Vercel projects:', e.message)
    return null
  }
}

// ── Cron Jobs ────────────────────────────────────────────────

function getCronJobs() {
  try {
    const raw = execSync('openclaw cron list --json 2>&1', { timeout: 15000, encoding: 'utf8' })
    const data = JSON.parse(raw)
    return (data.jobs || []).map(j => ({
      id: j.id,
      name: j.name,
      enabled: j.enabled,
      agentId: j.agentId,
      schedule: j.schedule?.cron || j.schedule?.kind || '?',
      everyMs: j.schedule?.everyMs || null,
      model: j.payload?.model || null,
      lastStatus: j.state?.lastStatus || null,
      lastRunAt: j.state?.lastRunAtMs ? new Date(j.state.lastRunAtMs).toISOString() : null,
      nextRunAt: j.state?.nextRunAtMs ? new Date(j.state.nextRunAtMs).toISOString() : null,
      sessionTarget: j.sessionTarget || null
    }))
  } catch (e) {
    console.warn('Could not get cron jobs:', e.message)
    return null
  }
}

// ── CodexBar (Claude cost data) ──────────────────────────────

function getCodexBarCost() {
  try {
    const raw = execSync('codexbar cost --provider claude --json 2>&1', { timeout: 10000, encoding: 'utf8' })
    const data = JSON.parse(raw)
    if (Array.isArray(data) && data.length > 0) {
      const d = data[0]
      return {
        provider: d.provider,
        source: d.source,
        updatedAt: d.updatedAt,
        last30Days: { cost: d.totals?.totalCost || 0, tokens: d.totals?.totalTokens || 0 },
        session: { cost: d.sessionCostUSD || 0, tokens: d.sessionTokens || 0 },
        daily: (d.daily || []).slice(-7).map(day => ({
          date: day.date,
          cost: day.totalCost,
          tokens: day.totalTokens,
          models: day.modelsUsed || []
        }))
      }
    }
  } catch (e) {
    console.warn('Could not get CodexBar cost:', e.message)
  }
  return null
}

// ── Agent Workspace Data ─────────────────────────────────────

const AGENTS_ROOT = '/Users/cairr/.openclaw/agents'
const AGENT_NAMES = ['main', 'command-centre', 'nbhw', 'bts', 'v3dn', 'gridpilot', 'alpha', 'property', 'overdue-office', 'audit']

function getAgentWorkspaceData() {
  const result = {}
  for (const name of AGENT_NAMES) {
    const ws = path.join(AGENTS_ROOT, name, 'workspace')
    if (!fs.existsSync(ws)) { result[name] = { exists: false }; continue }
    
    const agent = { exists: true }
    
    // Git info
    try {
      const gitLog = execSync(`cd "${ws}" && git log --oneline -1 2>/dev/null`, { timeout: 5000, encoding: 'utf8' }).trim()
      const parts = gitLog.match(/^(\S+)\s+(.*)$/)
      if (parts) { agent.git = { hash: parts[1], message: parts[2] } }
      const branch = execSync(`cd "${ws}" && git branch --show-current 2>/dev/null`, { timeout: 3000, encoding: 'utf8' }).trim()
      if (branch) agent.git = { ...agent.git, branch }
      // Last commit time
      const commitTime = execSync(`cd "${ws}" && git log -1 --format=%cI 2>/dev/null`, { timeout: 3000, encoding: 'utf8' }).trim()
      if (commitTime) agent.git = { ...agent.git, lastCommitAt: commitTime }
    } catch {}
    
    // Identity
    const identity = readFile(path.join(ws, 'IDENTITY.md'))
    if (identity) {
      const nameMatch = identity.match(/\*\*Name:\*\*\s*(.+)/); if (nameMatch) agent.identity = nameMatch[1].trim()
      const emojiMatch = identity.match(/\*\*Emoji:\*\*\s*(.+)/); if (emojiMatch) agent.emoji = emojiMatch[1].trim()
    }
    
    // MEMORY.md summary (first 5 lines after header)
    const mem = readFile(path.join(ws, 'MEMORY.md'))
    if (mem) {
      const lines = mem.split('\n').filter(l => l.trim() && !l.startsWith('#')).slice(0, 3)
      agent.memorySummary = lines.join(' ').substring(0, 200)
    }
    
    // Decision log (last 5 entries)
    const decLog = readFile(path.join(ws, 'memory', 'decision-log.md'))
    if (decLog) {
      const rows = decLog.split('\n').filter(l => l.startsWith('|') && !l.includes('Date') && !l.includes('---'))
      agent.decisions = rows.slice(-5).map(r => {
        const cols = r.split('|').map(c => c.trim()).filter(Boolean)
        return { date: cols[0], decision: cols[1], why: cols[2] }
      })
    }
    
    // Failure log (last 3 entries)
    const failLog = readFile(path.join(ws, 'memory', 'failures.md'))
    if (failLog) {
      const entries = failLog.split(/^## /m).filter(e => e.trim() && !e.startsWith('Failure Log') && !e.includes('Max 30'))
      agent.failures = entries.slice(-3).map(e => {
        const lines = e.split('\n')
        const title = lines[0]?.trim() || ''
        const dateMatch = e.match(/\*\*Date:\*\*\s*(.+)/)
        const lessonMatch = e.match(/\*\*Lesson:\*\*\s*(.+)/)
        return { title, date: dateMatch?.[1], lesson: lessonMatch?.[1] }
      })
    }
    
    // Weekly stats (EOS scorecard)
    try {
      const weekCommits = execSync(`cd "${ws}" && git log --since="1 week ago" --oneline 2>/dev/null | wc -l`, { timeout: 5000, encoding: 'utf8' }).trim()
      agent.weeklyCommits = parseInt(weekCommits) || 0
    } catch { agent.weeklyCommits = 0 }
    
    // Count failures from last 7 days
    if (agent.failures) {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
      agent.weeklyFailures = agent.failures.filter(f => f.date && f.date >= weekAgo).length
    } else {
      agent.weeklyFailures = 0
    }
    
    // Current tasks (from memory/tasks.md)
    const tasksFile = readFile(path.join(ws, 'memory', 'tasks.md'))
    if (tasksFile) {
      const openTasks = tasksFile.split('\n')
        .filter(l => l.match(/^[-*]\s*\[[ ]\]/) || (l.match(/^[-*]\s/) && !l.match(/\[x\]/i)))
        .map(l => l.replace(/^[-*]\s*(\[[ ]\]\s*)?/, '').trim())
        .filter(Boolean)
      if (openTasks.length > 0) agent.currentTasks = openTasks.slice(0, 3)
    }
    
    // Latest daily note
    const memDir = path.join(ws, 'memory')
    try {
      const dailyFiles = fs.readdirSync(memDir).filter(f => f.match(/^2026-\d{2}-\d{2}/)).sort().reverse()
      if (dailyFiles[0]) {
        agent.lastDailyNote = dailyFiles[0].replace('.md', '')
        const noteContent = readFile(path.join(memDir, dailyFiles[0]))
        if (noteContent) {
          const lines = noteContent.split('\n').filter(l => l.trim() && !l.startsWith('#')).slice(0, 3)
          agent.lastDailyNoteSummary = lines.join(' ').substring(0, 200)
        }
      }
    } catch {}
    
    result[name] = agent
  }
  return result
}

// ── NBHW Publish Log (Google Safety) ─────────────────────────

function parsePublishLog() {
  const raw = readFile('/Users/cairr/.openclaw/agents/nbhw/workspace/dev/seo/publish-log.md')
  if (!raw) return null

  const result = {
    weeklyLimit: 3,
    gbpWeeklyLimit: 3,
    publishedThisWeek: [],
    gbpThisWeek: [],
    previousWeeks: [],
    queue: [],
    warningStatus: null,
    nextSafeDate: null
  }

  // Parse current week entries from the table
  const currentWeekMatch = raw.match(/## Current Week[^\n]*\n[\s\S]*?\n((?:\|[^\n]+\n)+)/i)
  if (currentWeekMatch) {
    const rows = currentWeekMatch[1].split('\n').filter(r => r.startsWith('|') && !r.includes('Date') && !r.includes('---') && !r.includes('TOTAL'))
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 3) {
        const entry = { date: cols[0], type: cols[1], page: cols[2], status: cols[3] || '' }
        if (entry.type?.toLowerCase().includes('gbp')) {
          result.gbpThisWeek.push(entry)
        } else {
          result.publishedThisWeek.push(entry)
        }
      }
    }
  }

  // Parse previous weeks
  const prevMatch = raw.match(/## Previous Weeks[^\n]*\n[\s\S]*?\n((?:\|[^\n]+\n)+)/i)
  if (prevMatch) {
    const rows = prevMatch[1].split('\n').filter(r => r.startsWith('|') && !r.includes('Week') && !r.includes('---'))
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 2) {
        result.previousWeeks.push({ week: cols[0], pages: cols[1], type: cols[2] || '' })
      }
    }
  }

  // Parse queue
  const queueMatch = raw.match(/## Queue[^\n]*\n((?:[-*][^\n]+\n?)+)/i)
  if (queueMatch) {
    result.queue = queueMatch[1].split('\n').filter(l => l.match(/^[-*]/)).map(l => l.replace(/^[-*]\s*/, '').trim())
  }

  // Parse warning status
  const warnMatch = raw.match(/## ⚠️ WARNING STATUS\n([\s\S]*?)(?=\n##|\n$|$)/i)
  if (warnMatch) {
    result.warningStatus = warnMatch[1].trim().split('\n').filter(l => l.trim()).map(l => l.replace(/^[🔴🟡🟢⚠️]\s*\**/, '').replace(/\**/g, '').trim())
  }

  // Extract next safe date
  const dateMatch = raw.match(/(?:Wait until|earliest)\s*\**(\d{1,2}\s+\w+(?:\s+\d{4})?)\b/i)
  if (dateMatch) result.nextSafeDate = dateMatch[1]

  // Calculate status
  const pubCount = result.publishedThisWeek.length
  const remaining = result.weeklyLimit - pubCount
  if (remaining <= 0) {
    result.status = 'at_limit'
    result.statusLabel = '🔴 AT LIMIT — wait until ' + (result.nextSafeDate || 'next week')
  } else if (remaining === 1) {
    result.status = 'caution'
    result.statusLabel = '🟡 1 left this week — proceed with caution'
  } else {
    result.status = 'safe'
    result.statusLabel = '🟢 Space to publish (' + remaining + ' remaining)'
  }

  const gbpRemaining = result.gbpWeeklyLimit - result.gbpThisWeek.length
  result.gbpStatus = gbpRemaining <= 0 ? 'at_limit' : gbpRemaining === 1 ? 'caution' : 'safe'

  return result
}

// ── NBHW Keyword Tracker ─────────────────────────────────────

function parseKeywordTracker() {
  const raw = readFile('/Users/cairr/.openclaw/agents/nbhw/workspace/dev/seo/keyword-tracker.md')
  if (!raw) return null
  
  const result = { lastUpdated: null, campaigns: [], keywords: [], competitors: [] }
  
  // Last updated
  const updMatch = raw.match(/\*\*Last Updated:\*\*\s*(.+)/)
  if (updMatch) result.lastUpdated = updMatch[1].trim()
  
  // Parse all keyword tables
  const tableRegex = /###\s*(.*?)\n\|[^\n]+\n\|[-| ]+\n((?:\|[^\n]+\n)*)/g
  let match
  while ((match = tableRegex.exec(raw)) !== null) {
    const sectionTitle = match[1].trim()
    const rows = match[2].trim().split('\n')
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 4 && cols[0] !== 'Keyword' && cols[0] !== 'Competitor') {
        // Keyword row
        const baseline = cols[1]?.replace(/\*\*/g, '').replace('#', '').trim()
        const latest = cols[2]?.replace('#', '').trim()
        result.keywords.push({
          keyword: cols[0],
          baseline: baseline === '50+' ? 99 : parseInt(baseline) || 99,
          latest: latest === '50+' ? 99 : parseInt(latest) || 99,
          trend: cols[3]?.trim() || '—',
          url: cols[4]?.trim() || null,
          section: sectionTitle
        })
      }
    }
  }
  
  // Parse campaigns
  const campRegex = /### Campaign \d+:\s*(.+)\n\*\*Started:\*\*\s*(.+?)\s*\|\s*\*\*Goal:\*\*\s*(.+)\s*\n\*\*Status:\*\*\s*(.+)/g
  while ((match = campRegex.exec(raw)) !== null) {
    result.campaigns.push({
      name: match[1].trim(),
      started: match[2].trim(),
      goal: match[3].trim(),
      status: match[4].trim()
    })
  }
  
  // Top 10 = sort by best position
  result.top10 = [...result.keywords]
    .sort((a, b) => a.latest - b.latest)
    .slice(0, 10)
  
  return result
}

function parseBtsKeywordTracker() {
  const raw = readFile('/Users/cairr/.openclaw/agents/bts/workspace/dev/seo/keyword-tracker.md')
  if (!raw) return null

  const result = { lastUpdated: null, keywords: [], campaigns: [] }

  const updMatch = raw.match(/\*\*Last Updated:\*\*\s*(.+)/)
  if (updMatch) result.lastUpdated = updMatch[1].trim()

  const tableRegex = /###\s*(.*?)\n\|[^\n]+\n\|[-| ]+\n((?:\|[^\n]+\n)*)/g
  let match
  while ((match = tableRegex.exec(raw)) !== null) {
    const sectionTitle = match[1].trim()
    const rows = match[2].trim().split('\n')
    for (const row of rows) {
      const cols = row.split('|').map(c => c.trim()).filter(Boolean)
      if (cols.length >= 4 && cols[0] !== 'Keyword' && cols[0] !== 'Date') {
        const baseline = cols[1]?.replace(/\*\*/g, '').replace('#', '').replace('—', '').trim()
        const latest = cols[2]?.replace('#', '').replace('—', '').trim()
        result.keywords.push({
          keyword: cols[0],
          baseline: baseline === '50+' ? 99 : (parseInt(baseline) || null),
          latest: latest === '50+' ? 99 : (parseInt(latest) || null),
          trend: cols[3]?.trim() || '—',
          url: cols[4]?.trim() || null,
          section: sectionTitle
        })
      }
    }
  }

  result.top10 = [...result.keywords]
    .sort((a, b) => (a.latest || 999) - (b.latest || 999))
    .slice(0, 10)

  return result
}

// ── NBHW Live Site Auto-Detection ────────────────────────────

function detectNbhwLivePages() {
  const NBHW_REPO = '/Users/cairr/.openclaw/agents/nbhw/workspace/dev/nbhw-repo'
  const DIST_SUBURBS = path.join(NBHW_REPO, 'frontend/dist/hot-water')
  const DIST_BLOGS = path.join(NBHW_REPO, 'frontend/dist/blog')
  const PUBLISH_LOG = '/Users/cairr/.openclaw/workspace/output/publish-history.log'
  
  const result = {
    liveSuburbs: [],
    liveBlogs: [],
    totalSuburbPages: 0,
    totalBlogPages: 0,
    publishHistory: [],
    lastDetected: new Date().toISOString()
  }

  // Detect live suburb pages from dist/
  try {
    const suburbs = fs.readdirSync(DIST_SUBURBS).filter(f => {
      const indexPath = path.join(DIST_SUBURBS, f, 'index.html')
      return fs.existsSync(indexPath)
    })
    for (const slug of suburbs) {
      const entry = { slug, name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') }
      // Get git commit date for this suburb
      try {
        const gitDate = execSync(
          `cd "${NBHW_REPO}" && git log -1 --format=%cI -- "frontend/src/lib/suburbs.js" --diff-filter=M -S "${slug}" 2>/dev/null || git log --oneline --all -- frontend/src/lib/suburbs.js 2>/dev/null | grep -i "${slug.replace(/-/g, '.')}" | head -1 | awk '{print $1}' | xargs -I{} git show -s --format=%cI {} 2>/dev/null`,
          { timeout: 5000, encoding: 'utf8' }
        ).trim()
        if (gitDate) entry.publishedAt = gitDate
      } catch {}
      // File mtime as fallback
      try {
        const stat = fs.statSync(path.join(DIST_SUBURBS, slug, 'index.html'))
        entry.builtAt = stat.mtime.toISOString()
      } catch {}
      result.liveSuburbs.push(entry)
    }
    result.totalSuburbPages = result.liveSuburbs.length
  } catch {}

  // Detect blog pages from dist/
  try {
    const blogs = fs.readdirSync(DIST_BLOGS).filter(f => {
      return fs.existsSync(path.join(DIST_BLOGS, f, 'index.html'))
    })
    result.liveBlogs = blogs.map(slug => {
      const entry = { slug }
      try {
        const stat = fs.statSync(path.join(DIST_BLOGS, slug, 'index.html'))
        entry.builtAt = stat.mtime.toISOString()
      } catch {}
      return entry
    })
    result.totalBlogPages = result.liveBlogs.length
  } catch {}

  // Git history for suburb page commits
  try {
    const gitLog = execSync(
      `cd "${NBHW_REPO}" && git log --oneline --all -- frontend/src/lib/suburbs.js 2>/dev/null | grep -i 'suburb\\|wave' | head -20`,
      { timeout: 5000, encoding: 'utf8' }
    ).trim()
    if (gitLog) {
      for (const line of gitLog.split('\n')) {
        const hashMatch = line.match(/^(\S+)\s+(.*)$/)
        if (hashMatch) {
          try {
            const date = execSync(`cd "${NBHW_REPO}" && git show -s --format=%cI ${hashMatch[1]} 2>/dev/null`, { timeout: 3000, encoding: 'utf8' }).trim()
            result.publishHistory.push({ date, message: hashMatch[2], hash: hashMatch[1] })
          } catch {}
        }
      }
    }
  } catch {}

  // Read publish-history.log
  try {
    const pubLog = readFile(PUBLISH_LOG)
    if (pubLog) {
      result.publishLog = pubLog.split('\n').filter(l => l.trim()).map(l => {
        const parts = l.split('|')
        return { date: parts[0], agent: parts[1], item: parts[2] }
      })
    }
  } catch {}

  // Auto-update wave statuses based on what's actually live
  const WAVE_SUBURBS = {
    1: ['dee-why', 'freshwater', 'narrabeen'],
    2: ['collaroy', 'frenchs-forest', 'manly', 'cromer', 'mosman'],
    3: ['balgowlah', 'newport', 'warriewood', 'allambie-heights', 'belrose'],
  }
  const liveSlugs = new Set(result.liveSuburbs.map(s => s.slug))
  result.waveStatus = {}
  for (const [waveNum, suburbs] of Object.entries(WAVE_SUBURBS)) {
    const live = suburbs.filter(s => liveSlugs.has(s))
    const total = suburbs.length
    result.waveStatus[waveNum] = {
      live: live.length,
      total,
      complete: live.length === total,
      liveSuburbs: live,
      remaining: suburbs.filter(s => !liveSlugs.has(s)),
      pct: Math.round((live.length / total) * 100)
    }
  }

  return result
}

// ── Build snapshot ───────────────────────────────────────────

console.log('Building dashboard snapshot...')

let openclawStatus = null
try {
  openclawStatus = execSync('openclaw status 2>&1', { timeout: 15000, encoding: 'utf8' })
} catch (e) {
  console.warn('Could not run openclaw status:', e.message)
}

const snapshot = {
  timestamp: new Date().toISOString(),
  fleetHealth: parseFleetHealth(readFile(path.join(PIPELINE, 'fleet-health-latest.md'))),
  governance: parseGovernance(readFile(path.join(PIPELINE, 'governance-drift-latest.md'))),
  actionQueue: parseActionQueue(readJSON(path.join(DASHBOARD_DATA, 'action-queue.json'))),
  infra: parseInfra(readFile(path.join(PIPELINE, 'infra-status-latest.md'))),
  tokenSpend: parseTokenSpend(readFile(path.join(PIPELINE, 'token-spend-latest.md'))),
  agentReports: parseAgentReports(),
  nbhwSeo: readJSON(path.join(PIPELINE, 'nbhw-seo-latest.json')),
  fullReports: parseFullReports(),
  sessions: parseSessions(openclawStatus),
  gateway: parseGateway(openclawStatus),
  vercelProjects: getVercelProjects(),
  cronJobs: getCronJobs(),
  claudeCost: getCodexBarCost(),
  services: readJSON(path.join(DASHBOARD_DATA, 'services.json')),
  agentWorkspaces: getAgentWorkspaceData(),
  nbhwPublishLog: parsePublishLog(),
  nbhwKeywords: parseKeywordTracker(),
  nbhwLive: detectNbhwLivePages(),
  nbhwCompetitors: readJSON(path.join(PIPELINE, 'nbhw-competitors.json')),
  btsSeo: readJSON(path.join(PIPELINE, 'bts-seo-latest.json')),
  btsSeoplan: readJSON(path.join(PIPELINE, 'bts-seo-plan.json')),
  btsBlogInventory: readJSON(path.join(PIPELINE, 'bts-blog-inventory.json')),
  btsCompetitors: readJSON(path.join(PIPELINE, 'bts-competitors.json')),
  btsKeywords: parseBtsKeywordTracker(),
}

// ── Write snapshot + bundle into dashboard ───────────────────

fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(snapshot))
const BUNDLE_PATH = path.join(WORKSPACE, 'dashboard-secure', 'public', 'snapshot.json')
fs.writeFileSync(BUNDLE_PATH, JSON.stringify(snapshot))
const sizeKB = Math.round(fs.statSync(SNAPSHOT_FILE).size / 1024)
console.log(`Snapshot written: ${SNAPSHOT_FILE} (${sizeKB}KB)`)
console.log(`Bundled into: ${BUNDLE_PATH}`)

// ── Deploy to Vercel ─────────────────────────────────────────

const DEPLOY = process.env.DEPLOY !== '0' // set DEPLOY=0 to skip
if (DEPLOY) {
  try {
    console.log('Deploying to Vercel...')
    // Copy pages from dev/ to dashboard-secure/
    const PAGES_SRC = path.join(WORKSPACE, 'dev', 'pages')
    const PAGES_DST = path.join(WORKSPACE, 'dashboard-secure', 'pages')
    execSync(`cp -r ${PAGES_SRC}/* ${PAGES_DST}/`, { timeout: 5000 })
    // Copy middleware if exists
    const mwSrc = path.join(WORKSPACE, 'dev', 'middleware.js')
    if (fs.existsSync(mwSrc)) {
      fs.copyFileSync(mwSrc, path.join(WORKSPACE, 'dashboard-secure', 'middleware.js'))
    }
    
    const result = execSync(
      'npx vercel --prod --yes 2>&1',
      { cwd: path.join(WORKSPACE, 'dashboard-secure'), timeout: 120000, encoding: 'utf8' }
    )
    const aliasMatch = result.match(/Aliased:\s*(https:\/\/\S+)/)
    if (aliasMatch) {
      console.log(`✅ Deployed: ${aliasMatch[1]}`)
    } else {
      console.log('Deploy output:', result.split('\n').slice(-3).join('\n'))
    }
  } catch (e) {
    console.error('❌ Deploy failed:', e.message?.split('\n').slice(0, 3).join('\n'))
  }
} else {
  console.log('⏭️  Deploy skipped (DEPLOY=0)')
}
