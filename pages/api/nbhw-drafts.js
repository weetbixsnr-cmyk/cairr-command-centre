/**
 * /api/nbhw-drafts - NBHW drafts backed by public/data/nbhw-status.json.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'nbhw-status.json')

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === process.env.NBHW_DRAFT_API_KEY) return true
  return false
}

function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) } catch { return { drafts: { drafts: [] } } }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

export default async function handler(req, res) {
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET') {
    const data = readStatus()
    return res.json(data.drafts || { drafts: [] })
  }

  if (req.method === 'POST') {
    const { title, type, content, targetDate, author, photos } = req.body
    if (!title || !content) return res.status(400).json({ error: 'Title and content required' })

    const data = readStatus()
    data.drafts = data.drafts || { drafts: [] }
    const draft = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title,
      type: type || 'blog',
      content,
      targetDate: targetDate || null,
      author: author || 'Manual',
      photos: photos || [],
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
    data.drafts.drafts.unshift(draft)
    data.lastUpdated = draft.updatedAt
    writeStatus(data)
    return res.json({ ok: true, draft })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
