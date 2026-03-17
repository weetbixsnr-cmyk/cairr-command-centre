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
    if (!byAgent[s.agent]) byAgent[s.agent] = { sessions: [], totalContextPct: 0, count: 0, model: s.model }
    byAgent[s.agent].sessions.push(s)
    if (s.contextPct !== null) { byAgent[s.agent].totalContextPct += s.contextPct; byAgent[s.agent].count++ }
  }
  for (const a of Object.values(byAgent)) {
    a.avgContextPct = a.count > 0 ? Math.round(a.totalContextPct / a.count) : null
  }

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
