/**
 * /api/bts-suggestions - BTS suggestions backed by public/data/bts-status.json.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'bts-status.json')
import { isBtsAuthed, canWriteJson } from '../../lib/auth'

const DISCORD_WEBHOOK = process.env.BTS_DISCORD_WEBHOOK || ''

function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) } catch { return { suggestions: { suggestions: [] } } }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

async function notifyDiscord(text) {
  if (!DISCORD_WEBHOOK) return
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [{ title: 'New Suggestion from Sunny', description: text.slice(0, 2000), color: 0x3b82f6, timestamp: new Date().toISOString() }] }),
      signal: AbortSignal.timeout(5000)
    })
  } catch (e) {
    console.error('Discord notify failed:', e.message)
  }
}

export default async function handler(req, res) {
  if (!isBtsAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET') {
    const data = readStatus()
    return res.json(data.suggestions || { suggestions: [] })
  }

  if (req.method === 'POST') {
    if (!canWriteJson()) return res.status(503).json({ error: 'JSON writes disabled in this environment' })
    const { text } = req.body
    if (!text || !text.trim()) return res.status(400).json({ error: 'Suggestion text required' })

    try {
      const data = readStatus()
      data.suggestions = data.suggestions || { suggestions: [] }
      const suggestion = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        submittedAt: new Date().toISOString(),
        submittedBy: 'Sunny',
        status: 'new'
      }
      data.suggestions.suggestions.unshift(suggestion)
      data.lastUpdated = suggestion.submittedAt
      writeStatus(data)
      await notifyDiscord(suggestion.text)
      return res.json({ ok: true, suggestion })
    } catch (e) {
      console.error('Suggestion save failed:', e.message)
      return res.status(500).json({ error: 'Failed to save: ' + e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
