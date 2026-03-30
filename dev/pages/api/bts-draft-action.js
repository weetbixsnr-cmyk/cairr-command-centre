/**
 * /api/bts-draft-action — Actions on BTS drafts
 * POST { id, action, content?, feedback? }
 * 
 * Actions:
 *   edit        — Sunny edits content (saves editedContent)
 *   approve     — "Good to Go" → status = approved
 *   publish     — Agent marks as published → status = visual-check-pending
 *   check-desktop — Tick desktop visual check
 *   check-mobile  — Tick mobile visual check
 *   reject      — Send back with feedback
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
      draft.editedBy = 'Sunny'
      draft.status = 'sunny-editing'
      draft.updatedAt = now
      break

    case 'approve':
      draft.status = 'approved'
      draft.approvedAt = now
      draft.updatedAt = now
      break

    case 'publish':
      // GBP posts go straight to published; blog/page drafts go to visual-check-pending
      draft.status = draft.type === 'gbp' ? 'published' : 'visual-check-pending'
      draft.publishedAt = now
      draft.updatedAt = now
      break

    case 'check-desktop':
      draft.desktopChecked = true
      draft.updatedAt = now
      if (draft.desktopChecked && draft.mobileChecked) {
        draft.status = 'signed-off'
        draft.signedOffAt = now
      }
      break

    case 'check-mobile':
      draft.mobileChecked = true
      draft.updatedAt = now
      if (draft.desktopChecked && draft.mobileChecked) {
        draft.status = 'signed-off'
        draft.signedOffAt = now
      }
      break

    case 'sign-off':
      draft.status = 'signed-off'
      draft.signedOffAt = now
      draft.updatedAt = now
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
