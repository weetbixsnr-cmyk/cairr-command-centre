/**
 * /api/data — Single API endpoint for all dashboard data
 * Fetches live from GitHub raw (decoupled from deploys)
 * Falls back to bundled public/snapshot.json if GitHub fetch fails
 */

import fs from 'fs'
import path from 'path'

const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/weetbixsnr-cmyk/cairr-command-centre/agent/command-centre/data/snapshot.json'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''

// Fallback: bundled snapshot from deploy time
let BUNDLED_SNAPSHOT = null
try {
  const bundledPath = path.resolve(process.cwd(), 'public', 'snapshot.json')
  if (fs.existsSync(bundledPath)) {
    BUNDLED_SNAPSHOT = JSON.parse(fs.readFileSync(bundledPath, 'utf8'))
  }
} catch {}

// In-memory cache (5 min TTL)
let cachedSnapshot = null
let cacheExpiry = 0

async function getSnapshot() {
  const now = Date.now()
  if (cachedSnapshot && now < cacheExpiry) {
    return cachedSnapshot
  }

  try {
    const headers = { 'Cache-Control': 'no-cache' }
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`
    }
    const res = await fetch(GITHUB_RAW_URL, {
      headers,
      signal: AbortSignal.timeout(5000)
    })
    if (res.ok) {
      cachedSnapshot = await res.json()
      cacheExpiry = now + 5 * 60 * 1000 // 5 min cache
      return cachedSnapshot
    }
  } catch {}

  // Fallback to bundled
  return BUNDLED_SNAPSHOT
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

  const SNAPSHOT = await getSnapshot()

  if (!SNAPSHOT) {
    return res.status(503).json({ error: 'No snapshot available' })
  }

  const { section, agent } = req.query

  if (section && SNAPSHOT[section] !== undefined) {
    return res.json({ [section]: SNAPSHOT[section], timestamp: SNAPSHOT.timestamp })
  }

  if (agent && SNAPSHOT.fullReports?.[agent]) {
    return res.json({
      report: SNAPSHOT.agentReports?.[agent] || null,
      fullReport: SNAPSHOT.fullReports[agent],
      session: SNAPSHOT.sessions?.byAgent?.[agent] || null,
      heartbeat: SNAPSHOT.sessions?.heartbeats?.[agent] || null,
      health: SNAPSHOT.fleetHealth?.agents?.find(a => a.name === agent) || null,
      governance: SNAPSHOT.governance?.agents?.find(a => a.name === agent) || null,
      timestamp: SNAPSHOT.timestamp
    })
  }

  const { fullReports, ...light } = SNAPSHOT
  res.json(light)
}
