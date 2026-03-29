/**
 * /api/nbhw-suggestions — NBHW client suggestions endpoint
 * GET  → returns all suggestions
 * POST → create new suggestion
 */

import fs from 'fs'

const SUGGESTIONS_FILE = '/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/nbhw-suggestions.json'

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  return false
}

function readData() {
  try { return JSON.parse(fs.readFileSync(SUGGESTIONS_FILE, 'utf8')) } catch { return { suggestions: [] } }
}

function writeData(data) {
  fs.writeFileSync(SUGGESTIONS_FILE, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET') return res.json(readData())

  if (req.method === 'POST') {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Text required' })

    const data = readData()
    const suggestion = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text: text.trim(),
      submittedAt: new Date().toISOString(),
      submittedBy: 'Adam',
      status: 'new'
    }
    data.suggestions.unshift(suggestion)
    writeData(data)
    return res.json({ ok: true, suggestion })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
