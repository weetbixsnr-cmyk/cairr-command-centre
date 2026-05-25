/**
 * /api/nbhw-draft-action - update NBHW drafts in public/data/nbhw-status.json.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'nbhw-status.json')

import { isNbhwAuthed, canWriteJson } from '../../lib/auth'

function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) } catch { return { drafts: { drafts: [] } } }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isNbhwAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })
  if (!canWriteJson()) return res.status(503).json({ error: 'JSON writes disabled in this environment' })

  const { id, action, content, feedback } = req.body
  if (!id || !action) return res.status(400).json({ error: 'id and action required' })

  const data = readStatus()
  data.drafts = data.drafts || { drafts: [] }
  const draft = data.drafts.drafts.find(d => d.id === id)
  if (!draft) return res.status(404).json({ error: 'Draft not found' })

  const now = new Date().toISOString()
  switch (action) {
    case 'edit':
      draft.editedContent = content || draft.editedContent
      draft.editedBy = 'Adam'
      draft.status = 'editing'
      break
    case 'approve':
      draft.status = 'approved'
      draft.approvedAt = now
      break
    case 'publish':
      draft.status = 'visual-check-pending'
      draft.publishedAt = now
      break
    case 'check-desktop':
      draft.desktopChecked = true
      if (draft.desktopChecked && draft.mobileChecked) { draft.status = 'signed-off'; draft.signedOffAt = now }
      break
    case 'check-mobile':
      draft.mobileChecked = true
      if (draft.desktopChecked && draft.mobileChecked) { draft.status = 'signed-off'; draft.signedOffAt = now }
      break
    case 'reject':
      draft.status = 'draft'
      draft.feedback = feedback || 'Changes requested'
      break
    default:
      return res.status(400).json({ error: `Unknown action: ${action}` })
  }

  draft.updatedAt = now
  data.lastUpdated = now
  writeStatus(data)
  return res.json({ ok: true, draft })
}
