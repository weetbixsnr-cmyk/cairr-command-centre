/**
 * /api/nbhw-suggestions - NBHW suggestions backed by public/data/nbhw-status.json.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'nbhw-status.json')

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  return false
}

function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) } catch { return { suggestions: { suggestions: [] } } }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET') {
    const data = readStatus()
    return res.json(data.suggestions || { suggestions: [] })
  }

  if (req.method === 'POST') {
    const { text } = req.body
    if (!text || !text.trim()) return res.status(400).json({ error: 'Text required' })

    try {
      const data = readStatus()
      data.suggestions = data.suggestions || { suggestions: [] }
      const suggestion = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        submittedAt: new Date().toISOString(),
        submittedBy: 'Adam',
        status: 'new'
      }
      data.suggestions.suggestions.unshift(suggestion)
      data.lastUpdated = suggestion.submittedAt
      writeStatus(data)
      return res.json({ ok: true, suggestion })
    } catch (e) {
      console.error('Suggestion save failed:', e.message)
      return res.status(500).json({ error: 'Failed to save suggestion' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
