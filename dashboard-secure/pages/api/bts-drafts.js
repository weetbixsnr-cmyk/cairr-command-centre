/**
 * /api/bts-drafts — BTS Future Posts draft management
 * GET  → returns all drafts
 * POST → create new draft (from BTS agent)
 * 
 * Auth: requires bts-client-auth or dashboard-auth cookie
 */

import fs from 'fs'

const DRAFTS_FILE = '/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/bts-drafts.json'

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const match = cookie.match(/bts-client-auth=([^;]+)/)
  const SESSION_TOKEN = process.env.BTS_SESSION_TOKEN
  if (match && SESSION_TOKEN && match[1] === SESSION_TOKEN) return true
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  // Allow agent POST with API key
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === process.env.BTS_DRAFT_API_KEY) return true
  return false
}

function readDrafts() {
  try { return JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8')) } catch { return { drafts: [] } }
}

function writeDrafts(data) {
  fs.writeFileSync(DRAFTS_FILE, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  if (!isAuthed(req)) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  if (req.method === 'GET') {
    return res.json(readDrafts())
  }

  if (req.method === 'POST') {
    const { title, type, content, targetDate, author } = req.body
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' })
    }

    const data = readDrafts()
    const draft = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title,
      type: type || 'blog',
      content,
      targetDate: targetDate || null,
      author: author || 'BTS Agent',
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      editedContent: null,
      editedBy: null,
      approvedAt: null,
      publishedAt: null,
      desktopChecked: false,
      mobileChecked: false,
      signedOffAt: null,
      feedback: null
    }

    data.drafts.unshift(draft)
    writeDrafts(data)

    return res.json({ ok: true, draft })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
