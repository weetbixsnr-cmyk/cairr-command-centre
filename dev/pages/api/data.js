/**
 * /api/data — Single API endpoint for all dashboard data
 * Reads from bundled public/snapshot.json (updated by deploy-time cron)
 */

import fs from 'fs'
import path from 'path'

let SNAPSHOT = null
try {
  const bundledPath = path.resolve(process.cwd(), 'public', 'snapshot.json')
  if (fs.existsSync(bundledPath)) {
    SNAPSHOT = JSON.parse(fs.readFileSync(bundledPath, 'utf8'))
  }
} catch {}

export default async function handler(req, res) {
  // Short cache — snapshot updates with each deploy (~5 min)
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')

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
