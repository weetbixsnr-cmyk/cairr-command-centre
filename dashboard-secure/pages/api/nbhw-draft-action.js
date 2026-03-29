/**
 * /api/nbhw-draft-action — Actions on NBHW drafts
 * POST { id, action, content?, feedback? }
 * Actions: edit, approve, publish, check-desktop, check-mobile, reject
 */

import fs from 'fs'

const DRAFTS_FILE = '/Users/cairr/.openclaw/agents/command-centre/workspace/dev/dashboard/nbhw-drafts.json'

function isAuthed(req) {
  const cookie = req.headers.cookie || ''
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === process.env.NBHW_DRAFT_API_KEY) return true
  return false
}

function readDrafts() {
  try { return JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8')) } catch { return { drafts: [] } }
}

function writeDrafts(data) {
  fs.writeFileSync(DRAFTS_FILE, JSON.stringify(data, null, 2))
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  const { id, action, content, feedback } = req.body
  if (!id || !action) return res.status(400).json({ error: 'id and action required' })

  const data = readDrafts()
  const draft = data.drafts.find(d => d.id === id)
  if (!draft) return res.status(404).json({ error: 'Draft not found' })

  const now = new Date().toISOString()

  switch (action) {
    case 'edit':
      draft.editedContent = content || draft.editedContent
      draft.editedBy = 'Adam'
      draft.status = 'editing'
      draft.updatedAt = now
      break
    case 'approve':
      draft.status = 'approved'
      draft.approvedAt = now
      draft.updatedAt = now
      break
    case 'publish':
      draft.status = 'visual-check-pending'
      draft.publishedAt = now
      draft.updatedAt = now
      break
    case 'check-desktop':
      draft.desktopChecked = true
      draft.updatedAt = now
      if (draft.desktopChecked && draft.mobileChecked) { draft.status = 'signed-off'; draft.signedOffAt = now }
      break
    case 'check-mobile':
      draft.mobileChecked = true
      draft.updatedAt = now
      if (draft.desktopChecked && draft.mobileChecked) { draft.status = 'signed-off'; draft.signedOffAt = now }
      break
    case 'reject':
      draft.status = 'draft'
      draft.feedback = feedback || 'Changes requested'
      draft.updatedAt = now
      break
    default:
      return res.status(400).json({ error: `Unknown action: ${action}` })
  }

  writeDrafts(data)
  return res.json({ ok: true, draft })
}
