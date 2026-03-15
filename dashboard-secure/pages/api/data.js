/**
 * /api/data — Single API endpoint for all dashboard data
 * Reads from Vercel Blob in production, falls back to bundled snapshot
 */

import fs from 'fs'
import path from 'path'
import { list } from '@vercel/blob'

const IS_VERCEL = process.env.VERCEL === '1'

// Bundled snapshot as last-resort fallback
let BUNDLED_SNAPSHOT = null
try {
  const bundledPath = path.resolve(process.cwd(), 'public', 'snapshot.json')
  if (fs.existsSync(bundledPath)) {
    BUNDLED_SNAPSHOT = JSON.parse(fs.readFileSync(bundledPath, 'utf8'))
  }
} catch {}

async function getSnapshot() {
  // 1. Try Vercel Blob (live data, updated every 5 min by Mac Mini cron)
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { blobs } = await list({ prefix: 'dashboard-snapshot', limit: 10, token: process.env.BLOB_READ_WRITE_TOKEN })
      // Get the most recently uploaded blob
      if (blobs.length > 0) {
        const latest = blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))[0]
        const res = await fetch(latest.url)
        if (res.ok) {
          return await res.json()
        }
      }
    } catch (e) {
      console.error('Blob read failed:', e.message)
    }
  }

  // 2. Try local snapshot file (dev mode on Mac Mini)
  if (!IS_VERCEL) {
    const snapshotPath = path.resolve(process.cwd(), '..', 'dev', 'snapshots', 'latest.json')
    try {
      const raw = fs.readFileSync(snapshotPath, 'utf8')
      return JSON.parse(raw)
    } catch {}
  }

  // 3. Fall back to bundled snapshot (baked into deploy — stale but better than empty)
  if (BUNDLED_SNAPSHOT) {
    return { ...BUNDLED_SNAPSHOT, _source: 'bundled', _stale: true }
  }

  return null
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300')
  
  try {
    const snapshot = await getSnapshot()
    if (!snapshot) {
      return res.status(503).json({ error: 'No snapshot available', hint: 'Run push-snapshot.js to generate' })
    }

    const { section, agent } = req.query

    if (section && snapshot[section] !== undefined) {
      return res.json({ [section]: snapshot[section], timestamp: snapshot.timestamp })
    }

    if (agent && snapshot.fullReports?.[agent]) {
      return res.json({
        report: snapshot.agentReports?.[agent] || null,
        fullReport: snapshot.fullReports[agent],
        session: snapshot.sessions?.byAgent?.[agent] || null,
        heartbeat: snapshot.sessions?.heartbeats?.[agent] || null,
        health: snapshot.fleetHealth?.agents?.find(a => a.name === agent) || null,
        governance: snapshot.governance?.agents?.find(a => a.name === agent) || null,
        timestamp: snapshot.timestamp
      })
    }

    const { fullReports, ...light } = snapshot
    res.json(light)
  } catch (e) {
    res.status(500).json({ error: 'Failed to read dashboard data', detail: e.message })
  }
}
