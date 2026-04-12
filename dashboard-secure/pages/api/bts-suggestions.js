/**
 * /api/bts-suggestions — BTS client suggestions endpoint
 * GET  → reads suggestions from GitHub API (persistent)
 * POST → writes suggestion via GitHub Contents API (commits to repo)
 *
 * Auth: requires bts-client-auth cookie (set by /api/bts-auth) or admin auth
 */

const REPO = 'weetbixsnr-cmyk/cairr-command-centre'
const BRANCH = 'agent/command-centre'
const FILE_PATH = 'data/bts-suggestions.json'
const API_URL = `https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`

const SESSION_TOKEN = process.env.BTS_SESSION_TOKEN
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const DISCORD_WEBHOOK = process.env.BTS_DISCORD_WEBHOOK || ''

async function notifyDiscord(text) {
  if (!DISCORD_WEBHOOK) return
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: '💡 New Suggestion from Sunny',
          description: text.length > 2000 ? text.slice(0, 2000) + '...' : text,
          color: 0x3b82f6,
          footer: { text: 'BTS Dashboard — Suggestion Box' },
          timestamp: new Date().toISOString()
        }]
      }),
      signal: AbortSignal.timeout(5000)
    })
  } catch (e) {
    console.error('Discord notify failed:', e.message)
  }
}

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/bts-client-auth=([^;]+)/)
  if (match && SESSION_TOKEN && match[1] === SESSION_TOKEN) return true
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  return false
}

async function readSuggestions() {
  // Use Contents API (always fresh)
  if (GITHUB_TOKEN) {
    try {
      const res = await fetch(`${API_URL}?ref=${BRANCH}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        signal: AbortSignal.timeout(5000)
      })
      if (res.ok) {
        const data = await res.json()
        return JSON.parse(Buffer.from(data.content, 'base64').toString())
      }
    } catch (e) {
      console.error('GitHub read failed:', e.message)
    }
  }
  return { suggestions: [] }
}

async function writeSuggestions(data) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured')

  // Get current file SHA (needed for updates)
  let sha = null
  try {
    const getRes = await fetch(`${API_URL}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      signal: AbortSignal.timeout(5000)
    })
    if (getRes.ok) {
      const existing = await getRes.json()
      sha = existing.sha
    }
  } catch {}

  const content = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64')
  const body = {
    message: `suggestion: new BTS suggestion from Sunny`,
    content,
    branch: BRANCH
  }
  if (sha) body.sha = sha

  const putRes = await fetch(API_URL, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000)
  })

  if (!putRes.ok) {
    const err = await putRes.text()
    throw new Error(`GitHub API error: ${putRes.status} ${err}`)
  }
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (req.method === 'GET') {
    const data = await readSuggestions()
    return res.json(data)
  }

  if (req.method === 'POST') {
    const { text } = req.body
    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Suggestion text required' })
    }

    try {
      const data = await readSuggestions()

      const suggestion = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        text: text.trim(),
        submittedAt: new Date().toISOString(),
        submittedBy: 'Sunny',
        status: 'new'
      }

      data.suggestions.unshift(suggestion)
      await writeSuggestions(data)

      // Notify Adam in #bts Discord
      await notifyDiscord(suggestion.text)

      return res.json({ ok: true, suggestion })
    } catch (e) {
      console.error('Suggestion save failed:', e.message)
      return res.status(500).json({ error: 'Failed to save: ' + e.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
