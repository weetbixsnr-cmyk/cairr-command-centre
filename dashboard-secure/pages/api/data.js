/**
 * /api/data — Single API endpoint for all dashboard data
 * Reads from Vercel KV in production, falls back to local snapshot file
 * 
 * Query params:
 *   ?section=fleetHealth     — just fleet health
 *   ?section=governance      — just governance
 *   ?section=actionQueue     — just action queue
 *   ?section=sessions        — just sessions
 *   ?section=agentReports    — all agent reports
 *   ?agent=bts               — include full report for specific agent
 *   (no params)              — returns everything
 */

import fs from 'fs'
import path from 'path'

// In production (Vercel), use KV. Locally, read snapshot file.
// Fallback chain: KV → local file → bundled static snapshot
const IS_VERCEL = process.env.VERCEL === '1'

// Try to load bundled snapshot at build time (baked into deploy)
let BUNDLED_SNAPSHOT = null
try {
  const bundledPath = path.resolve(process.cwd(), 'public', 'snapshot.json')
  if (fs.existsSync(bundledPath)) {
    BUNDLED_SNAPSHOT = JSON.parse(fs.readFileSync(bundledPath, 'utf8'))
  }
} catch {}

async function getSnapshot() {
  // 1. Try Vercel KV (live data, updated every 5 min by Mac Mini cron)
  if (IS_VERCEL && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/dashboard:snapshot`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      })
      const data = await res.json()
      if (data.result) {
        return JSON.parse(data.result)
      }
    } catch {}
  }

  // 2. Try local snapshot file (dev mode on Mac Mini)
  const snapshotPath = path.resolve(process.cwd(), '..', 'dev', 'snapshots', 'latest.json')
  try {
    const raw = fs.readFileSync(snapshotPath, 'utf8')
    return JSON.parse(raw)
  } catch {}

  // 3. Fall back to bundled snapshot (baked into deploy — stale but better than empty)
  if (BUNDLED_SNAPSHOT) {
    return { ...BUNDLED_SNAPSHOT, _source: 'bundled', _stale: true }
  }

  return null
}

export default async function handler(req, res) {
  try {
    const snapshot = await getSnapshot()
    if (!snapshot) {
      return res.status(503).json({ error: 'No snapshot available', hint: 'Run push-snapshot.js to generate' })
    }

    const { section, agent } = req.query

    // If specific section requested, return just that
    if (section && snapshot[section] !== undefined) {
      return res.json({ [section]: snapshot[section], timestamp: snapshot.timestamp })
    }

    // If specific agent requested, include full report
    if (agent && snapshot.fullReports?.[agent]) {
      const agentData = {
        report: snapshot.agentReports?.[agent] || null,
        fullReport: snapshot.fullReports[agent],
        session: snapshot.sessions?.byAgent?.[agent] || null,
        heartbeat: snapshot.sessions?.heartbeats?.[agent] || null,
        health: snapshot.fleetHealth?.agents?.find(a => a.name === agent) || null,
        governance: snapshot.governance?.agents?.find(a => a.name === agent) || null,
        timestamp: snapshot.timestamp
      }
      return res.json(agentData)
    }

    // Return full snapshot (minus full reports to keep payload small)
    const { fullReports, ...light } = snapshot
    res.json(light)
  } catch (e) {
    res.status(500).json({ error: 'Failed to read dashboard data', detail: e.message })
  }
}
