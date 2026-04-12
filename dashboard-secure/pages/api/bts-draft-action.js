/**
 * /api/bts-draft-action — Actions on BTS drafts (persistent via GitHub API)
 * POST { id, action, content?, feedback? }
 *
 * Actions:
 *   edit        — Sunny edits content (saves editedContent)
 *   approve     — "Good to Go" → status = approved
 *   publish     — Agent marks as published → status = visual-check-pending
 *   check-desktop — Tick desktop visual check
 *   check-mobile  — Tick mobile visual check
 *   reject      — Send back with feedback
 *
 * On approve/reject: also writes to data/bts-notifications.json so Adam sees it
 */

const REPO = 'weetbixsnr-cmyk/cairr-command-centre'
const BRANCH = 'agent/command-centre'
const DRAFTS_PATH = 'data/bts-drafts.json'
const NOTIFICATIONS_PATH = 'data/bts-notifications.json'
const RAW_BASE = `https://raw.githubusercontent.com/${REPO}/${BRANCH}`
const API_BASE = `https://api.github.com/repos/${REPO}/contents`

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const DISCORD_WEBHOOK = process.env.BTS_DISCORD_WEBHOOK || ''

async function notifyDiscord(title, description, color) {
  if (!DISCORD_WEBHOOK) return
  try {
    await fetch(DISCORD_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title,
          description: description.length > 2000 ? description.slice(0, 2000) + '...' : description,
          color,
          footer: { text: 'BTS Dashboard — Content Review' },
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
  const SESSION_TOKEN = process.env.BTS_SESSION_TOKEN
  if (match && SESSION_TOKEN && match[1] === SESSION_TOKEN) return true
  const adminCookie = cookie.match(/dashboard-auth=([^;]+)/)
  if (adminCookie) return true
  const apiKey = req.headers['x-api-key']
  if (apiKey && apiKey === process.env.BTS_DRAFT_API_KEY) return true
  return false
}

async function readGitHub(filePath) {
  try {
    const headers = { 'Cache-Control': 'no-cache' }
    if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`
    const res = await fetch(`${RAW_BASE}/${filePath}`, { headers, signal: AbortSignal.timeout(5000) })
    if (res.ok) return await res.json()
  } catch {}
  return null
}

async function writeGitHub(filePath, data, commitMsg) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN not configured')

  let sha = null
  try {
    const getRes = await fetch(`${API_BASE}/${filePath}?ref=${BRANCH}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}` },
      signal: AbortSignal.timeout(5000)
    })
    if (getRes.ok) {
      const existing = await getRes.json()
      sha = existing.sha
    }
  } catch {}

  const content = Buffer.from(JSON.stringify(data, null, 2) + '\n').toString('base64')
  const body = { message: commitMsg, content, branch: BRANCH }
  if (sha) body.sha = sha

  const putRes = await fetch(`${API_BASE}/${filePath}`, {
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

async function addNotification(message, draftTitle, action) {
  try {
    const existing = await readGitHub(NOTIFICATIONS_PATH) || { notifications: [] }
    existing.notifications.unshift({
      id: Date.now().toString(36),
      message,
      draftTitle,
      action,
      timestamp: new Date().toISOString(),
      seen: false
    })
    // Keep last 50 notifications
    existing.notifications = existing.notifications.slice(0, 50)
    await writeGitHub(NOTIFICATIONS_PATH, existing, `notify: ${message}`)
  } catch (e) {
    console.error('Notification failed:', e.message)
    // Don't block the main action if notification fails
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })
  if (!isAuthed(req)) return res.status(401).json({ error: 'Not authenticated' })

  const { id, action, content, feedback } = req.body
  if (!id || !action) return res.status(400).json({ error: 'id and action required' })

  try {
    const data = await readGitHub(DRAFTS_PATH) || { drafts: [] }
    const draft = data.drafts.find(d => d.id === id)
    if (!draft) return res.status(404).json({ error: 'Draft not found' })

    const now = new Date().toISOString()
    let commitMsg = `draft: ${action} on "${draft.title}"`

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
        commitMsg = `approved: Sunny approved "${draft.title}"`
        break

      case 'publish':
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
        commitMsg = `rejected: Sunny requested changes on "${draft.title}"`
        break

      default:
        return res.status(400).json({ error: `Unknown action: ${action}` })
    }

    await writeGitHub(DRAFTS_PATH, data, commitMsg)

    // Send notification for approve/reject actions
    if (action === 'approve') {
      await addNotification(`Sunny approved: ${draft.title}`, draft.title, 'approve')
      await notifyDiscord('✅ Sunny Approved a Post', `**${draft.title}**\nType: ${draft.type || 'blog'}`, 0x10b981)
    } else if (action === 'reject') {
      await addNotification(`Sunny requested changes: ${draft.title}`, draft.title, 'reject')
      await notifyDiscord('↩️ Sunny Requested Changes', `**${draft.title}**\nFeedback: ${draft.feedback || 'No details'}`, 0xef4444)
    } else if (action === 'edit') {
      await addNotification(`Sunny edited: ${draft.title}`, draft.title, 'edit')
      const preview = (draft.editedContent || '').slice(0, 500)
      await notifyDiscord('✏️ Sunny Edited a Post', `**${draft.title}**\n\n>>> ${preview}${preview.length >= 500 ? '...' : ''}`, 0xf59e0b)
    } else if (action === 'publish') {
      await notifyDiscord('🚀 Post Published', `**${draft.title}**\nType: ${draft.type || 'blog'}`, 0x3b82f6)
    } else if (action === 'sign-off') {
      await notifyDiscord('🏁 Post Signed Off', `**${draft.title}**\nType: ${draft.type || 'blog'}`, 0xa855f7)
    } else if (action === 'check-desktop' || action === 'check-mobile') {
      const check = action === 'check-desktop' ? 'Desktop' : 'Mobile'
      if (draft.desktopChecked && draft.mobileChecked) {
        await notifyDiscord('🏁 Visual Check Complete — Signed Off', `**${draft.title}**\nBoth desktop and mobile verified.`, 0xa855f7)
      }
    }

    return res.json({ ok: true, draft })
  } catch (e) {
    console.error('Draft action failed:', e.message)
    return res.status(500).json({ error: 'Failed to update draft' })
  }
}
