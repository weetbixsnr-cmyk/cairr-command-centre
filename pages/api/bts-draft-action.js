/**
 * /api/bts-draft-action - update BTS drafts in public/data/bts-status.json.
 */

import fs from 'fs'
import path from 'path'

const STATUS_PATH = path.resolve(process.cwd(), 'public', 'data', 'bts-status.json')
const READINESS_PATH = path.resolve(process.cwd(), 'public', 'data', 'bts', 'readiness.json')
const DISCORD_WEBHOOK = process.env.BTS_DISCORD_WEBHOOK || ''

import { isBtsAuthed, canWriteJson } from '../../lib/auth'

function readStatus() {
  try { return JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8')) } catch { return { drafts: { drafts: [] }, notifications: { notifications: [] } } }
}

function writeStatus(data) {
  fs.writeFileSync(STATUS_PATH, JSON.stringify(data, null, 2) + '\n')
}

function readReadiness() {
  try { return JSON.parse(fs.readFileSync(READINESS_PATH, 'utf8')) } catch { return null }
}

async function notifyDiscord(title, description, color) {
  if (!DISCORD_WEBHOOK) return
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{ title, description: description.slice(0, 2000), color, timestamp: new Date().toISOString() }]
      }),
      signal: AbortSignal.timeout(5000)
    })
  } catch (e) {
    console.error('Discord notify failed:', e.message)
  }
}

function addNotification(data, message, draftTitle, action) {
  data.notifications = data.notifications || { notifications: [] }
  data.notifications.notifications.unshift({
    id: Date.now().toString(36),
    message,
    draftTitle,
    action,
    timestamp: new Date().toISOString(),
    seen: false
  })
  data.notifications.notifications = data.notifications.notifications.slice(0, 50)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isBtsAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })
  if (!canWriteJson()) return res.status(503).json({ error: 'JSON writes disabled in this environment' })

  const { id, action, content, feedback } = req.body
  if (!id || !action) return res.status(400).json({ error: 'id and action required' })

  const readiness = readReadiness()
  if (readiness?.gate === 'BLOCK' && ['approve', 'publish', 'sign-off', 'check-desktop', 'check-mobile'].includes(action)) {
    return res.status(423).json({
      error: 'Readiness gate is BLOCK. Approval, publish, and sign-off actions are disabled until stale or blocked BTS data sources are updated.',
      gate: readiness.gate,
      weekOf: readiness.weekOf
    })
  }

  try {
    const data = readStatus()
    data.drafts = data.drafts || { drafts: [] }
    const draft = data.drafts.drafts.find(d => d.id === id)
    if (!draft) return res.status(404).json({ error: 'Draft not found' })

    const now = new Date().toISOString()
    switch (action) {
      case 'edit':
        draft.editedContent = content || draft.editedContent
        draft.editedBy = 'Sunny'
        draft.status = 'sunny-editing'
        break
      case 'approve':
        if (content) {
          draft.editedContent = content
          draft.editedBy = 'Sunny'
        }
        draft.status = 'approved'
        draft.approvedAt = now
        addNotification(data, `Sunny approved: ${draft.title}`, draft.title, 'approve')
        await notifyDiscord('Sunny Approved a Post', `**${draft.title}**\nType: ${draft.type || 'blog'}`, 0x10b981)
        break
      case 'publish':
        draft.status = draft.type === 'gbp' ? 'published' : 'visual-check-pending'
        draft.publishedAt = now
        await notifyDiscord('Post Published', `**${draft.title}**\nType: ${draft.type || 'blog'}`, 0x3b82f6)
        break
      case 'check-desktop':
        draft.desktopChecked = true
        if (draft.desktopChecked && draft.mobileChecked) {
          draft.status = 'signed-off'
          draft.signedOffAt = now
        }
        break
      case 'check-mobile':
        draft.mobileChecked = true
        if (draft.desktopChecked && draft.mobileChecked) {
          draft.status = 'signed-off'
          draft.signedOffAt = now
        }
        break
      case 'sign-off':
        draft.status = 'signed-off'
        draft.signedOffAt = now
        break
      case 'reject':
        draft.status = 'draft'
        draft.feedback = feedback || 'Changes requested'
        addNotification(data, `Sunny requested changes: ${draft.title}`, draft.title, 'reject')
        await notifyDiscord('Sunny Requested Changes', `**${draft.title}**\nFeedback: ${draft.feedback || 'No details'}`, 0xef4444)
        break
      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }

    draft.updatedAt = now
    data.lastUpdated = now
    writeStatus(data)
    return res.json({ ok: true, draft })
  } catch (e) {
    console.error('Draft action failed:', e.message)
    return res.status(500).json({ error: 'Failed to update draft' })
  }
}
