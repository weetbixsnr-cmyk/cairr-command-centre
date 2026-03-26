/**
 * /api/bts-suggestions — BTS client suggestions endpoint
 * GET  → returns all suggestions from snapshot
 * POST → writes suggestion to local file (via snapshot push)
 * 
 * Auth: requires bts-client-auth cookie (set by /api/bts-auth)
 */

import fs from 'fs'
import path from 'path'

const SUGGESTIONS_FILE = '/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/bts-suggestions.json'
const SESSION_TOKEN = process.env.BTS_SESSION_TOKEN

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/bts-client-auth=([^;]+)/)
  if (match && SESSION_TOKEN && match[1] === SESSION_TOKEN) return true
  // Also allow admin auth (main dashboard auth)
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  return false
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (req.method === 'GET') {
    try {
      const data = JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, 'utf8'))
      return res.json(data)
    } catch {
      return res.json({ suggestions: [] })
    }
  }

  if (req.method === 'POST') {
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Suggestion text required' })
    }

    try {
      let data = { suggestions: [] }
      try { data = JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, 'utf8')) } catch {}

      const suggestion = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        submittedAt: new Date().toISOString(),
        submittedBy: 'Sunny',
        status: 'new'
      }

      data.suggestions.unshift(suggestion)
      fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(data, null, 2))

      return res.json({ ok: true, suggestion })
    } catch (e) {
      return res.status(500).json({ error: 'Failed to save suggestion' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
