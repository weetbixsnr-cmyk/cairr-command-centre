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
const IS_VERCEL = process.env.VERCEL === '1'

async function getSnapshot() {
  if (IS_VERCEL && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // Read from Vercel KV (Upstash Redis REST)
    const res = await fetch(`${process.env.KV_REST_API_URL}/get/dashboard:snapshot`, {
      headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
    })
    const data = await res.json()
    if (data.result) {
      return JSON.parse(data.result)
    }
    return null
  }

  // Fallback — read from bundled public/snapshot.json (works on Vercel + local)
  const publicPath = path.resolve(process.cwd(), 'public', 'snapshot.json')
  try {
    const raw = fs.readFileSync(publicPath, 'utf8')
    return JSON.parse(raw)
  } catch {
    // Final fallback — local dev path
    const devPath = path.resolve(process.cwd(), '..', 'dev', 'snapshots', 'latest.json')
    try {
      const raw = fs.readFileSync(devPath, 'utf8')
      return JSON.parse(raw)
    } catch {
      return null
    }
  }
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
