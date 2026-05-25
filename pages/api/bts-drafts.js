/**
 * /api/bts-drafts - BTS draft management backed by public/data/bts-status.json.
 *
 * Manual JSON is the current source of truth. Project hooks are intentionally
 * not wired during this phase.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'bts-status.json')

import { isBtsAuthed, canWriteJson } from '../../lib/auth'

function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) } catch { return { drafts: { drafts: [] } } }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

export default async function handler(req, res) {
  if (!isBtsAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  if (req.method === 'GET') {
    const data = readStatus()
    return res.json(data.drafts || { drafts: [] })
  }

  if (req.method === 'POST') {
    if (!canWriteJson()) return res.status(503).json({ error: 'JSON writes disabled in this environment' })
    const { title, type, content, targetDate, author } = req.body
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
